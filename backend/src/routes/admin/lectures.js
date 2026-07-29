// "Lecture" in the brief = a `lesson` row in the DB, scoped under a `session`.
import { Router } from "express";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const router = Router();

// ── Sessions ──────────────────────────────────────────────
router.get("/sessions", async (req, res) => {
  const { data, error } = await supabaseAdmin.from("sessions").select("*").order("order_index");
  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ sessions: data });
});

router.post("/sessions", async (req, res) => {
  const { title, description, order_index } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .insert({ title, description: description || "", order_index: order_index ?? 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: "server_error" });
  res.status(201).json({ session: data });
});

// ── Lessons ───────────────────────────────────────────────
router.get("/lessons", async (req, res) => {
  const { data, error } = await supabaseAdmin.from("lessons").select("*").order("order_index");
  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ lessons: data });
});

router.post("/lessons", async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.session_id) {
    return res.status(400).json({ error: "title and session_id are required" });
  }

  const { data, error } = await supabaseAdmin
    .from("lessons")
    .insert({
      session_id: body.session_id,
      title: body.title,
      description: body.description || "",
      duration: body.duration || "",
      video_url: body.video_url || "",
      thumbnail_url: body.thumbnail_url || "",
      resource_url: body.resource_url || null,
      homework_url: body.homework_url || null,
      order_index: body.order_index ?? 0,
      is_published: body.is_published ?? true,
      is_hidden: body.is_hidden ?? false
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: "server_error" });
  res.status(201).json({ lesson: data });
});

router.patch("/lessons/:id", async (req, res) => {
  const allowedFields = [
    "title", "description", "duration", "video_url", "thumbnail_url",
    "resource_url", "homework_url", "order_index", "is_published", "is_hidden", "session_id"
  ];
  const updates = {};
  for (const key of allowedFields) {
    if (key in (req.body || {})) updates[key] = req.body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("lessons")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error || !data) return res.status(404).json({ error: "Lesson not found" });
  res.json({ lesson: data });
});

router.delete("/lessons/:id", async (req, res) => {
  const { error } = await supabaseAdmin.from("lessons").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: "server_error" });
  res.status(204).end();
});

export default router;
