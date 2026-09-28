"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Goal } from "@/types/api";

interface GoalEditorModalProps {
  goal?: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}

export function GoalEditorModal({ goal, onClose, onSave }: GoalEditorModalProps) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [priority, setPriority] = useState<number>(goal?.priority ?? 3);
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        priority,
        targetDate: targetDate || undefined,
      };

      const saved = goal
        ? await apiClient.patch<Goal>(`/users/me/goals/${goal.id}`, payload)
        : await apiClient.post<Goal>("/users/me/goals", payload);

      onSave(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 shadow-card-primary animate-fade-slide-up">
        <h2 className="text-lg font-semibold text-foreground mb-6">{goal ? "Edit Goal" : "Add Goal"}</h2>

        <form onSubmit={handleSave} id="goal-editor-form" className="space-y-4">
          <div>
            <label htmlFor="goal-title" className="block text-sm font-medium text-muted-foreground mb-2">Title *</label>
            <input id="goal-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="What are you working toward?" required />
          </div>

          <div>
            <label htmlFor="goal-desc" className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea id="goal-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="input-base min-h-[80px] resize-none" placeholder="Why does this matter?" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Priority</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${priority === p ? "bg-primary text-white" : "bg-surface border border-border text-muted-foreground hover:bg-surface-hover"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="goal-date" className="block text-sm font-medium text-muted-foreground mb-2">Target date</label>
              <input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="input-base" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" id="save-goal-btn" className="btn-primary flex-1" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
