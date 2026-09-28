import { describe, it, expect } from "vitest";
import { trimTasksToBudget } from "../context-builder";

const makeTask = (i: number, dueOffset?: number, goalPriority?: number) => ({
  id: `t${i}`,
  title: `Task ${i}`,
  estimatedMinutes: 20,
  dueAt: dueOffset !== undefined
    ? new Date(Date.now() + dueOffset * 3_600_000).toISOString()
    : null,
  goalPriority,
  goalTitle: null,
});

describe("trimTasksToBudget", () => {
  it("keeps at most 25 tasks sorted by due date proximity", () => {
    const tasks = Array.from({ length: 40 }, (_, i) => makeTask(i, i));
    const { included, overflowCount } = trimTasksToBudget(tasks, 25);

    expect(included).toHaveLength(25);
    expect(overflowCount).toBe(15);
    // Soonest due date should be first
    expect(included[0].id).toBe("t0");
  });

  it("returns zero overflow when under the budget", () => {
    const tasks = Array.from({ length: 5 }, (_, i) => makeTask(i));
    const { included, overflowCount } = trimTasksToBudget(tasks, 25);

    expect(included).toHaveLength(5);
    expect(overflowCount).toBe(0);
  });

  it("puts tasks with no due date after those with due dates", () => {
    const tasks = [
      makeTask(0), // no due date
      makeTask(1, 10), // due in 10h
      makeTask(2, 5), // due in 5h
    ];
    const { included } = trimTasksToBudget(tasks, 25);

    expect(included[0].id).toBe("t2"); // soonest due
    expect(included[1].id).toBe("t1");
    expect(included[2].id).toBe("t0"); // no due date — last
  });

  it("handles empty task list", () => {
    const { included, overflowCount } = trimTasksToBudget([], 25);
    expect(included).toHaveLength(0);
    expect(overflowCount).toBe(0);
  });
});
