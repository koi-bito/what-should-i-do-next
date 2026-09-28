"use client";

import { useState } from "react";
import { ContextInput } from "./context-input";
import { NextActionCard } from "./next-action-card";
import { apiClient } from "@/lib/api/client";
import type { Action, ContextPayload } from "@/types/api";

export function NextActionFlow() {
  const [action, setAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
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
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsResponding(false);
    }
  }

  if (error && !action) {
    return (
      <div className="card p-6 animate-fade-slide-up">
        <div className="text-center space-y-4">
          <div className="text-3xl">😮</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          {error.includes("upgrade") && (
            <a href="/app/settings/billing" className="btn-primary inline-block text-sm py-2 px-6">
              Upgrade to Pro →
            </a>
          )}
          <button
            onClick={() => setError(null)}
            className="btn-ghost text-sm block w-full"
          >
            Try again
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
