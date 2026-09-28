"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Goal } from "@/types/api";

interface GoalsStepProps {
  onComplete: () => void;
}

export function GoalsStep({ onComplete }: GoalsStepProps) {
  const [goals, setGoals] = useState([{ title: "", priority: 3 }]);
  const [isSaving, setIsSaving] = useState(false);

  function addGoal() {
    setGoals((prev) => [...prev, { title: "", priority: 3 }]);
  }

  function updateGoal(i: number, title: string) {
    setGoals((prev) => prev.map((g, idx) => idx === i ? { ...g, title } : g));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const filled = goals.filter((g) => g.title.trim());
    if (filled.length === 0) { onComplete(); return; }

    setIsSaving(true);
    try {
      await Promise.all(
        filled.map((g, i) => apiClient.post("/users/me/goals", { title: g.title, priority: i + 1 }))
      );
      onComplete();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} id="onboarding-goals-form" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">What are you working toward?</h2>
        <p className="text-sm text-muted-foreground">Add 1-3 goals. These shape every suggestion you get.</p>
      </div>

      <div className="space-y-3">
        {goals.map((goal, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <input
              type="text"
              value={goal.title}
              onChange={(e) => updateGoal(i, e.target.value)}
              className="input-base flex-1"
              placeholder={[
                "e.g. Launch my SaaS MVP",
                "e.g. Pass my final exams",
                "e.g. Clear my inbox backlog",
              ][i] ?? "Another goal..."}
            />
          </div>
        ))}

        {goals.length < 5 && (
          <button type="button" onClick={addGoal} className="btn-ghost text-sm">
            + Add another goal
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onComplete} className="btn-ghost flex-1">
          Skip for now
        </button>
        <button type="submit" id="save-goals-btn" className="btn-primary flex-1" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save goals →"}
        </button>
      </div>
    </form>
  );
}
