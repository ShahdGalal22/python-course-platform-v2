import { Link } from "react-router-dom";

const statusStyles = {
  locked: "bg-slate-200 text-slate-500 dark:bg-ink-soft dark:text-slate-400",
  unlocked: "bg-mint/15 text-mint-dim dark:text-mint-bright",
  completed: "bg-amber/20 text-amber-700 dark:text-amber-bright"
};
const statusLabels = { locked: "Locked", unlocked: "Unlocked", completed: "Completed" };

export default function LectureCard({ lesson, status, onLockedClick }) {
  const isLocked = status === "locked";

  const inner = (
    <div className="card overflow-hidden h-full flex flex-col transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-glow">
      <div className="aspect-video bg-ink-soft relative overflow-hidden">
        {lesson.thumbnail_url ? (
          <img src={lesson.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-slate-500 text-sm">
            &gt;_ {lesson.title}
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-2xl" aria-hidden="true">🔒</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-sm leading-snug">{lesson.title}</h3>
          <span className={`badge shrink-0 ${statusStyles[status]}`}>{statusLabels[status]}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{lesson.description}</p>
        <span className="mt-auto text-xs font-mono text-slate-400">{lesson.duration}</span>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <button onClick={() => onLockedClick(lesson)} className="text-left w-full h-full">
        {inner}
      </button>
    );
  }

  return (
    <Link to={`/lesson/${lesson.id}`} className="block h-full">
      {inner}
    </Link>
  );
}
