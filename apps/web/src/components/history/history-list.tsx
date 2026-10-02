"use client";

import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api/client";
import type { Query, Action, ActionStatus } from "@/types/api";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiErrorState } from "@/components/ui/api-error-state";
import { SkeletonList } from "@/components/ui/skeleton";

type FilterStatus = "all" | ActionStatus;

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "snoozed", label: "Snoozed" },
  { value: "suggested", label: "Pending" },
];

const STATUS_BADGE: Record<string, string> = {
  accepted: "badge-success",
  completed: "badge-success",
  rejected: "badge-destructive",
  snoozed: "badge-warning",
  suggested: "border border-border text-muted-foreground",
};

export function HistoryList() {
  const [queries, setQueries] = useState<Array<Query & { action?: Action }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadQueries();
  }, []);

  async function loadQueries(cursor?: string) {
    if (cursor) setIsLoadingMore(true);
    setError(null);

    try {
      const url = `/queries${cursor ? `?cursor=${cursor}` : ""}`;
      const data = await apiClient.get<{ data: Query[]; nextCursor: string | null }>(url);
      setQueries((prev) => (cursor ? [...prev, ...data.data] : data.data));
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message ?? "Failed to load history");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }

  // Client-side filtering
  const filteredQueries = useMemo(() => {
    let result = queries;

    if (statusFilter !== "all") {
      result = result.filter((q) => q.action?.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (query) =>
          query.action?.title?.toLowerCase().includes(q) ||
          query.action?.reasoning?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [queries, statusFilter, searchQuery]);

  if (loading) {
    return <SkeletonList count={5} lines={2} />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={() => loadQueries()} />;
  }

  if (queries.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No history yet"
        description="Submit your first context on the dashboard to get started. Your past queries and actions will appear here."
        actionLabel="Go to dashboard"
        actionHref="/app"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="history-search"
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10"
            aria-label="Search query history"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                statusFilter === f.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
              }`}
              aria-label={`Filter by ${f.label}`}
              aria-pressed={statusFilter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(statusFilter !== "all" || searchQuery) && (
        <p className="text-xs text-muted-foreground animate-fade-in">
          {filteredQueries.length} result{filteredQueries.length !== 1 ? "s" : ""}
          {statusFilter !== "all" && ` · ${statusFilter}`}
          {searchQuery && ` · "${searchQuery}"`}
        </p>
      )}

      {/* Empty filtered state */}
      {filteredQueries.length === 0 ? (
        <div className="card p-8 text-center animate-fade-slide-up">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-base font-semibold text-foreground mb-1">No matching results</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={() => { setStatusFilter("all"); setSearchQuery(""); }}
            className="btn-ghost text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Query history">
          {filteredQueries.map((query, index) => (
            <div
              key={query.id}
              id={`history-item-${query.id}`}
              role="listitem"
              className="card cursor-pointer hover:border-primary/30 transition-all duration-200"
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => setExpandedId(expandedId === query.id ? null : query.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(expandedId === query.id ? null : query.id);
                }
              }}
              tabIndex={0}
              aria-expanded={expandedId === query.id}
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
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      {new Date(query.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <span className="text-xs text-muted-foreground/40">·</span>
                    <p className="text-xs text-muted-foreground">{query.modelUsed}</p>
                    {query.action?.estimatedMinutes && (
                      <>
                        <span className="text-xs text-muted-foreground/40">·</span>
                        <p className="text-xs text-muted-foreground">~{query.action.estimatedMinutes}m</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {query.action && (
                    <span className={`badge text-xs ${STATUS_BADGE[query.action.status] ?? STATUS_BADGE.suggested}`}>
                      {query.action.status}
                    </span>
                  )}
                  {/* Expand chevron */}
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      expandedId === query.id ? "rotate-180" : ""
                    }`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Expanded reasoning */}
              {expandedId === query.id && query.action && (
                <div className="px-4 pb-4 border-t border-border pt-4 animate-slide-down">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    &ldquo;{query.action.reasoning}&rdquo;
                  </p>
                  {query.action.resolvedAt && (
                    <p className="text-xs text-muted-foreground/60 mt-3">
                      Resolved {new Date(query.action.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {nextCursor && (
        <button
          onClick={() => loadQueries(nextCursor)}
          disabled={isLoadingMore}
          className="btn-ghost w-full text-sm py-3"
        >
          {isLoadingMore ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </span>
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  );
}
