"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getAuthHeaders } from "@/utils/api";

const StatsContext = createContext({
  stats: {
    points: 0,
    pendingCount: 0,
    facultyPending: 0,
  },
  refreshStats: async () => {},
  loading: true,
});

export const useStats = () => useContext(StatsContext);

export default function StatsProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    points: 0,
    pendingCount: 0,
    facultyPending: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const { headers, API_URL } = await getAuthHeaders();
      const role = user.user_metadata?.role || "student";

      if (role === "student") {
        const res = await fetch(`${API_URL}/student/dashboard?view=summary`, {
          headers,
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            points: data.total_approved_points || 0,
            pendingCount: data.pending_count || 0,
            facultyPending: 0,
          });
        }
      } else if (role === "faculty") {
        const res = await fetch(`${API_URL}/faculty/my-batches`, {
          headers,
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          let totalPending = 0;
          for (const batch of data.batches || []) {
            totalPending += batch.pending_submissions || 0;
          }
          setStats((prev) => ({
            ...prev,
            facultyPending: totalPending,
          }));
        }
      }
    } catch (err) {
      console.error("Error refreshing stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      refreshStats();
    }
  }, [authLoading, user, refreshStats]);

  return (
    <StatsContext.Provider
      value={{ stats, refreshStats, loading: statsLoading }}
    >
      {children}
    </StatsContext.Provider>
  );
}
