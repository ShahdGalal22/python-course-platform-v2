import { useTheme } from "../context/ThemeContext.jsx";

const options = [
  { value: "light", label: "☀︎", title: "Light" },
  { value: "system", label: "◐", title: "System" },
  { value: "dark", label: "☾", title: "Dark" }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-paper-border dark:border-ink-border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          aria-label={o.title}
          onClick={() => setTheme(o.value)}
          className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-colors
          ${theme === o.value ? "bg-mint text-ink900" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
