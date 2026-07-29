import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Couldn't send the reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="card w-full max-w-sm p-6 sm:p-8">
          {sent ? (
            <>
              <h1 className="font-display text-xl font-bold mb-2">Check your email</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
              <Link to="/login" className="btn-primary w-full">Back to login</Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="font-display text-xl font-bold mb-1">Reset your password</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                Enter your email and we'll send you a reset link.
              </p>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="input" />
              {error && <p role="alert" className="text-sm text-red-500 mt-3">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
