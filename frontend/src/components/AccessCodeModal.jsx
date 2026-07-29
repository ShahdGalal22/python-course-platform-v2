import { useState } from "react";
import { api } from "../api/client.js";

const errorMessages = {
  not_found: "That code doesn't exist. Double-check and try again.",
  wrong_lesson: "That code is for a different lesson.",
  deactivated: "This code has been deactivated. Contact your instructor.",
  expired: "This code has expired. Contact your instructor for a new one.",
  already_used: "This code has already been used.",
  assigned_to_someone_else: "This code is assigned to a different student.",
  missing_fields: "Enter your access code to continue."
};

export default function AccessCodeModal({ lesson, onClose, onUnlocked }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!lesson) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.redeemCode(lesson.id, code.trim());
      if (result.valid) {
        onUnlocked(lesson);
      } else {
        setError(errorMessages[result.reason] || "Invalid access code.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <form onSubmit={handleSubmit} className="relative card w-full max-w-sm p-6 animate-fadeUp">
        <h2 className="font-display font-semibold text-lg mb-1">Unlock this lesson</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{lesson.title}</p>

        <label htmlFor="lesson-code" className="block text-sm font-medium mb-2">Access code</label>
        <input
          id="lesson-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PY-XXXXXX"
          className="input font-mono"
          autoComplete="off"
        />
        {error && <p role="alert" className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Checking..." : "Unlock"}
          </button>
        </div>
      </form>
    </div>
  );
}
