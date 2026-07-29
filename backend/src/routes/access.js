// Redeeming a code to unlock ONE lesson. This must run server-side with
// the service role key — the frontend never gets to see other codes, and
// a student can't grant themselves access by editing client-side state.

import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/redeem", requireAuth, async (req, res) => {
  const rawCode = (req.body?.code || "").trim().toUpperCase();
  const lessonId = req.body?.lessonId;

  if (!rawCode || !lessonId) {
    return res.status(400).json({ valid: false, reason: "missing_fields" });
  }

  const { data: entry, error } = await supabaseAdmin
    .from("access_codes")
    .select("*")
    .eq("code", rawCode)
    .maybeSingle();

  if (error) return res.status(500).json({ valid: false, reason: "server_error" });
  if (!entry) return res.json({ valid: false, reason: "not_found" });
  if (entry.lesson_id !== lessonId) return res.json({ valid: false, reason: "wrong_lesson" });
  if (entry.status === "deactivated") return res.json({ valid: false, reason: "deactivated" });
  if (entry.expires_at && new Date(entry.expires_at) < new Date()) {
    return res.json({ valid: false, reason: "expired" });
  }
  if (!entry.reusable && entry.used_count >= entry.max_uses) {
    return res.json({ valid: false, reason: "already_used" });
  }
  if (entry.assigned_student_id && entry.assigned_student_id !== req.user.id) {
    return res.json({ valid: false, reason: "assigned_to_someone_else" });
  }

  // Unlock the lesson for this student (idempotent: unique constraint on
  // (student_id, lesson_id) means re-redeeming the same lesson just upserts).
  const { error: unlockError } = await supabaseAdmin.from("unlocked_lessons").upsert(
    {
      student_id: req.user.id,
      lesson_id: lessonId,
      unlocked_at: new Date().toISOString(),
      expires_at: null
    },
    { onConflict: "student_id,lesson_id" }
  );

  if (unlockError) return res.status(500).json({ valid: false, reason: "server_error" });

  await supabaseAdmin
    .from("access_codes")
    .update({ used_count: entry.used_count + 1 })
    .eq("id", entry.id);

  res.json({ valid: true });
});

// GET /api/access/unlocked — which lesson IDs the current student has unlocked
router.get("/unlocked", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("unlocked_lessons")
    .select("lesson_id, unlocked_at, expires_at")
    .eq("student_id", req.user.id);

  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ unlocked: data });
});

export default router;
