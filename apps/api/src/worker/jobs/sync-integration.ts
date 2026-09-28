import { db } from "../../lib/db";
import { integrations } from "../../lib/schema";
import { and, eq } from "drizzle-orm";

export async function syncIntegration(
  userId: string,
  provider: string
): Promise<void> {
  // TODO: Implement per-provider sync logic
  // Google Calendar: fetch today's events, cache in Redis
  // Todoist: incremental sync via delta API
  // Notion: poll selected database
  // TickTick: full poll

  // eslint-disable-next-line no-console
  console.log(`[sync-integration] Syncing ${provider} for user ${userId}`);

  await db
    .update(integrations)
    .set({ lastSyncedAt: new Date(), syncStatus: "connected" })
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.provider, provider as "google_calendar" | "todoist" | "notion" | "ticktick")
      )
    );
}
