import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

// Public, published course content — read directly from Supabase using the
// anon key. This is safe because Row Level Security only exposes rows
// where is_published = true (see database/schema.sql), so there's nothing
// here a logged-out visitor shouldn't see.
export function useCourseContent() {
  const [sessions, setSessions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [sessionsRes, lessonsRes] = await Promise.all([
        supabase.from("sessions").select("*").order("order_index"),
        supabase.from("lessons").select("*").order("order_index")
      ]);

      if (cancelled) return;

      if (sessionsRes.error || lessonsRes.error) {
        setError(sessionsRes.error || lessonsRes.error);
      } else {
        setSessions(sessionsRes.data || []);
        setLessons(lessonsRes.data || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionsWithLessons = sessions.map((s) => ({
    ...s,
    lessons: lessons.filter((l) => l.session_id === s.id)
  }));

  return { sessions: sessionsWithLessons, loading, error };
}
