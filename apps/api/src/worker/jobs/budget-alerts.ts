import { db } from "../../lib/db";
import { queries } from "../../lib/schema";
import { gte, sql } from "drizzle-orm";
import * as Sentry from "@sentry/node";

const DAILY_BUDGET_USD = 10.00;

export async function checkBudgetAlerts(): Promise<void> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayStart = new Date(`${todayStr}T00:00:00.000Z`);

  const [result] = await db
    .select({ totalCost: sql<number>`SUM(cost_usd)` })
    .from(queries)
    .where(gte(queries.createdAt, todayStart));

  const totalCost = Number(result?.totalCost || 0);
  console.log(`[budget-alerts] Today's LLM cost so far: $${totalCost.toFixed(4)}`);

  if (totalCost >= DAILY_BUDGET_USD) {
    const msg = `🚨 DAILY LLM BUDGET EXCEEDED: $${totalCost.toFixed(4)} (Budget: $${DAILY_BUDGET_USD})`;
    console.warn(`[budget-alerts] ${msg}`);
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(msg, "warning");
    }
  }
}
