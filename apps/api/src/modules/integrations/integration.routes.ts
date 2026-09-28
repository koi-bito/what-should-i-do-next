import { Router } from "express";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { integrations } from "../../lib/schema";
import { eq, and } from "drizzle-orm";
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
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.WEB_APP_ORIGIN}/api/integrations/google_calendar/callback`)}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&access_type=offline&state=${state}`;
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
