"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import type { Query, Action } from "@/types/api";

export function HistoryList() {
  const [queries, setQueries] = useState<Array<Query & { action?: Action }>>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    loadQueries();
  }, []);

  async function loadQueries(cursor?: string) {
    try {
      const url = `/queries${cursor ? `?cursor=${cursor}` : ""}`;
      const data = await apiClient.get<{ data: Query[]; nextCursor: string | null }>(url);
      setQueries((prev) => (cursor ? [...prev, ...data.data] : data.data));
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No history yet</h3>
        <p className="text-sm text-muted-foreground">
          Submit your first context on the dashboard to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queries.map((query) => (
        <div
          key={query.id}
          id={`history-item-${query.id}`}
          className="card cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => setExpandedId(expandedId === query.id ? null : query.id)}
        >
          <div className="p-4 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {query.action ? (
                <p className="font-medium text-foreground text-sm truncate">
                  {query.action.title}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No action generated</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(query.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" · "}
                {query.modelUsed}
              </p>
            </div>
            {query.action && (
              <span className={`badge text-xs ml-3 flex-shrink-0 ${
                query.action.status === "accepted" || query.action.status === "completed"
                  ? "badge-success"
                  : query.action.status === "rejected"
                    ? "badge-destructive"
                    : query.action.status === "snoozed"
                      ? "badge-warning"
                      : "border border-border text-muted-foreground"
              }`}>
                {query.action.status}
              </span>
            )}
          </div>

          {expandedId === query.id && query.action && (
            <div className="px-4 pb-4 border-t border-border pt-4 animate-fade-slide-up">
              <p className="text-sm text-muted-foreground italic">
                "{query.action.reasoning}"
              </p>
            </div>
          )}
        </div>
      ))}

      {nextCursor && (
        <button
          onClick={() => loadQueries(nextCursor)}
          className="btn-ghost w-full text-sm"
        >
          Load more
        </button>
      )}
    </div>
  );
}
