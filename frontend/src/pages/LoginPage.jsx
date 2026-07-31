import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(form);

        const result = await api.auth.me();
        console.log("ME:", result);
        
        const { role } = result;

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }

    } catch (err) {
      setError(err.message || "Couldn't log in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Log in to continue learning.</p>

          <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mb-4" />

          <label className="block text-sm font-medium mb-1.5" htmlFor="password">Password</label>
          <input id="password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />

          <div className="flex justify-end mt-2">
            <Link to="/forgot-password" className="text-xs text-mint-dim dark:text-mint-bright hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p role="alert" className="text-sm text-red-500 mt-3">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            New here? <Link to="/register" className="text-mint-dim dark:text-mint-bright hover:underline">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
