import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import LectureCard from "../components/LectureCard.jsx";
import AccessCodeModal from "../components/AccessCodeModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCourseContent } from "../hooks/useCourseContent.js";
import { useUnlockedLessons } from "../hooks/useUnlockedLessons.js";

export default function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading: contentLoading } = useCourseContent();
  const { unlockedIds, loading: unlockLoading, refetch } = useUnlockedLessons();
  const [modalLesson, setModalLesson] = useState(null);

  const allLessons = sessions.flatMap((s) => s.lessons);
  const total = allLessons.length;
  const unlockedCount = allLessons.filter((l) => unlockedIds.has(l.id)).length;
  const progress = total ? Math.round((unlockedCount / total) * 100) : 0;

  const loading = contentLoading || unlockLoading;

  const statusFor = (lesson) => (unlockedIds.has(lesson.id) ? "unlocked" : "locked");

  const nextLesson = allLessons.find((l) => !unlockedIds.has(l.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
          Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Pick up where you left off, or unlock a new lesson below.
        </p>

        <div className="card p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3 gap-4">
            <span className="text-sm font-medium">Overall progress</span>
            <span className="text-sm font-mono text-mint-dim dark:text-mint-bright">{unlockedCount}/{total} lessons</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-paper-surface dark:bg-ink-soft overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-mint-dim to-mint-bright transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {nextLesson && (
          <div className="card p-5 sm:p-6 mb-8 sm:mb-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono text-slate-400 mb-1">Continue learning</p>
              <p className="font-display font-semibold">{nextLesson.title}</p>
            </div>
            <button onClick={() => setModalLesson(nextLesson)} className="btn-primary">Unlock lesson</button>
          </div>
        )}

        {sessions.map((session) => (
          <div key={session.id} className="mb-10">
            <h2 className="font-display font-semibold text-lg mb-1">{session.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{session.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {loading
                ? [...Array(2)].map((_, i) => <div key={i} className="skeleton aspect-[4/3.2]" />)
                : session.lessons.map((lesson) => (
                    <LectureCard
                      key={lesson.id}
                      lesson={lesson}
                      status={statusFor(lesson)}
                      onLockedClick={setModalLesson}
                    />
                  ))}
            </div>
          </div>
        ))}
      </main>

      <AccessCodeModal
        lesson={modalLesson}
        onClose={() => setModalLesson(null)}
        onUnlocked={async () => {
          await refetch();
          setModalLesson(null);
        }}
      />
    </div>
  );
}
