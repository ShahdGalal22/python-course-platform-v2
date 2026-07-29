import { Router } from "express";
import { customAlphabet } from "nanoid";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

const router = Router();
const nanoid = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

router.get("/", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("access_codes")
    .select("*, lessons(title)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: "server_error" });
  res.json({ codes: data });
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  if (!body.lesson_id) return res.status(400).json({ error: "lesson_id is required" });

  const code = (body.code || `PY-${nanoid()}`).trim().toUpperCase();

  const { data, error } = await supabaseAdmin
    .from("access_codes")
    .insert({
      code,
      lesson_id: body.lesson_id,
      expires_at: body.expires_at || null,
      note: body.note || null,
      max_uses: body.max_uses ?? 1,
      reusable: body.reusable ?? false,
      assigned_student_id: body.assigned_student_id || null
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "That code already exists" });
    return res.status(500).json({ error: "server_error" });
  }

  res.status(201).json({ code: data });
});

router.patch("/:id", async (req, res) => {
  const allowedFields = ["status", "expires_at", "note"];
  const updates = {};
  for (const key of allowedFields) {
    if (key in (req.body || {})) updates[key] = req.body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("access_codes")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error || !data) return res.status(404).json({ error: "Code not found" });
  res.json({ code: data });
});

router.delete("/:id", async (req, res) => {
  const { error } = await supabaseAdmin.from("access_codes").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: "server_error" });
  res.status(204).end();
});

export default router;
