"use client";

import { useState, useEffect } from "react";
import type { Action } from "@/types/api";

interface NextActionCardProps {
  action: Action;
  isResponding: boolean;
  onAccept: () => void;
  onReject: () => void;
  onSnooze: () => void;
}

export function NextActionCard({
  action,
  isResponding,
  onAccept,
  onReject,
  onSnooze,
}: NextActionCardProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, [action.id]);

  async function handleAccept() {
    setShowSuccess(true);
    await new Promise((r) => setTimeout(r, 400));
    onAccept();
  }

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {isResponding ? (
        // Skeleton loading state — never a blank flash
        <div className="card p-6 space-y-4 shadow-card-primary border-primary/20">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-7 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="flex gap-3 mt-2">
            <div className="skeleton h-10 flex-1 rounded-xl" />
            <div className="skeleton h-10 flex-1 rounded-xl" />
            <div className="skeleton h-10 flex-1 rounded-xl" />
          </div>
        </div>
      ) : (
        <div
          className={`card p-6 shadow-card-primary border-primary/20 transition-all duration-300 ${
            showSuccess ? "animate-success-pulse" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Your next action
              </span>
            </div>
            {action.estimatedMinutes && (
              <span className="badge-primary text-xs">
                ~{action.estimatedMinutes}m
              </span>
            )}
          </div>

          {/* Action title — the centrepiece */}
          <h2 className="text-2xl font-semibold text-foreground mb-4 leading-tight">
            {action.title}
          </h2>

          {/* Reasoning */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic border-l-2 border-primary/30 pl-3">
            {action.reasoning}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              id="accept-action-btn"
              onClick={handleAccept}
              disabled={isResponding}
              className="flex-1 py-3 rounded-xl bg-success/10 text-success border border-success/20 text-sm font-semibold
                         hover:bg-success/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Do it</span>
            </button>

            <button
              id="reject-action-btn"
              onClick={onReject}
              disabled={isResponding}
              className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold
                         hover:bg-destructive/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>✗</span>
              <span>Not now</span>
            </button>

            <button
              id="snooze-action-btn"
              onClick={onSnooze}
              disabled={isResponding}
              className="flex-1 py-3 rounded-xl bg-warning/10 text-warning border border-warning/20 text-sm font-semibold
                         hover:bg-warning/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>⏸</span>
              <span>Later</span>
            </button>
          </div>

          {/* Pro tip */}
          <p className="text-xs text-muted-foreground/60 mt-4 text-center">
            Reject to get a different suggestion instantly
          </p>
        </div>
      )}
    </div>
  );
}
