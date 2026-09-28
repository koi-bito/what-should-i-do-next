"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Goal } from "@/types/api";
import { GoalEditorModal } from "./goal-editor-modal";

const PRIORITY_LABEL: Record<number, string> = { 1: "🔴 Critical", 2: "🟠 High", 3: "🟡 Medium", 4: "🟢 Low", 5: "⚪ Someday" };

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null | undefined>(undefined);

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    try {
      const data = await apiClient.get<{ data: Goal[] }>("/users/me/goals");
      setGoals(data.data.filter((g) => g.status === "active" || g.status === "paused"));
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(goalId: string) {
    await apiClient.delete(`/users/me/goals/${goalId}`);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{goals.length} active goals</p>
        <button id="add-goal-btn" onClick={() => setEditingGoal(null)} className="btn-primary text-sm py-2 px-4">+ Add goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Goals help the AI prioritize what matters most to you.</p>
          <button onClick={() => setEditingGoal(null)} className="btn-primary text-sm">Add your first goal</button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} id={`goal-${goal.id}`} className="card p-5 group hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{PRIORITY_LABEL[goal.priority] ?? "🟡 Medium"}</span>
                  </div>
                  <p className="font-semibold text-foreground">{goal.title}</p>
                  {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground mt-2">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => setEditingGoal(goal)} className="btn-ghost p-1.5 text-xs">✏️</button>
                  <button onClick={() => handleArchive(goal.id)} className="btn-ghost p-1.5 text-xs text-destructive">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingGoal !== undefined && (
        <GoalEditorModal
          goal={editingGoal}
          onClose={() => setEditingGoal(undefined)}
          onSave={(saved) => {
            setGoals((prev) => editingGoal ? prev.map((g) => g.id === saved.id ? saved : g) : [saved, ...prev]);
            setEditingGoal(undefined);
          }}
        />
      )}
    </>
  );
}
