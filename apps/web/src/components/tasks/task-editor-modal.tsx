"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api/client";
import type { Task } from "@/types/api";
import { useToast } from "@/components/ui/toast";

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
  const { error: showError } = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus title input on open
  useEffect(() => {
    const t = setTimeout(() => titleInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

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
      showError(err.message ?? "Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-editor-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div ref={modalRef} className="relative card w-full max-w-md p-6 shadow-card-primary animate-fade-slide-up">
        <h2 id="task-editor-title" className="text-lg font-semibold text-foreground mb-6">
          {task ? "Edit Task" : "Add Task"}
        </h2>

        <form onSubmit={handleSave} id="task-editor-form" className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-muted-foreground mb-2">
              Title *
            </label>
            <input
              ref={titleInputRef}
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
                aria-label="Estimated time in minutes"
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
                aria-label="Task due date and time"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" id="save-task-btn" className="btn-primary flex-1" disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
