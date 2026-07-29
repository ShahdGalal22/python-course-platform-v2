import { supabase } from "../lib/supabaseClient.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

async function request(path, { method = "GET", body } = {}) {
  const token = await getAccessToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // e.g. 204 No Content
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.reason || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  redeemCode: (lessonId, code) => request("/access/redeem", { method: "POST", body: { lessonId, code } }),
  getUnlocked: () => request("/access/unlocked"),

  admin: {
    listStudents: (search = "") => request(`/admin/students${search ? `?search=${encodeURIComponent(search)}` : ""}`),
    setStudentDisabled: (id, is_disabled) =>
      request(`/admin/students/${id}`, { method: "PATCH", body: { is_disabled } }),

    listSessions: () => request("/admin/lectures/sessions"),
    createSession: (payload) => request("/admin/lectures/sessions", { method: "POST", body: payload }),
    listLessons: () => request("/admin/lectures/lessons"),
    createLesson: (payload) => request("/admin/lectures/lessons", { method: "POST", body: payload }),
    updateLesson: (id, payload) => request(`/admin/lectures/lessons/${id}`, { method: "PATCH", body: payload }),
    deleteLesson: (id) => request(`/admin/lectures/lessons/${id}`, { method: "DELETE" }),

    listCodes: () => request("/admin/codes"),
    createCode: (payload) => request("/admin/codes", { method: "POST", body: payload }),
    updateCode: (id, payload) => request(`/admin/codes/${id}`, { method: "PATCH", body: payload }),
    deleteCode: (id) => request(`/admin/codes/${id}`, { method: "DELETE" }),

    getAnalytics: () => request("/admin/analytics"),

    getSettings: () => request("/admin/settings"),
    updateSettings: (payload) => request("/admin/settings", { method: "PATCH", body: payload })
  }
};
