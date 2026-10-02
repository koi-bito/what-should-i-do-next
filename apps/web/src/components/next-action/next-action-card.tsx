"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Action } from "@/types/api";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

interface NextActionCardProps {
  action: Action;
  isResponding: boolean;
  onAccept: () => void;
  onReject: (reasonTag?: string) => void;
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
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    setIsRejecting(false);
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, [action.id]);

  const handleAccept = useCallback(async () => {
    if (isResponding || showSuccess) return;
    setShowSuccess(true);
    await new Promise((r) => setTimeout(r, 500));
    onAccept();
  }, [isResponding, showSuccess, onAccept]);

  const handleRejectClick = useCallback(() => {
    if (isResponding) return;
    setIsRejecting(true);
  }, [isResponding]);

  const handleReasonSelect = useCallback((reasonTag: string) => {
    onReject(reasonTag);
    setIsRejecting(false);
  }, [onReject]);

  const handleSnooze = useCallback(() => {
    if (isResponding) return;
    onSnooze();
  }, [isResponding, onSnooze]);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => {
    if (isRejecting) return { Escape: () => setIsRejecting(false) };
    return {
      a: handleAccept,
      d: handleAccept,
      r: handleRejectClick,
      s: handleSnooze,
    };
  }, [isRejecting, handleAccept, handleRejectClick, handleSnooze]);

  useKeyboardShortcuts(shortcuts);

  const REJECT_REASONS = [
    { value: "wrong_priority", label: "Wrong priority" },
    { value: "bad_timing", label: "Bad timing" },
    { value: "already_done", label: "Already done" },
    { value: "not_actionable", label: "Not actionable" },
    { value: "other", label: "Other" },
  ];

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      role="region"
      aria-label="Your next suggested action"
    >
      {isResponding ? (
        /* Skeleton loading state — never a blank flash */
        <div className="card p-6 space-y-4 shadow-card-primary border-primary/20" aria-busy="true" aria-label="Loading next suggestion">
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
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Your next action
              </span>
            </div>
            {action.estimatedMinutes && (
              <span className="badge-primary text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{action.estimatedMinutes}m
              </span>
            )}
          </div>

          {/* Action title — the centrepiece */}
          <h2 className="text-2xl font-semibold text-foreground mb-4 leading-tight">
            {showSuccess ? (
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0 animate-scale-bounce">
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-success">Got it — go crush it!</span>
              </span>
            ) : (
              action.title
            )}
          </h2>

          {/* Reasoning */}
          {!showSuccess && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic border-l-2 border-primary/30 pl-3">
              {action.reasoning}
            </p>
          )}

          {/* Action buttons / Feedback Flow */}
          {!showSuccess && (
            <div className="relative min-h-[50px]">
              {isRejecting ? (
                <div className="animate-fade-in space-y-3" role="group" aria-label="Rejection reason">
                  <p className="text-sm font-medium text-foreground text-center">
                    Why not this one?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {REJECT_REASONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => handleReasonSelect(r.value)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground
                          hover:border-primary hover:text-primary hover:bg-primary/5
                          focus-visible:border-primary focus-visible:text-primary focus-visible:bg-primary/5
                          transition-colors"
                        aria-label={`Reject because: ${r.label}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="w-full text-xs text-muted-foreground/60 hover:text-foreground mt-2 transition-colors"
                    aria-label="Cancel rejection"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2 animate-fade-in">
                    <button
                      id="accept-action-btn"
                      onClick={handleAccept}
                      disabled={isResponding}
                      className="flex-1 py-3 rounded-xl bg-success/10 text-success border border-success/20 text-sm font-semibold
                                hover:bg-success/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-success/50
                                transition-all duration-150 flex items-center justify-center gap-2"
                      aria-label="Accept this action (keyboard: A)"
                    >
                      <span>✓</span>
                      <span>Do it</span>
                    </button>

                    <button
                      id="reject-action-btn"
                      onClick={handleRejectClick}
                      disabled={isResponding}
                      className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold
                                hover:bg-destructive/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-destructive/50
                                transition-all duration-150 flex items-center justify-center gap-2"
                      aria-label="Reject this action (keyboard: R)"
                    >
                      <span>✗</span>
                      <span>Not now</span>
                    </button>

                    <button
                      id="snooze-action-btn"
                      onClick={handleSnooze}
                      disabled={isResponding}
                      className="flex-1 py-3 rounded-xl bg-warning/10 text-warning border border-warning/20 text-sm font-semibold
                                hover:bg-warning/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-warning/50
                                transition-all duration-150 flex items-center justify-center gap-2"
                      aria-label="Snooze this action (keyboard: S)"
                    >
                      <span>⏸</span>
                      <span>Later</span>
                    </button>
                  </div>

                  {/* Keyboard shortcut hint */}
                  <p className="text-xs text-muted-foreground/40 text-center hidden sm:block">
                    Keyboard: <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px] border border-border">A</kbd> accept ·
                    <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px] border border-border ml-1">R</kbd> reject ·
                    <kbd className="px-1.5 py-0.5 bg-surface rounded text-[10px] border border-border ml-1">S</kbd> snooze
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
