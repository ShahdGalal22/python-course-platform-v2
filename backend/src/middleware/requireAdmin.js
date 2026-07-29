// Runs after requireAuth. Confirms the logged-in user is in the `admins`
// allowlist table before letting them anywhere near admin routes.

import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export async function requireAdmin(req, res, next) {
  const { data, error } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error || !data) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}
