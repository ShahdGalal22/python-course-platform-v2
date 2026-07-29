import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

function isExpired(expiresAt) {
  return expiresAt && new Date(expiresAt) < new Date();
}

export default function AdminAccessCodes() {
  const [codes, setCodes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ lesson_id: "", note: "", expires_at: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([api.admin.listCodes(), api.admin.listLessons()]);
      setCodes(c.codes);
      setLessons(l.lessons);
    } catch {
      setError("Couldn't load access codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.lesson_id) return;
    setCreating(true);
    try {
      await api.admin.createCode({ ...form, expires_at: form.expires_at || null });
      setForm({ lesson_id: "", note: "", expires_at: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (code) => {
    await api.admin.updateCode(code.id, { status: code.status === "active" ? "deactivated" : "active" });
    load();
  };

  const handleDelete = async (code) => {
    if (!confirm(`Delete ${code.code}?`)) return;
    await api.admin.deleteCode(code.id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Access codes</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Each code unlocks exactly one lesson.</p>

      <form onSubmit={handleCreate} className="card p-5 mb-8 grid gap-3 sm:grid-cols-4 sm:items-end">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5">Lesson</label>
          <select value={form.lesson_id} onChange={(e) => setForm({ ...form, lesson_id: e.target.value })} className="input">
            <option value="">Select a lesson...</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Note</label>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Student name" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Expires</label>
          <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="input" />
        </div>
        <button type="submit" disabled={creating} className="btn-primary sm:col-span-4">
          {creating ? "Creating..." : "+ Generate code"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-paper-border dark:border-ink-border">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Lesson</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const expired = isExpired(c.expires_at);
                const used = !c.reusable && c.used_count >= c.max_uses;
                return (
                  <tr key={c.id} className="border-b last:border-0 border-paper-border dark:border-ink-border">
                    <td className="px-4 py-3 font-mono whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.lessons?.title || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{c.note || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        expired || used ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                        : c.status === "active" ? "bg-mint/15 text-mint-dim dark:text-mint-bright"
                        : "bg-slate-200 text-slate-500 dark:bg-ink-soft dark:text-slate-400"
                      }`}>
                        {expired ? "Expired" : used ? "Used" : c.status === "active" ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => toggleStatus(c)} className="text-xs font-medium text-mint-dim dark:text-mint-bright hover:underline mr-4">
                        {c.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(c)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
