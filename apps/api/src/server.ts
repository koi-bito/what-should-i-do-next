import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { authRouter } from "./modules/auth/auth.routes";
import { queryRouter } from "./modules/queries/query.routes";
import { actionRouter } from "./modules/actions/action.routes";
import { taskRouter } from "./modules/tasks/task.routes";
import { userRouter } from "./modules/users/user.routes";
import { goalRouter } from "./modules/goals/goal.routes";
import { subscriptionRouter } from "./modules/billing/subscription.routes";
import { stripeWebhookRouter } from "./modules/billing/stripe-webhook.routes";
import { integrationRouter } from "./modules/integrations/integration.routes";
import { errorHandler } from "./middleware/error-handler";
import { requireAuth } from "./middleware/require-auth";

export const app = express();

// Security
app.use(helmet());
app.set("trust proxy", 1);

// CORS — allow configured origins with credentials
const allowedOrigins = (process.env.WEB_APP_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// Structured logging
if (process.env.NODE_ENV !== "test") {
  app.use(
    pinoHttp({
      redact: ["req.headers.authorization", "req.body.password"],
    })
  );
}

// Stripe webhook MUST come before express.json() — needs raw body
app.use("/api/v1/webhooks/stripe", stripeWebhookRouter);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ── Public routes ────────────────────────────────────────
app.use("/api/v1/auth", authRouter);

// ── Authenticated routes ─────────────────────────────────
app.use("/api/v1/queries", requireAuth, queryRouter);
app.use("/api/v1/actions", requireAuth, actionRouter);
app.use("/api/v1/tasks", requireAuth, taskRouter);
app.use("/api/v1/users", requireAuth, userRouter);
app.use("/api/v1/users/me/goals", requireAuth, goalRouter);
app.use("/api/v1/subscriptions", requireAuth, subscriptionRouter);
app.use("/api/v1/integrations", requireAuth, integrationRouter);

// ── Health check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────
if (require.main === module) {
  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ API listening on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(`   Health: http://localhost:${port}/health`);
  });
}
