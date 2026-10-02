"use client";

import { useState } from "react";
import { ContextInput } from "./context-input";
import { NextActionCard } from "./next-action-card";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import type { Action, ContextPayload } from "@/types/api";

export function NextActionFlow() {
  const [action, setAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError, warning } = useToast();

  async function handleSubmitContext(context: ContextPayload) {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.post<{ action: Action }>("/queries", {
        context,
      });
      setAction(data.action);
    } catch (err: any) {
      if (err.code === "DAILY_QUOTA_EXCEEDED") {
        setError(
          "You've used all 5 free queries today. Upgrade to Pro for unlimited access."
        );
        warning("Daily query limit reached");
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
        showError("Failed to get a suggestion");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRespond(
    kind: "accept" | "reject" | "snooze",
    reasonTag?: string
  ) {
    if (!action) return;
    setIsResponding(true);

    try {
      // For reject, we might have a reasonTag we want to send in the body
      const body = kind === "reject" && reasonTag ? { reasonTag } : undefined;

      const data = await apiClient.patch<{ action: Action | null }>(
        `/actions/${action.id}/${kind}`,
        body
      );

      // Reject returns a fresh replacement action
      if (kind === "reject" && data.action) {
        setAction(data.action);
      } else {
        setAction(null); // Accept/snooze — back to context input
        if (kind === "accept") {
          success("Action accepted — go get it done! 💪");
        } else if (kind === "snooze") {
          success("Snoozed — we'll bring it back later");
        }
      }
    } catch (err: any) {
      showError(err.message ?? "Something went wrong.");
    } finally {
      setIsResponding(false);
    }
  }

  if (error && !action) {
    return (
      <div className="card p-6 animate-fade-slide-up border-warning/20" role="alert">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center">
            {error.includes("upgrade") ? (
              <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
          {error.includes("upgrade") && (
            <a href="/app/settings/billing" className="btn-primary inline-block text-sm py-2.5 px-6">
              Upgrade to Pro →
            </a>
          )}
          <button
            onClick={() => setError(null)}
            className="btn-ghost text-sm block w-full"
          >
            {error.includes("upgrade") ? "Maybe later" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <ContextInput
        isSubmitting={isLoading}
        onSubmit={handleSubmitContext}
      />
    );
  }

  return (
    <NextActionCard
      action={action}
      isResponding={isResponding}
      onAccept={() => handleRespond("accept")}
      onReject={(reason) => handleRespond("reject", reason)}
      onSnooze={() => handleRespond("snooze")}
    />
  );
}
