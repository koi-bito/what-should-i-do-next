import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
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
vi.mock("../../../lib/db", () => ({
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
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

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

// Generate a test JWT (unsigned — works with dev mode requireAuth)
function makeTestToken(userId = "user-id-1", tier = "free") {
  const payload = { sub: userId, user_metadata: { tier } };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${encoded}.${encoded}.${encoded}`; // fake JWT format, decoded not verified
}

describe("POST /api/v1/queries", () => {
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
