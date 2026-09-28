import { Router } from "express";
import { rateLimit } from "../../middleware/rate-limit";
import { db } from "../../lib/db";
import { subscriptions } from "../../lib/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import type { AuthedRequest } from "../../middleware/require-auth";

export const subscriptionRouter = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// GET /subscriptions/me
subscriptionRouter.get(
  "/me",
  rateLimit("sub-get", 60, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, req.userId!));

      if (!sub) {
        // Return free tier defaults
        res.json({
          plan: "free",
          status: "active",
          queriesLimit: 5,
        });
        return;
      }

      res.json(sub);
    } catch (err) {
      next(err);
    }
  }
);

// POST /subscriptions/checkout — Create Stripe Checkout session
subscriptionRouter.post(
  "/checkout",
  rateLimit("sub-checkout", 5, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!stripe) {
        res.status(503).json({
          error: {
            code: "STRIPE_NOT_CONFIGURED",
            message: "Stripe not configured",
          },
        });
        return;
      }

      const priceId =
        req.body.plan === "team"
          ? process.env.STRIPE_PRICE_ID_TEAM
          : process.env.STRIPE_PRICE_ID_PRO;

      if (!priceId) {
        res.status(503).json({
          error: { code: "PRICE_NOT_CONFIGURED", message: "Price not set" },
        });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.WEB_APP_ORIGIN}/app/settings/billing?success=1`,
        cancel_url: `${process.env.WEB_APP_ORIGIN}/app/settings/billing?canceled=1`,
        metadata: { userId: req.userId! },
      });

      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
);

// POST /subscriptions/portal — Customer portal
subscriptionRouter.post(
  "/portal",
  rateLimit("sub-portal", 5, 60),
  async (req: AuthedRequest, res, next) => {
    try {
      if (!stripe) {
        res.status(503).json({
          error: { code: "STRIPE_NOT_CONFIGURED", message: "Stripe not configured" },
        });
        return;
      }

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, req.userId!));

      if (!sub?.stripeCustomerId) {
        res.status(400).json({
          error: { code: "NO_SUBSCRIPTION", message: "No active subscription" },
        });
        return;
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${process.env.WEB_APP_ORIGIN}/app/settings/billing`,
      });

      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
);
