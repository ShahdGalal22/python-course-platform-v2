import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signUp(form);
      // If your Supabase project has "Confirm email" enabled, the user
      // must click a confirmation link before they can log in.
      setDone(true);
    } catch (err) {
      setError(err.message || "Couldn't create your account.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="card w-full max-w-sm p-6 sm:p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h1 className="font-display text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              We sent a confirmation link to <strong>{form.email}</strong>. Confirm it, then log in.
            </p>
            <Link to="/login" className="btn-primary w-full">Go to login</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Free to register — lessons unlock with an access code.</p>

          <label className="block text-sm font-medium mb-1.5" htmlFor="fullName">Full name</label>
          <input id="fullName" required value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input mb-4" />

          <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mb-4" />

          <label className="block text-sm font-medium mb-1.5" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
          <p className="text-xs text-slate-400 mt-1.5">At least 6 characters.</p>

          {error && <p role="alert" className="text-sm text-red-500 mt-3">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account? <Link to="/login" className="text-mint-dim dark:text-mint-bright hover:underline">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
