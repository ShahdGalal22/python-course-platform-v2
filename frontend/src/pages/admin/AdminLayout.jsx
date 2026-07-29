import { useEffect, useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { FullPageSpinner } from "../../components/ProtectedRoute.jsx";

const links = [
  { to: "/admin/students", label: "Students" },
  { to: "/admin/lectures", label: "Lectures" },
  { to: "/admin/codes", label: "Access Codes" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/settings", label: "Settings" }
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const [status, setStatus] = useState("checking"); // checking | ok | forbidden

  useEffect(() => {
    api.admin
      .getSettings()
      .then(() => setStatus("ok"))
      .catch((err) => setStatus(err.status === 403 ? "forbidden" : "ok"));
  }, []);

  if (status === "checking") return <FullPageSpinner />;
  if (status === "forbidden") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b lg:border-b-0 lg:border-r border-paper-border dark:border-ink-border p-4 lg:p-6 flex lg:flex-col gap-4 lg:h-screen lg:sticky lg:top-0">
        <div className="font-display font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-mint/15 text-mint-dim dark:text-mint-bright flex items-center justify-center font-mono text-xs">&gt;_</span>
          Admin
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-mint/15 text-mint-dim dark:text-mint-bright" : "hover:bg-paper-surface dark:hover:bg-ink-soft"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center justify-between">
          <ThemeToggle />
          <button onClick={signOut} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Log out</button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
