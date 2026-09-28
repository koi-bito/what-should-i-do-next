import { Worker, Queue } from "bullmq";
import { redisConnection } from "../lib/redis";
import { sendDailyDigest } from "./jobs/daily-digest";
import { syncIntegration } from "./jobs/sync-integration";

export const digestQueue = new Queue("daily-digest", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
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

// Process daily digests
new Worker(
  "daily-digest",
  async (job) => {
    if (job.name === "fan-out") {
      // TODO: Query all Pro users and enqueue one job per user
      console.log("[worker] daily-digest fan-out triggered");
    } else {
      await sendDailyDigest(job.data.userId as string);
    }
  },
  { connection: redisConnection, concurrency: 10 }
);

// Process integration syncs
new Worker(
  "integration-sync",
  async (job) => {
    await syncIntegration(
      job.data.userId as string,
      job.data.provider as string
    );
  },
  { connection: redisConnection, concurrency: 5 }
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

console.log("[worker] BullMQ workers started");
