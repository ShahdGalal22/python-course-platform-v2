import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navLinks = [
  { to: "/#course", label: "Course" },
  { to: "/#instructor", label: "Instructor" },
  { to: "/#faq", label: "FAQ" }
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-paper/80 dark:bg-ink/80 border-b border-paper-border dark:border-ink-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold text-lg shrink-0">
          <span className="w-8 h-8 rounded-lg bg-mint/15 text-mint-dim dark:text-mint-bright flex items-center justify-center font-mono text-sm">
            &gt;_
          </span>
          Python Basics
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((l) => (
            <a key={l.to} href={l.to} className="text-slate-600 dark:text-slate-300 hover:text-mint-dim dark:hover:text-mint-bright transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary py-2 px-4 text-sm">Dashboard</Link>
              <button onClick={signOut} className="btn-secondary py-2 px-4 text-sm">Log out</button>
            </>
          ) : (
            <>
              <Link  to="/login"  target="_blank"  rel="noopener noreferrer"  className="btn-secondary py-2 px-4 text-sm"> Login </Link>
              <Link  to="/register"  target="_blank"  rel="noopener noreferrer"  className="btn-primary py-2 px-4 text-sm">  Register</Link>     
               </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className="block w-5 h-0.5 bg-current mb-1.5" />
          <span className="block w-5 h-0.5 bg-current mb-1.5" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-paper-border dark:border-ink-border px-4 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="text-sm font-medium py-1">
              {l.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-2">
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary w-full" onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setOpen(false); }} className="btn-secondary w-full">Log out</button>
            </>
          ) : (
            <>
              <Link  to="/login"  target="_blank"  rel="noopener noreferrer"  className="btn-secondary w-full"  onClick={() => setOpen(false)}>  Login</Link>
              <a  href="/login"  target="_blank"  rel="noopener noreferrer"  className="btn-secondary py-2 px-4 text-sm">  Login</a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
