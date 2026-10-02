"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Goal } from "@/types/api";
import { GoalEditorModal } from "./goal-editor-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const PRIORITY_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Critical", color: "bg-destructive/10 text-destructive border-destructive/20" },
  2: { label: "High", color: "bg-warning/10 text-warning border-warning/20" },
  3: { label: "Medium", color: "bg-primary/10 text-primary border-primary/20" },
  4: { label: "Low", color: "bg-success/10 text-success border-success/20" },
  5: { label: "Someday", color: "bg-surface-hover text-muted-foreground border-border" },
};

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null | undefined>(undefined);
  const { success, error: showError } = useToast();

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    setError(null);
    try {
      const data = await apiClient.get<{ data: Goal[] }>("/users/me/goals");
      setGoals(data.data.filter((g) => g.status === "active" || g.status === "paused"));
    } catch (err: any) {
      setError(err.message ?? "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(goal: Goal) {
    try {
      await apiClient.delete(`/users/me/goals/${goal.id}`);
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      success(`"${goal.title}" archived`);
    } catch (err: any) {
      showError("Failed to archive goal");
    }
  }

  if (loading) return <SkeletonList count={3} />;

  if (error) return <ApiErrorState message={error} onRetry={loadGoals} />;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {goals.length} active goal{goals.length !== 1 ? "s" : ""}
        </p>
        <button
          id="add-goal-btn"
          onClick={() => setEditingGoal(null)}
          className="btn-primary text-sm py-2 px-4"
          aria-label="Add a new goal"
        >
          + Add goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Goals shape every AI suggestion you get. Add a few to help us understand what matters most to you."
          actionLabel="Add your first goal"
          onAction={() => setEditingGoal(null)}
          secondaryLabel="Go to dashboard"
          secondaryHref="/app"
        />
      ) : (
        <div className="space-y-3" role="list" aria-label="Your goals">
          {goals.map((goal, index) => {
            const prio = PRIORITY_LABEL[goal.priority] ?? PRIORITY_LABEL[3];
            const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date();

            return (
              <div
                key={goal.id}
                id={`goal-${goal.id}`}
                role="listitem"
                className="card p-5 group hover:border-primary/20 transition-all duration-200 animate-fade-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Priority badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge text-xs border ${prio.color}`}>
                        P{goal.priority} · {prio.label}
                      </span>
                      {goal.status === "paused" && (
                        <span className="badge text-xs border border-warning/20 bg-warning/10 text-warning">
                          Paused
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-foreground">{goal.title}</p>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                    )}

                    {goal.targetDate && (
                      <p className={`text-xs mt-2 flex items-center gap-1 ${
                        isOverdue ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {isOverdue ? "Overdue · " : "Target: "}
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="btn-ghost p-1.5 text-xs"
                      aria-label={`Edit "${goal.title}"`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleArchive(goal)}
                      className="btn-ghost p-1.5 text-xs text-destructive"
                      aria-label={`Archive "${goal.title}"`}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingGoal !== undefined && (
        <GoalEditorModal
          goal={editingGoal}
          onClose={() => setEditingGoal(undefined)}
          onSave={(saved) => {
            const isNew = !editingGoal;
            setGoals((prev) => editingGoal ? prev.map((g) => g.id === saved.id ? saved : g) : [saved, ...prev]);
            setEditingGoal(undefined);
            success(isNew ? `Goal "${saved.title}" created` : `Goal updated`);
          }}
        />
      )}
    </>
  );
}
