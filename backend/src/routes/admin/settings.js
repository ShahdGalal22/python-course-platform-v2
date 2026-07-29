import { Router } from "express";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const router = Router();

router.get("/", async (req, res) => {
  const { data, error } = await supabaseAdmin.from("course_settings").select("*").eq("id", 1).single();
  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ settings: data });
});

router.patch("/", async (req, res) => {
  const allowedFields = [
    "course_title", "course_description", "instructor_name",
    "instructor_bio", "instructor_photo_url", "banner_url", "social_links"
  ];
  const updates = {};
  for (const key of allowedFields) {
    if (key in (req.body || {})) updates[key] = req.body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("course_settings")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();

  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ settings: data });
});

export default router;
