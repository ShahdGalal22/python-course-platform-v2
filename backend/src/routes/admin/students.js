import { Router } from "express";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const router = Router();

// GET /api/admin/students?search=
router.get("/", async (req, res) => {
  const search = (req.query.search || "").trim();

  let query = supabaseAdmin.from("profiles").select("id, full_name, is_disabled, created_at").order("created_at", { ascending: false });
  if (search) query = query.ilike("full_name", `%${search}%`);

  const { data: profiles, error } = await query;
  if (error) return res.status(500).json({ error: "server_error" });

  // Pull emails from auth.users (admin API) and unlock counts, then merge.
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map((authData?.users || []).map((u) => [u.id, u.email]));

  const { data: unlocks } = await supabaseAdmin.from("unlocked_lessons").select("student_id");
  const unlockCountById = new Map();
  for (const u of unlocks || []) {
    unlockCountById.set(u.student_id, (unlockCountById.get(u.student_id) || 0) + 1);
  }

  const students = profiles.map((p) => ({
    ...p,
    email: emailById.get(p.id) || "",
    unlockedLectures: unlockCountById.get(p.id) || 0
  }));

  res.json({ students });
});

// PATCH /api/admin/students/:id — toggle disabled
router.patch("/:id", async (req, res) => {
  const { is_disabled } = req.body || {};
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ is_disabled: !!is_disabled })
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error || !data) return res.status(404).json({ error: "Student not found" });
  res.json({ student: data });
});

export default router;
