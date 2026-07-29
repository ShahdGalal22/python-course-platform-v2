import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.admin.getSettings().then(({ settings }) => setForm(settings)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.admin.updateSettings(form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="skeleton h-64" />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Controls the landing page's course and instructor info.</p>

      <form onSubmit={handleSave} className="card p-6 grid gap-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1.5">Course title</label>
          <input value={form.course_title} onChange={(e) => setForm({ ...form, course_title: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Course description</label>
          <textarea value={form.course_description} onChange={(e) => setForm({ ...form, course_description: e.target.value })} className="input" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Instructor name</label>
          <input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Instructor bio</label>
          <textarea value={form.instructor_bio} onChange={(e) => setForm({ ...form, instructor_bio: e.target.value })} className="input" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Instructor photo URL</label>
          <input value={form.instructor_photo_url} onChange={(e) => setForm({ ...form, instructor_photo_url: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Banner image URL</label>
          <input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })} className="input" />
        </div>

        {saved && <p className="text-sm text-mint-dim dark:text-mint-bright">Settings saved.</p>}
        <button type="submit" disabled={saving} className="btn-primary w-fit">
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
