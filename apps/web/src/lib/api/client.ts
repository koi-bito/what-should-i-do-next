import type { ApiError } from "@/types/api";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

async function getAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const { data: { session } } = await supabaseBrowserClient.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const authHeader = await getAuthHeader();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader,
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: { code: "NETWORK_ERROR", message: res.statusText },
    }));
    throw Object.assign(new Error(err.error.message), {
      code: err.error.code,
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => apiFetch<T>(path),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

