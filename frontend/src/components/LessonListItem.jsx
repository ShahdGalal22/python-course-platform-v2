export default function LessonListItem({ lesson, active, unlocked, onSelect }) {
  return (
    <button
      onClick={() => unlocked && onSelect(lesson)}
      disabled={!unlocked}
      aria-current={active ? "true" : "false"}
      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-colors
      ${active ? "bg-mint/15 border border-mint/40" : "hover:bg-paper-surface dark:hover:bg-ink-soft border border-transparent"}
      ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-mono border border-paper-border dark:border-ink-border text-slate-400">
        {unlocked ? "" : "🔒"}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-medium truncate ${active ? "text-mint-dim dark:text-mint-bright" : ""}`}>
          {lesson.title}
        </span>
        <span className="block text-xs text-slate-400 font-mono mt-0.5">{lesson.duration}</span>
      </span>
    </button>
  );
}
