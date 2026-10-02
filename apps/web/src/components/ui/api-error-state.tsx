"use client";

interface ApiErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Inline error state for when an API call fails.
 * Shows a friendly error with retry button.
 */
export function ApiErrorState({
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
}: ApiErrorStateProps) {
  return (
    <div className="card border-destructive/20 p-8 text-center animate-fade-slide-up" role="alert">
      <div className="w-12 h-12 mx-auto rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">Failed to load</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm py-2 px-5">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Try again
          </span>
        </button>
      )}
    </div>
  );
}
