import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import LessonListItem from "../components/LessonListItem.jsx";
import { useCourseContent } from "../hooks/useCourseContent.js";
import { useUnlockedLessons } from "../hooks/useUnlockedLessons.js";
import { FullPageSpinner } from "../components/ProtectedRoute.jsx";

export default function LessonPage() {
  const { lessonId } = useParams();
  const { sessions, loading: contentLoading } = useCourseContent();
  const { unlockedIds, loading: unlockLoading } = useUnlockedLessons();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allLessons = sessions.flatMap((s) => s.lessons);
  const session = sessions.find((s) => s.lessons.some((l) => l.id === lessonId));
  const [activeId, setActiveId] = useState(lessonId);

  useEffect(() => setActiveId(lessonId), [lessonId]);

  if (contentLoading || unlockLoading) return <FullPageSpinner />;

  const activeLesson = allLessons.find((l) => l.id === activeId);

  if (!activeLesson || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-xl font-semibold mb-2">Lesson not found</p>
          <Link to="/dashboard" className="text-mint-dim dark:text-mint-bright underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  // Guard: a student can't view a lesson they haven't unlocked, even by URL.
  if (!unlockedIds.has(activeLesson.id)) {
    return <Navigate to="/dashboard" replace />;
  }

  const lessonIndex = session.lessons.findIndex((l) => l.id === activeLesson.id);
  const goToLesson = (offset) => {
    const next = session.lessons[lessonIndex + offset];
    if (next && unlockedIds.has(next.id)) {
      setActiveId(next.id);
      setSidebarOpen(false);
      window.history.replaceState(null, "", `/lesson/${next.id}`);
    }
  };

  const Sidebar = (
    <div className="flex flex-col gap-1">
      {session.lessons.map((lesson) => (
        <LessonListItem
          key={lesson.id}
          lesson={lesson}
          active={lesson.id === activeLesson.id}
          unlocked={unlockedIds.has(lesson.id)}
          onSelect={(l) => {
            setActiveId(l.id);
            setSidebarOpen(false);
            window.history.replaceState(null, "", `/lesson/${l.id}`);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <p className="text-xs font-mono text-slate-400 mb-1">{session.title}</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold">{activeLesson.title}</h1>
        </div>

        {/* Mobile: video first, playlist below. Desktop: playlist left, video right — per spec. */}
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
          <div className="hidden lg:block card p-3 h-fit sticky top-24 order-1">{Sidebar}</div>

          <div className="flex flex-col gap-4 order-2">
            <VideoPlayer lesson={activeLesson} />

            <div className="card p-4 sm:p-5 flex flex-col gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">{activeLesson.description}</p>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-paper-border dark:border-ink-border">
                <button onClick={() => goToLesson(-1)} disabled={lessonIndex <= 0} className="btn-secondary py-2.5 px-4 text-sm flex-1 sm:flex-none">
                  ← Previous
                </button>
                <button onClick={() => setSidebarOpen(true)} className="btn-secondary py-2.5 px-4 text-sm lg:hidden flex-1">
                  Lessons ({session.lessons.length})
                </button>
                <button
                  onClick={() => goToLesson(1)}
                  disabled={lessonIndex >= session.lessons.length - 1 || !unlockedIds.has(session.lessons[lessonIndex + 1]?.id)}
                  className="btn-primary py-2.5 px-4 text-sm flex-1 sm:flex-none"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close lesson list" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 bg-paper dark:bg-ink rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">Lessons</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-sm text-slate-400" aria-label="Close">Close</button>
            </div>
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
