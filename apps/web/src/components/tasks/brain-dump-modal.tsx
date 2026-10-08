"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Task } from "@/types/api";

interface BrainDumpModalProps {
  onClose: () => void;
  onSuccess: (newTasks: Task[]) => void;
}

export function BrainDumpModal({ onClose, onSuccess }: BrainDumpModalProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.post<{ data: Task[] }>("/tasks/brain-dump", { text });
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to process brain dump.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brain-dump-title"
    >
      <div className="card w-full max-w-lg p-6 shadow-card-primary animate-fade-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 id="brain-dump-title" className="text-xl font-bold text-foreground">
              Brain Dump
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Paste your messy notes, meeting takeaways, or stream-of-consciousness. The AI will extract actionable tasks for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              id="dump-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
              className="input h-48 resize-none text-sm placeholder:italic"
              placeholder="e.g. Talked to Sarah, need to review the Q3 slides by Friday. Also buy milk. And don't forget to schedule the team retro next week..."
              autoFocus
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !text.trim()} className="btn-primary">
              {isSubmitting ? "Extracting..." : "Extract Tasks"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
