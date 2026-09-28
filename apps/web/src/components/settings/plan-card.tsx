"use client";

import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { useState } from "react";

interface PlanCardProps {
  plan: string;
  queriesUsed: number;
  queriesLimit: number | null;
}

export function PlanCard({ plan, queriesUsed, queriesLimit }: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePortal() {
    setIsLoading(true);
    try {
      const { url } = await apiClient.post<{ url: string }>("/subscriptions/portal");
      window.location.href = url;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const usagePct = queriesLimit ? Math.min(100, (queriesUsed / queriesLimit) * 100) : 0;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current plan</p>
          <p className="text-xl font-bold text-foreground capitalize">{plan}</p>
        </div>
        {plan === "free" ? (
          <Link href="/app/settings/billing" className="btn-primary text-sm py-2 px-4">
            Upgrade to Pro
          </Link>
        ) : (
          <button onClick={handlePortal} disabled={isLoading} className="btn-secondary text-sm py-2 px-4">
            {isLoading ? "Loading..." : "Manage billing"}
          </button>
        )}
      </div>

      {queriesLimit !== null && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Queries today</span>
            <span>{queriesUsed} / {queriesLimit}</span>
          </div>
          <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePct >= 80 ? "bg-warning" : "bg-primary"
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          {usagePct >= 100 && (
            <p className="text-xs text-warning mt-2">
              Daily limit reached. <Link href="/app/settings/billing" className="underline">Upgrade for unlimited</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
