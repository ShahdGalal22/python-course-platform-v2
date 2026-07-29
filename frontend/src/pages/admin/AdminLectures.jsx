import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

const emptyLesson = {
  title: "", description: "", duration: "", video_url: "", thumbnail_url: "",
  resource_url: "", homework_url: "", session_id: ""
};

export default function AdminLectures() {
  const [sessions, setSessions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({ title: "", description: "" });
  const [newLesson, setNewLesson] = useState(emptyLesson);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([api.admin.listSessions(), api.admin.listLessons()]);
      setSessions(s.sessions);
      setLessons(l.lessons);
    } catch {
      setError("Couldn't load lectures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createSession = async (e) => {
    e.preventDefault();
    if (!newSession.title.trim()) return;
    await api.admin.createSession({ ...newSession, order_index: sessions.length });
    setNewSession({ title: "", description: "" });
    load();
  };

  const createLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title.trim() || !newLesson.session_id) return;
    await api.admin.createLesson(newLesson);
    setNewLesson(emptyLesson);
    load();
  };

  const patchLesson = async (id, updates) => {
    await api.admin.updateLesson(id, updates);
    load();
  };

  const deleteLesson = async (id) => {
    if (!confirm("Delete this lesson? This can't be undone.")) return;
    await api.admin.deleteLesson(id);
    load();
  };

  if (loading) {
    return <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}</div>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Lectures</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Manage sessions and lessons.</p>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* New session */}
      <form onSubmit={createSession} className="card p-5 mb-8 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <div>
          <label className="block text-sm font-medium mb-1.5">Session title</label>
          <input value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <input value={newSession.description} onChange={(e) => setNewSession({ ...newSession, description: e.target.value })} className="input" />
        </div>
        <button type="submit" className="btn-primary py-2.5">+ Session</button>
      </form>

      {/* New lesson */}
      <form onSubmit={createLesson} className="card p-5 mb-10 grid gap-3 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-display font-semibold">Add a lesson</h2>
        <select value={newLesson.session_id} onChange={(e) => setNewLesson({ ...newLesson, session_id: e.target.value })} className="input">
          <option value="">Select a session...</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <input placeholder="Lesson title" value={newLesson.title} onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })} className="input" />
        <input placeholder="Duration (e.g. 10:00)" value={newLesson.duration} onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} className="input" />
        <input placeholder="Video URL" value={newLesson.video_url} onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })} className="input" />
        <input placeholder="Thumbnail URL (optional)" value={newLesson.thumbnail_url} onChange={(e) => setNewLesson({ ...newLesson, thumbnail_url: e.target.value })} className="input" />
        <input placeholder="Resource URL — PDF/ZIP link (optional)" value={newLesson.resource_url} onChange={(e) => setNewLesson({ ...newLesson, resource_url: e.target.value })} className="input" />
        <input placeholder="Homework URL (optional)" value={newLesson.homework_url} onChange={(e) => setNewLesson({ ...newLesson, homework_url: e.target.value })} className="input sm:col-span-2" />
        <textarea placeholder="Description" value={newLesson.description} onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })} className="input sm:col-span-2" rows={2} />
        <button type="submit" className="btn-primary sm:col-span-2">+ Add lesson</button>
      </form>

      {/* Existing lessons, grouped by session */}
      {sessions.map((session) => (
        <div key={session.id} className="mb-8">
          <h3 className="font-display font-semibold mb-3">{session.title}</h3>
          <div className="flex flex-col gap-3">
            {lessons.filter((l) => l.session_id === session.id).map((lesson) => (
              <div key={lesson.id} className="card p-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-400 font-mono">{lesson.duration}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => patchLesson(lesson.id, { is_published: !lesson.is_published })}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    {lesson.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => patchLesson(lesson.id, { is_hidden: !lesson.is_hidden })}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    {lesson.is_hidden ? "Unhide" : "Hide"}
                  </button>
                  <button onClick={() => deleteLesson(lesson.id)} className="text-xs font-medium text-red-500 hover:underline px-1">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {lessons.filter((l) => l.session_id === session.id).length === 0 && (
              <p className="text-sm text-slate-400">No lessons in this session yet.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
