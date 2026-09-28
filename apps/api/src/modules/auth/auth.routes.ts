import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "../../middleware/rate-limit";
import { supabaseAdmin } from "../../lib/supabase-admin";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /auth/signup
authRouter.post(
  "/signup",
  rateLimit("signup", 5, 60),
  async (req, res, next) => {
    try {
      const { email, password } = credentialsSchema.parse(req.body);

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });

      if (error) {
        res
          .status(400)
          .json({ error: { code: "SIGNUP_FAILED", message: error.message } });
        return;
      }

      res.status(201).json({ userId: data.user.id });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
authRouter.post(
  "/login",
  rateLimit("login", 10, 60),
  async (req, res, next) => {
    try {
      const { email, password } = credentialsSchema.parse(req.body);

      const { data, error } =
        await supabaseAdmin.auth.signInWithPassword({ email, password });

      if (error) {
        res.status(401).json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email or password is incorrect",
          },
        });
        return;
      }

      res.cookie("refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        accessToken: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/refresh
authRouter.post(
  "/refresh",
  rateLimit("refresh", 30, 60),
  async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refresh_token as string | undefined;

      if (!refreshToken) {
        res.status(401).json({
          error: { code: "UNAUTHENTICATED", message: "No refresh token" },
        });
        return;
      }

      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        res.status(401).json({
          error: { code: "INVALID_TOKEN", message: "Refresh token invalid" },
        });
        return;
      }

      res.cookie("refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken: data.session.access_token });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/logout
authRouter.post("/logout", rateLimit("logout", 30, 60), async (req, res) => {
  res.clearCookie("refresh_token");
  res.json({ ok: true });
});
