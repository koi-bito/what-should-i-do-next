"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Integration } from "@/types/api";

const PROVIDERS = [
  { id: "google_calendar", name: "Google Calendar", icon: "📅", desc: "Auto-detect your free time and upcoming deadlines" },
  { id: "todoist", name: "Todoist", icon: "✅", desc: "Import your Todoist tasks automatically" },
  { id: "notion", name: "Notion", icon: "📝", desc: "Sync a Notion database as your task list" },
];

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => { loadIntegrations(); }, []);

  async function loadIntegrations() {
    try {
      const data = await apiClient.get<{ data: Integration[] }>("/integrations");
      setIntegrations(data.data);
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
        alert("Integration OAuth not configured yet. Add the provider credentials to .env.");
      }
    } finally {
      setConnecting(null);
    }
  }

  async function handleDisconnect(provider: string) {
    await apiClient.delete(`/integrations/${provider}`);
    setIntegrations((prev) => prev.filter((i) => i.provider !== provider));
  }

  return (
    <div className="space-y-4">
      {PROVIDERS.map((p) => {
        const connected = integrations.find((i) => i.provider === p.id);
        return (
          <div key={p.id} id={`integration-${p.id}`} className="card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-xl flex-shrink-0">
                {p.icon}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
                {connected && (
                  <p className="text-xs text-success mt-1">
                    ✓ Connected{connected.lastSyncedAt ? ` · Synced ${new Date(connected.lastSyncedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
              </div>
            </div>

            {connected ? (
              <button onClick={() => handleDisconnect(p.id)} className="btn-destructive text-xs py-1.5 px-3 flex-shrink-0">
                Disconnect
              </button>
            ) : (
              <button
                id={`connect-${p.id}-btn`}
                onClick={() => handleConnect(p.id)}
                className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                disabled={connecting === p.id}
              >
                {connecting === p.id ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
