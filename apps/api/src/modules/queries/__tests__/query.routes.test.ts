import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../../server";

// Mock the AI engine so tests don't call the real Claude API
vi.mock("../../ai/ai-engine", () => ({
  generateNextAction: vi.fn().mockResolvedValue({
    action: {
      action_title: "Draft the follow-up email",
      reasoning: "It's blocking someone and takes 10 minutes.",
      estimated_minutes: 10,
      task_id: null,
      confidence: 0.9,
    },
    meta: {
      promptVersion: "v1",
      modelUsed: "claude-sonnet-mock",
      latencyMs: 5,
      costUsd: 0.0001,
    },
  }),
}));

// Mock the database to avoid requiring a real Postgres connection
vi.mock("../../../lib/db", () => {
  const chain = {
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: function (resolve: any) {
      // Resolve with fake data for both query fetches and profile fetches
      resolve([{
        id: "query-id-1",
        userId: "user-id-1",
        promptVersion: "v1",
        modelUsed: "claude-sonnet-mock",
        latencyMs: 5,
        costUsd: "0.0001",
        createdAt: new Date(),
        tier: "pro" // For the requireAuth mock
      }]);
    }
  };
  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "query-id-1",
              userId: "user-id-1",
              promptVersion: "v1",
              modelUsed: "claude-sonnet-mock",
              latencyMs: 5,
              costUsd: "0.0001",
              createdAt: new Date(),
            },
          ]),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(chain),
        }),
      }),
    },
  };
});

// Mock context builder
vi.mock("../context-builder", () => ({
  buildUserContext: vi.fn().mockResolvedValue({
    userId: "user-id-1",
    localTime: "9:00 AM",
    timezone: "UTC",
    minutesAvailable: 15,
    energyLevel: 3,
    goals: [],
    tasks: [],
    recentActions: [],
  }),
}));

// Mock Redis to skip rate limiting
vi.mock("../../../lib/redis", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
  },
  redisConnection: {},
}));

const TEST_SECRET = "test-secret-1234567890-test-secret-1234567890";

// Generate a test JWT signed with test secret
function makeTestToken(userId = "user-id-1", tier = "free") {
  return jwt.sign({ sub: userId, email: "test@example.com" }, TEST_SECRET, { expiresIn: "1h" });
}

describe("POST /api/v1/queries", () => {
  let prevSecret: string | undefined;

  beforeAll(() => {
    prevSecret = process.env.SUPABASE_JWT_SECRET;
    process.env.SUPABASE_JWT_SECRET = TEST_SECRET;
  });

  afterAll(() => {
    process.env.SUPABASE_JWT_SECRET = prevSecret;
  });
  it("returns 201 with a suggested action", async () => {
    const res = await request(app)
      .post("/api/v1/queries")
      .set("Authorization", `Bearer ${makeTestToken()}`)
      .send({ context: { energyLevel: 3, minutesAvailable: 15 } });

    expect(res.status).toBe(201);
    expect(res.body.action).toBeDefined();
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app)
      .post("/api/v1/queries")
      .send({ context: { energyLevel: 3, minutesAvailable: 15 } });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 400 with invalid context", async () => {
    const res = await request(app)
      .post("/api/v1/queries")
      .set("Authorization", `Bearer ${makeTestToken()}`)
      .send({ context: { energyLevel: 99, minutesAvailable: 15 } }); // energy > 5

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
