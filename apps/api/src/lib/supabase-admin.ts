import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

// Polyfill WebSocket globally for Node 20 (GitHub Actions CI) so @supabase/realtime-js can find it
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WebSocket as any;
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase-admin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Auth features will fail."
  );
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "http://localhost:54321",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
