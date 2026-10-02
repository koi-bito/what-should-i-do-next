"use client";

interface SkeletonCardProps {
  lines?: number;
  showActions?: boolean;
}

/**
 * Reusable skeleton loading card with configurable line count.
 */
export function SkeletonCard({ lines = 3, showActions = false }: SkeletonCardProps) {
  return (
    <div className="card p-5 space-y-3 animate-fade-slide-up">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton rounded"
          style={{
            height: i === 0 ? "14px" : "12px",
            width: i === 0 ? "60%" : i === lines - 1 ? "40%" : "85%",
          }}
        />
      ))}
      {showActions && (
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-9 flex-1 rounded-xl" />
          <div className="skeleton h-9 flex-1 rounded-xl" />
        </div>
      )}
    </div>
  );
}

/**
 * List of skeleton cards for loading states.
 */
export function SkeletonList({ count = 3, lines = 3 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

/**
 * Stats skeleton for the dashboard QuickStats area.
 */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-4 space-y-2">
          <div className="skeleton h-7 w-12 mx-auto rounded" />
          <div className="skeleton h-3 w-16 mx-auto rounded" />
        </div>
      ))}
    </div>
  );
}
