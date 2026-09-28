import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

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
    global: {
      // @ts-ignore - Supabase JS v2 types don't include WebSocket, but runtime requires it on Node < 22
      WebSocket: WebSocket as any,
    },
  }
);
