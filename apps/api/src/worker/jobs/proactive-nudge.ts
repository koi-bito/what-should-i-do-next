import { db } from "../../lib/db";
import { profiles, integrations, queries, actions } from "../../lib/schema";
import { eq, sql, isNotNull } from "drizzle-orm";
import * as OneSignal from "@onesignal/node-onesignal";

// Note: Node-onesignal SDK usage
const configuration = OneSignal.createConfiguration({
  userKey: process.env.ONESIGNAL_USER_KEY || "",
  appKey: process.env.ONESIGNAL_REST_API_KEY || "",
});
const client = new OneSignal.DefaultApi(configuration);

export async function sendProactiveNudges(): Promise<void> {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId || !process.env.ONESIGNAL_REST_API_KEY) {
    console.log("[proactive-nudges] OneSignal keys missing, skipping.");
    return;
  }

  // Find users who have Pro/Team tier and working hours
  const proUsers = await db
    .select({
      id: profiles.id,
      timezone: profiles.timezone,
      workingHours: profiles.workingHours,
    })
    .from(profiles)
    .where(isNotNull(profiles.tier)); // Simplified logic: target all for MVP

  for (const user of proUsers) {
    // 1. Check local time
    // For MVP, we just send a generic nudge if it's afternoon in their timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: user.timezone || "UTC",
      hour: "numeric",
      hour12: false,
    });
    const localHour = parseInt(formatter.format(now), 10);

    // Only nudge around 3 PM (15:00)
    if (localHour === 15) {
      try {
        const notification = new OneSignal.Notification();
        notification.app_id = appId;
        notification.include_external_user_ids = [user.id]; // Target specific user
        notification.headings = { en: "Clear afternoon?" };
        notification.contents = {
          en: "You have some free time. Let WhatNext help you decide what to tackle next!",
        };
        notification.url = `${process.env.WEB_APP_ORIGIN || "https://whatnext.com"}/app`;

        await client.createNotification(notification);
        console.log(`[proactive-nudges] Sent push notification to user ${user.id}`);
      } catch (err) {
        console.error(`[proactive-nudges] Failed to send to ${user.id}`, err);
      }
    }
  }
}
