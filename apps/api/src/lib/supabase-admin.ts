import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
