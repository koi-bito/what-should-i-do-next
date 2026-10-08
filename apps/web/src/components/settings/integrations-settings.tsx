"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Integration } from "@/types/api";
import { SkeletonList } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { useToast } from "@/components/ui/toast";

const PROVIDERS = [
  { id: "google_calendar", name: "Google Calendar", icon: "📅", desc: "Auto-detect your free time and upcoming deadlines", comingSoon: true },
  { id: "todoist", name: "Todoist", icon: "✅", desc: "Import your Todoist tasks automatically", comingSoon: true },
  { id: "notion", name: "Notion", icon: "📝", desc: "Sync a Notion database as your task list", comingSoon: true },
];

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { success, error: showError, warning } = useToast();

  useEffect(() => { loadIntegrations(); }, []);

  async function loadIntegrations() {
    setError(null);
    try {
      const data = await apiClient.get<{ data: Integration[] }>("/integrations");
      setIntegrations(data.data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: string) {
    setConnecting(provider);
    try {
      const { url } = await apiClient.post<{ url: string }>(`/integrations/${provider}/connect`);
      if (url && !url.startsWith("#")) {
        window.location.href = url;
      } else {
        warning("Integration OAuth not configured yet. Add the provider credentials to .env.");
      }
    } catch (err: any) {
      showError("Failed to start connection. Please try again.");
    } finally {
      setConnecting(null);
    }
  }

  async function handleDisconnect(provider: string) {
    try {
      await apiClient.delete(`/integrations/${provider}`);
      setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
      success("Integration disconnected");
    } catch (err: any) {
      showError("Failed to disconnect integration");
    }
  }

  if (loading) return <SkeletonList count={3} lines={2} />;
  if (error) return <ApiErrorState message={error} onRetry={loadIntegrations} />;

  return (
    <div className="space-y-4" role="list" aria-label="Available integrations">
      {PROVIDERS.map((p) => {
        const connected = integrations.find((i) => i.provider === p.id);
        return (
          <div key={p.id} id={`integration-${p.id}`} role="listitem" className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">
                {p.icon}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
                {connected && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Connected{connected.lastSyncedAt ? ` · Synced ${new Date(connected.lastSyncedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
              </div>
            </div>

            {connected ? (
              <button
                onClick={() => handleDisconnect(p.id)}
                className="btn-destructive text-xs py-1.5 px-3 flex-shrink-0"
                aria-label={`Disconnect ${p.name}`}
              >
                Disconnect
              </button>
            ) : (
              <button
                id={`connect-${p.id}-btn`}
                onClick={() => handleConnect(p.id)}
                className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                disabled={p.comingSoon || connecting === p.id}
                aria-label={`Connect ${p.name}`}
              >
                {p.comingSoon ? "Coming Soon" : connecting === p.id ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting...
                  </span>
                ) : "Connect"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
