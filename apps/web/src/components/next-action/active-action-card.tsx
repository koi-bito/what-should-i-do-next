"use client";

import { useState, useEffect } from "react";
import type { Action } from "@/types/api";

interface ActiveActionCardProps {
  action: Action;
  isCompleting: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export function ActiveActionCard({
  action,
  isCompleting,
  onComplete,
  onCancel,
}: ActiveActionCardProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const startTime = new Date().getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      setElapsedMinutes(Math.floor((now - startTime) / 60000));
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="card p-6 shadow-card-primary border-primary/20 animate-fade-slide-up"
      role="region"
      aria-label="Your active action"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
          <span className="text-xs font-medium text-success uppercase tracking-wider">
            In Progress
          </span>
        </div>
        {action.estimatedMinutes && (
          <span className="badge-primary text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {elapsedMinutes} / {action.estimatedMinutes}m
          </span>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-foreground mb-4 leading-tight">
        {action.title}
      </h2>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic border-l-2 border-primary/30 pl-3">
        {action.reasoning}
      </p>

      <div className="flex gap-2">
        <button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex-1 py-3 rounded-xl bg-success text-success-foreground border border-success/20 text-sm font-semibold
                    hover:bg-success/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-success/50
                    transition-all duration-150 flex items-center justify-center gap-2"
        >
          {isCompleting ? "Completing..." : "Mark as Done"}
        </button>
        <button
          onClick={onCancel}
          disabled={isCompleting}
          className="px-4 py-3 rounded-xl bg-surface text-foreground border border-border text-sm font-semibold
                    hover:bg-muted active:scale-95 focus-visible:ring-2 focus-visible:ring-ring
                    transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
