export default function Footer() {
  return (
    <footer id="contact" className="border-t border-paper-border dark:border-ink-border mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-semibold">
          <span className="w-7 h-7 rounded-lg bg-mint/15 text-mint-dim dark:text-mint-bright flex items-center justify-center font-mono text-xs">
            &gt;_
          </span>
          Python Basics
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Have a question? Reach out on WhatsApp after registering — details are sent with your welcome message.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} Python Basics</p>
      </div>
    </footer>
  );
}
