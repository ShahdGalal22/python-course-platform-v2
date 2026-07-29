import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

// Which lesson IDs the current student has unlocked. Refetch() is exposed
// so the lesson-unlock modal can refresh this right after a successful redeem.
export function useUnlockedLessons() {
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setUnlockedIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { unlocked } = await api.getUnlocked();
      setUnlockedIds(new Set(unlocked.map((u) => u.lesson_id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { unlockedIds, loading, refetch };
}
