import { Resend } from "resend";
import { db } from "../../lib/db";
import { profiles } from "../../lib/schema";
import { eq } from "drizzle-orm";
import { buildUserContext } from "../../modules/queries/context-builder";
import { generateNextAction } from "../../modules/ai/ai-engine";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendDailyDigest(userId: string): Promise<void> {
  if (!resend) {
    console.log(`[daily-digest] Resend not configured, skipping user ${userId}`);
    return;
  }

  try {
    const [user] = await db.select().from(profiles).where(eq(profiles.id, userId));
    if (!user || !user.email) return;

    // Use default/optimistic context for the morning digest
    const manualContext = {
      energyLevel: 4,
      minutesAvailable: 120,
      mood: "Ready to start the day",
    };

    const context = await buildUserContext(userId, manualContext);
    const { action } = await generateNextAction(context);

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #000;">Good morning, ${user.displayName || 'there'}! 🌅</h2>
        <p>Here is your recommended top priority to start the day:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">${action.action_title}</h3>
          ${action.estimated_minutes ? `<p style="font-size: 14px; color: #666;">⏱️ ~${action.estimated_minutes} mins</p>` : ""}
          <p style="font-style: italic; color: #555;">"${action.reasoning}"</p>
        </div>
        
        <p>
          <a href="${process.env.WEB_APP_ORIGIN || 'http://localhost:3000'}/app" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open Dashboard
          </a>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "What Should I Do Next <hello@whatnext.com>",
      to: user.email,
      subject: "Your daily recommended action",
      html,
    });

    console.log(`[daily-digest] Sent digest for user ${userId}`);
  } catch (err) {
    console.error(`[daily-digest] Failed to send digest to ${userId}:`, err);
  }
}
