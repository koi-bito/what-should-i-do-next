import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendDailyDigest(userId: string): Promise<void> {
  if (!resend) {
    console.log(`[daily-digest] Resend not configured, skipping user ${userId}`);
    return;
  }

  // TODO: 
  // 1. Load user profile (email, timezone)
  // 2. Build today's top priority using the AI engine
  // 3. Render email template
  // 4. Send via Resend

  console.log(`[daily-digest] Sent digest for user ${userId}`);
}
