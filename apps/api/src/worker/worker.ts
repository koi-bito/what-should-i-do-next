import { Worker, Queue } from "bullmq";
import { redisConnection } from "../lib/redis";
import { sendDailyDigest } from "./jobs/daily-digest";
import { syncIntegration } from "./jobs/sync-integration";
import { checkBudgetAlerts } from "./jobs/budget-alerts";
import { sendProactiveNudges } from "./jobs/proactive-nudge";
import { db } from "../lib/db";
import { integrations, profiles, tasks } from "../lib/schema";
import { eq, and, lt } from "drizzle-orm";

export const digestQueue = new Queue("daily-digest", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const budgetQueue = new Queue("budget-alerts", {
  connection: redisConnection,
  defaultJobOptions: { attempts: 1 },
});

export const nudgeQueue = new Queue("proactive-nudge", {
  connection: redisConnection,
  defaultJobOptions: { attempts: 1 },
});

export const syncQueue = new Queue("integration-sync", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const unsnoozeQueue = new Queue("unsnooze-tasks", {
  connection: redisConnection,
  defaultJobOptions: { attempts: 1 },
});

// Process daily digests
new Worker(
  "daily-digest",
  async (job) => {
    if (job.name === "fan-out") {
      const proUsers = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.tier, "pro"));
      for (const user of proUsers) {
        await digestQueue.add(`digest-${user.id}`, { userId: user.id });
      }
      console.log(`[worker] daily-digest fan-out enqueued ${proUsers.length} jobs`);
    } else {
      await sendDailyDigest(job.data.userId as string);
    }
  },
  { connection: redisConnection, concurrency: 10 }
);

// Process budget alerts
new Worker(
  "budget-alerts",
  async () => {
    await checkBudgetAlerts();
  },
  { connection: redisConnection, concurrency: 1 }
);

// Process proactive nudges
new Worker(
  "proactive-nudge",
  async () => {
    await sendProactiveNudges();
  },
  { connection: redisConnection, concurrency: 1 }
);

// Process integration syncs
new Worker(
  "integration-sync",
  async (job) => {
    if (job.name === "fan-out") {
      const activeIntegrations = await db.select().from(integrations);
      for (const integration of activeIntegrations) {
        await syncQueue.add(`sync-${integration.provider}-${integration.userId}`, {
          userId: integration.userId,
          provider: integration.provider,
        });
      }
      console.log(`[worker] integration-sync fan-out enqueued ${activeIntegrations.length} jobs`);
    } else {
      await syncIntegration(
        job.data.userId as string,
        job.data.provider as string
      );
    }
  },
  { connection: redisConnection, concurrency: 5 }
);

// Process unsnooze
new Worker(
  "unsnooze-tasks",
  async () => {
    const result = await db.update(tasks)
      .set({ status: "open" })
      .where(
        and(
          eq(tasks.status, "snoozed"),
          lt(tasks.updatedAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      );
    console.log(`[worker] Unsnoozed tasks older than 24h`);
  },
  { connection: redisConnection, concurrency: 1 }
);

// Schedule: enqueue digest fan-out at 6am UTC daily
digestQueue.add(
  "fan-out",
  {},
  {
    repeat: { pattern: "0 6 * * *" },
    jobId: "daily-digest-fan-out", // idempotent ID
  }
);

// Schedule: enqueue budget check daily at 23:50 UTC
budgetQueue.add(
  "check-budget",
  {},
  {
    repeat: { pattern: "50 23 * * *" },
    jobId: "daily-budget-check",
  }
);

// Schedule: enqueue proactive nudges hourly
nudgeQueue.add(
  "hourly-nudge",
  {},
  {
    repeat: { pattern: "0 * * * *" },
    jobId: "hourly-proactive-nudge",
  }
);

// Schedule: enqueue integration sync fan-out every 15 minutes
syncQueue.add(
  "fan-out",
  {},
  {
    repeat: { pattern: "*/15 * * * *" },
    jobId: "integration-sync-fan-out",
  }
);

// Schedule: enqueue unsnooze hourly
unsnoozeQueue.add(
  "hourly-unsnooze",
  {},
  {
    repeat: { pattern: "0 * * * *" },
    jobId: "hourly-unsnooze-tasks",
  }
);

// eslint-disable-next-line no-console
console.log("[worker] BullMQ workers started");
