import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Reached via the link in the password-reset email. Supabase puts the
// user into a temporary "recovery" session automatically when they land
// here, so updatePassword() just works without asking for the old password.
export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updatePassword(password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Couldn't update your password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 sm:p-8">
          <h1 className="font-display text-xl font-bold mb-1">Choose a new password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            At least 6 characters.
          </p>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">New password</label>
          <input id="password" type="password" required minLength={6} value={password}
            onChange={(e) => setPassword(e.target.value)} className="input" />
          {error && <p role="alert" className="text-sm text-red-500 mt-3">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </main>
    </div>
  );
}
