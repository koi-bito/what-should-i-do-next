import { Router } from "express";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { integrations } from "../../lib/schema";
import { eq, and } from "drizzle-orm";
import { encrypt } from "../../lib/crypto";
import { syncQueue } from "../../worker/worker";
import type { AuthedRequest } from "../../middleware/require-auth";

export const integrationRouter = Router();

// GET /integrations
integrationRouter.get(
  "/",
  rateLimit("integrations-list", 30, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const rows = await db
        .select({
          id: integrations.id,
          provider: integrations.provider,
          scope: integrations.scope,
          lastSyncedAt: integrations.lastSyncedAt,
          syncStatus: integrations.syncStatus,
          createdAt: integrations.createdAt,
          // Never return encrypted tokens to the client
        })
        .from(integrations)
        .where(eq(integrations.userId, req.userId!));

      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// POST /integrations/:provider/connect — Start OAuth flow
integrationRouter.post(
  "/:provider/connect",
  rateLimit("integration-connect", 10, 60),
  async (req: AuthedRequest, res) => {
    const provider = req.params.provider;
    const validProviders = [
      "google_calendar",
      "todoist",
      "notion",
      "ticktick",
    ];

    if (!validProviders.includes(provider)) {
      res.status(400).json({
        error: {
          code: "INVALID_PROVIDER",
          message: `Provider must be one of: ${validProviders.join(", ")}`,
        },
      });
      return;
    }

    // TODO: Generate real OAuth URLs per provider
    // For now return a placeholder redirect
    const state = Buffer.from(
      JSON.stringify({ userId: req.userId, provider })
    ).toString("base64");

    let authUrl = "";
    switch (provider) {
      case "google_calendar":
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.API_URL || "http://localhost:8080"}/api/v1/integrations/google_calendar/callback`)}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&access_type=offline&state=${state}&prompt=consent`;
        break;
      case "todoist":
        authUrl = `https://todoist.com/oauth/authorize?client_id=${process.env.TODOIST_CLIENT_ID}&scope=data:read,data:read_write&state=${state}`;
        break;
      default:
        authUrl = `#integration-${provider}-not-yet-configured`;
    }

    res.json({ url: authUrl });
  }
);

// DELETE /integrations/:provider — Disconnect
integrationRouter.delete(
  "/:provider",
  rateLimit("integration-disconnect", 10, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      await db
        .delete(integrations)
        .where(
          and(
            eq(integrations.userId, req.userId!),
            eq(integrations.provider, req.params.provider as "google_calendar" | "todoist" | "notion" | "ticktick")
          )
        );

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// GET /integrations/:provider/callback — OAuth Callback
integrationRouter.get("/:provider/callback", async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      res.redirect(`${process.env.WEB_APP_ORIGIN || "http://localhost:3000"}/app/settings?tab=integrations&error=${error}`);
      return;
    }

    if (!code || !state) {
      res.status(400).send("Missing code or state");
      return;
    }

    // Decode state
    let decodedState;
    try {
      const decodedStr = Buffer.from(state as string, "base64").toString("utf8");
      decodedState = JSON.parse(decodedStr);
    } catch {
      res.status(400).send("Invalid state parameter");
      return;
    }

    const userId = decodedState.userId;
    if (!userId) {
      res.status(400).send("Invalid user ID in state");
      return;
    }

    let accessToken = "";
    let refreshToken = "";
    let scope = "";
    let expiresAt: Date | undefined;

    if (provider === "google_calendar") {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.API_URL || "http://localhost:8080"}/api/v1/integrations/google_calendar/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Google token exchange failed:", errorData);
        res.redirect(`${process.env.WEB_APP_ORIGIN || "http://localhost:3000"}/app/settings?tab=integrations&error=token_exchange_failed`);
        return;
      }

      const data = (await tokenResponse.json()) as any;
      accessToken = data.access_token;
      refreshToken = data.refresh_token || "";
      scope = data.scope;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000);
      }
    } else if (provider === "todoist") {
      const tokenResponse = await fetch("https://todoist.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.TODOIST_CLIENT_ID || "",
          client_secret: process.env.TODOIST_CLIENT_SECRET || "",
          code: code as string,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Todoist token exchange failed:", errorData);
        res.redirect(`${process.env.WEB_APP_ORIGIN || "http://localhost:3000"}/app/settings?tab=integrations&error=token_exchange_failed`);
        return;
      }

      const data = (await tokenResponse.json()) as any;
      accessToken = data.access_token;
      // Todoist tokens don't expire typically, no refresh token.
    } else {
      res.status(400).send("Unsupported provider");
      return;
    }

    // Save to database
    await db
      .insert(integrations)
      .values({
        userId,
        provider: provider as any,
        accessTokenEncrypted: encrypt(accessToken),
        refreshTokenEncrypted: refreshToken ? encrypt(refreshToken) : null,
        scope,
        expiresAt,
        syncStatus: "connected",
      })
      .onConflictDoUpdate({
        target: [integrations.userId, integrations.provider],
        set: {
          accessTokenEncrypted: encrypt(accessToken),
          refreshTokenEncrypted: refreshToken ? encrypt(refreshToken) : undefined, // only update refresh token if provided
          scope,
          expiresAt,
          syncStatus: "connected",
        },
      });

    // Enqueue an initial sync
    await syncQueue.add(`initial-sync-${provider}-${userId}`, {
      userId,
      provider,
    });

    res.redirect(`${process.env.WEB_APP_ORIGIN || "http://localhost:3000"}/app/settings?tab=integrations`);
  } catch (err) {
    next(err);
  }
});
