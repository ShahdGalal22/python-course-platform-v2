// The ONE place in this project allowed to use the service role key.
// This client bypasses Row Level Security completely, so it must never be
// imported by anything reachable from the frontend — only by backend
// routes that have already checked auth/admin status themselves.

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
