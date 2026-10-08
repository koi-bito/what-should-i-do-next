import { Router } from "express";
import express from "express";
import Stripe from "stripe";
import { db } from "../../lib/db";
import { subscriptions, profiles } from "../../lib/schema";
import { eq } from "drizzle-orm";

export const stripeWebhookRouter = Router();

// Raw body required for signature verification — do NOT apply express.json() to this route
stripeWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.json({ received: true, skipped: "stripe not configured" });
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch {
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          if (!userId || !session.customer) break;

          // Create or update subscription record
          await db
            .insert(subscriptions)
            .values({
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string | null,
              plan: "pro",
              status: "active",
            })
            .onConflictDoUpdate({
              target: subscriptions.userId,
              set: {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string | null,
                plan: "pro",
                status: "active",
                updatedAt: new Date(),
              },
            });

          // Update profile tier
          await db
            .update(profiles)
            .set({ tier: "pro", updatedAt: new Date() })
            .where(eq(profiles.id, userId));

          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.created": {
          const sub = event.data.object as Stripe.Subscription;
          const plan =
            (sub.items.data[0]?.price.lookup_key as "pro" | "team") ?? "pro";

          await db
            .update(subscriptions)
            .set({
              status: sub.status as "active" | "past_due" | "canceled" | "trialing",
              plan,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, sub.id));
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;

          const [updated] = await db
            .update(subscriptions)
            .set({ status: "canceled", plan: "free", updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, sub.id))
            .returning();

          if (updated) {
            await db
              .update(profiles)
              .set({ tier: "free", updatedAt: new Date() })
              .where(eq(profiles.id, updated.userId));
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            await db
              .update(subscriptions)
              .set({ status: "past_due", updatedAt: new Date() })
              .where(
                eq(subscriptions.stripeSubscriptionId, invoice.subscription as string)
              );
          }
          break;
        }
      }
    } catch (err) {
      console.error("[stripe-webhook] handler error:", err);
      res.status(500).json({ error: "Webhook handler failed" });
      return;
    }

    res.json({ received: true });
  }
);
