import type { UsageSummary } from "@/types/api";
import { createSupabaseServerClient } from "@/lib/auth/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

/** Server-side data fetcher for usage summary (called in Server Components) */
export async function getUsageSummary(): Promise<UsageSummary> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return defaultUsage();
    }

    const res = await fetch(`${API_BASE}/users/me/usage`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });

    if (!res.ok) return defaultUsage();
    return await res.json() as UsageSummary;
  } catch {
    return defaultUsage();
  }
}

function defaultUsage(): UsageSummary {
  return {
    tier: "free",
    plan: "free",
    queriesUsedToday: 0,
    queriesLimit: 5,
    queriesRemaining: 5,
    streak: 0,
    todayCompleted: 0,
  };
}

