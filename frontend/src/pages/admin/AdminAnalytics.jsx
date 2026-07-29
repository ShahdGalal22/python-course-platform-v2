import { useEffect, useState } from "react";
import { api } from "../../api/client.js";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">A simple view of engagement — keep it lightweight for now.</p>

      {loading ? (
        <div className="skeleton h-40" />
      ) : (
        <>
          <div className="card p-6 mb-6 inline-block">
            <p className="text-xs text-slate-400 font-mono mb-1">Total students</p>
            <p className="font-display text-3xl font-bold">{data.totalStudents}</p>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-paper-border dark:border-ink-border">
                  <th className="px-4 py-3 font-medium">Lesson</th>
                  <th className="px-4 py-3 font-medium">Unlocked by</th>
                </tr>
              </thead>
              <tbody>
                {data.perLesson.map((l) => (
                  <tr key={l.lessonId} className="border-b last:border-0 border-paper-border dark:border-ink-border">
                    <td className="px-4 py-3">{l.title}</td>
                    <td className="px-4 py-3 font-mono">{l.unlockedBy} student{l.unlockedBy !== 1 ? "s" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
