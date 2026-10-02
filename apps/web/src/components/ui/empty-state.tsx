"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * Reusable empty state component with animated illustration,
 * friendly copy, and primary + secondary CTAs.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="card p-12 text-center animate-fade-slide-up" role="status">
      {/* Animated icon area */}
      <div className="relative mx-auto w-20 h-20 mb-6">
        {/* Background glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-primary/10 border border-primary/20" />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl animate-float">
          {icon}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionLabel && (
          onAction ? (
            <button onClick={onAction} className="btn-primary text-sm py-2.5 px-6">
              {actionLabel}
            </button>
          ) : actionHref ? (
            <Link href={actionHref} className="btn-primary inline-block text-sm py-2.5 px-6">
              {actionLabel}
            </Link>
          ) : null
        )}
        {secondaryLabel && secondaryHref && (
          <Link href={secondaryHref} className="btn-ghost text-sm py-2.5 px-4">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
