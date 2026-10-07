import { db } from "../../lib/db";
import { integrations, tasks } from "../../lib/schema";
import { and, eq } from "drizzle-orm";
import { decrypt } from "../../lib/crypto";

export async function syncIntegration(
  userId: string,
  provider: string
): Promise<void> {
  console.log(`[sync-integration] Syncing ${provider} for user ${userId}`);

  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.provider, provider as "google_calendar" | "todoist" | "notion" | "ticktick")
      )
    );

  if (!integration) {
    console.log(`[sync-integration] Integration ${provider} not found for user ${userId}`);
    return;
  }

  const accessToken = decrypt(integration.accessTokenEncrypted);

  try {
    if (provider === "google_calendar") {
      // Sync Google Calendar (Today's events)
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
      url.searchParams.append("timeMin", now.toISOString());
      url.searchParams.append("timeMax", endOfDay.toISOString());
      url.searchParams.append("singleEvents", "true");
      url.searchParams.append("orderBy", "startTime");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Google API error: ${res.statusText}`);

      const data = await res.json();
      const events = data.items || [];
      const fetchedIds = new Set<string>();

      for (const event of events) {
        if (!event.start?.dateTime || !event.end?.dateTime) continue;

        fetchedIds.add(event.id);
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const estimatedMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        await db
          .insert(tasks)
          .values({
            userId,
            title: event.summary || "Busy",
            source: "calendar",
            externalId: event.id,
            estimatedMinutes,
            dueAt: startTime,
            status: "open",
          })
          .onConflictDoUpdate({
            target: [tasks.userId, tasks.source, tasks.externalId],
            set: {
              title: event.summary || "Busy",
              estimatedMinutes,
              dueAt: startTime,
              updatedAt: new Date(),
              status: "open",
            },
          });
      }

      // Mark tasks as done if they are no longer in the calendar for today
      const existingTasks = await db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.source, "calendar")));
      for (const t of existingTasks) {
        if (t.externalId && !fetchedIds.has(t.externalId)) {
          await db.update(tasks).set({ status: "done", updatedAt: new Date() }).where(eq(tasks.id, t.id));
        }
      }

    } else if (provider === "todoist") {
      // Sync Todoist tasks
      const res = await fetch("https://api.todoist.com/rest/v2/tasks", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error(`Todoist API error: ${res.statusText}`);

      const data = await res.json();
      const todoistTasks = Array.isArray(data) ? data : [];
      const fetchedIds = new Set<string>();

      for (const t of todoistTasks) {
        fetchedIds.add(String(t.id));
        let dueAt: Date | undefined;
        if (t.due?.datetime) {
          dueAt = new Date(t.due.datetime);
        } else if (t.due?.date) {
          dueAt = new Date(t.due.date);
        }

        await db
          .insert(tasks)
          .values({
            userId,
            title: t.content,
            notes: t.description || null,
            source: "todoist",
            externalId: String(t.id),
            dueAt: dueAt || null,
            status: "open",
          })
          .onConflictDoUpdate({
            target: [tasks.userId, tasks.source, tasks.externalId],
            set: {
              title: t.content,
              notes: t.description || null,
              dueAt: dueAt || null,
              updatedAt: new Date(),
              status: "open",
            },
          });
      }

      // Mark missing tasks as done
      const existingTasks = await db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.source, "todoist"), eq(tasks.status, "open")));
      for (const t of existingTasks) {
        if (t.externalId && !fetchedIds.has(t.externalId)) {
          await db.update(tasks).set({ status: "done", updatedAt: new Date() }).where(eq(tasks.id, t.id));
        }
      }
    }

    await db
      .update(integrations)
      .set({ lastSyncedAt: new Date(), syncStatus: "connected" })
      .where(eq(integrations.id, integration.id));

  } catch (err: any) {
    console.error(`[sync-integration] Error syncing ${provider} for user ${userId}:`, err);
    await db
      .update(integrations)
      .set({ syncStatus: "error" })
      .where(eq(integrations.id, integration.id));
  }
}
