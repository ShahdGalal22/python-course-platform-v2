// Verifies the Supabase access token the frontend sends on every request
// (Authorization: Bearer <token>). This is what tells the backend which
// student is calling, without the backend ever handling passwords itself —
// Supabase already verified the password at login and issued this token.

import { supabaseAdmin } from "../lib/supabaseAdmin.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = data.user;
  next();
}
