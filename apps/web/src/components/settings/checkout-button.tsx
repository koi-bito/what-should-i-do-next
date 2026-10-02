"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

export function CheckoutButton({ plan }: { plan: "pro" | "team" }) {
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useToast();

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const { url } = await apiClient.post<{ url: string }>("/subscriptions/checkout", { plan });
      window.location.href = url;
    } catch (err: any) {
      error(err.message ?? "Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="btn-primary inline-flex items-center justify-center text-sm py-2.5 px-6 shadow-glow-primary"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        "Upgrade now →"
      )}
    </button>
  );
}
