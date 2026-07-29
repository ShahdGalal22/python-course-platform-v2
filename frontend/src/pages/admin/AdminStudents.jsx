import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (query = "") => {
    setLoading(true);
    try {
      const { students } = await api.admin.listStudents(query);
      setStudents(students);
    } catch {
      setError("Couldn't load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleDisabled = async (s) => {
    await api.admin.setStudentDisabled(s.id, !s.is_disabled);
    load(search);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Students</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">View and manage registered students.</p>

      <input
        placeholder="Search by name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
        className="input max-w-xs mb-6"
      />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <div className="flex flex-col gap-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
      ) : students.length === 0 ? (
        <p className="text-sm text-slate-400">No students yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-paper-border dark:border-ink-border">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium">Unlocked</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b last:border-0 border-paper-border dark:border-ink-border">
                  <td className="px-4 py-3">{s.full_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{s.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono">{s.unlockedLectures}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.is_disabled ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400" : "bg-mint/15 text-mint-dim dark:text-mint-bright"}`}>
                      {s.is_disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleDisabled(s)} className="text-xs font-medium text-mint-dim dark:text-mint-bright hover:underline">
                      {s.is_disabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
