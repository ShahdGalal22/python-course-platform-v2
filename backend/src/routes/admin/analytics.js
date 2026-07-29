// MVP analytics: just a per-lesson unlock count, as scoped in the brief.
import { Router } from "express";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from("lessons")
    .select("id, title");
  if (lessonsError) return res.status(500).json({ error: "server_error" });

  const { data: unlocks, error: unlocksError } = await supabaseAdmin
    .from("unlocked_lessons")
    .select("lesson_id");
  if (unlocksError) return res.status(500).json({ error: "server_error" });

  const countByLesson = new Map();
  for (const u of unlocks) {
    countByLesson.set(u.lesson_id, (countByLesson.get(u.lesson_id) || 0) + 1);
  }

  const { count: studentCount } = await supabaseAdmin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const perLesson = lessons.map((l) => ({
    lessonId: l.id,
    title: l.title,
    unlockedBy: countByLesson.get(l.id) || 0
  }));

  res.json({ totalStudents: studentCount || 0, perLesson });
});

export default router;
