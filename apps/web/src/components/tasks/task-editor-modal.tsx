"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Task } from "@/types/api";

interface TaskEditorModalProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskEditorModal({ task, onClose, onSave }: TaskEditorModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(
    task?.estimatedMinutes?.toString() ?? ""
  );
  const [dueAt, setDueAt] = useState(task?.dueAt?.slice(0, 16) ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title,
        notes: notes || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      };

      const saved = task
        ? await apiClient.patch<Task>(`/tasks/${task.id}`, payload)
        : await apiClient.post<Task>("/tasks", payload);

      onSave(saved);
      onClose();
    } catch (err: any) {
      console.error("Failed to save task:", err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card w-full max-w-md p-6 shadow-card-primary animate-fade-slide-up">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {task ? "Edit Task" : "Add Task"}
        </h2>

        <form onSubmit={handleSave} id="task-editor-form" className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-muted-foreground mb-2">
              Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label htmlFor="task-notes" className="block text-sm font-medium text-muted-foreground mb-2">
              Notes
            </label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-base min-h-[80px] resize-none"
              placeholder="Additional context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-estimate" className="block text-sm font-medium text-muted-foreground mb-2">
                Estimate (min)
              </label>
              <input
                id="task-estimate"
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="input-base"
                placeholder="30"
                min={1}
                max={480}
              />
            </div>
            <div>
              <label htmlFor="task-due" className="block text-sm font-medium text-muted-foreground mb-2">
                Due date
              </label>
              <input
                id="task-due"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" id="save-task-btn" className="btn-primary flex-1" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
