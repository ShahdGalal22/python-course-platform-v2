import "dotenv/config";
import express from "express";
import cors from "cors";

import { requireAuth } from "./src/middleware/requireAuth.js";
import { requireAdmin } from "./src/middleware/requireAdmin.js";

import accessRoutes from "./src/routes/access.js";
import adminStudents from "./src/routes/admin/students.js";
import adminLectures from "./src/routes/admin/lectures.js";
import adminCodes from "./src/routes/admin/codes.js";
import adminAnalytics from "./src/routes/admin/analytics.js";
import adminSettings from "./src/routes/admin/settings.js";

import { supabaseAdmin } from "./src/lib/supabaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN.split(",").map((s) => s.trim()) }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/auth/me", requireAuth, async (req, res) => {
  const { data } = await supabaseAdmin
    .from("admins")
    .select("user_id")
    .eq("user_id", req.user.id)
    .maybeSingle();

  res.json({
    role: data ? "admin" : "student"
  });
});

// Student-facing: requires a logged-in student
app.use("/api/access", accessRoutes);

// Admin-facing: requires login AND admin allowlist membership
const adminGuard = [requireAuth, requireAdmin];
app.use("/api/admin/students", adminGuard, adminStudents);
app.use("/api/admin/lectures", adminGuard, adminLectures);
app.use("/api/admin/codes", adminGuard, adminCodes);
app.use("/api/admin/analytics", adminGuard, adminAnalytics);
app.use("/api/admin/settings", adminGuard, adminSettings);

app.listen(PORT, () => {
  console.log(`Python Course Platform V2 API running on http://localhost:${PORT}`);
});
