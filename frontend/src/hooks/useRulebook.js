import { useState, useEffect, useMemo, useCallback } from "react";

export function useRulebook() {
  const [rulebook, setRulebook] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRulebook = useCallback(async () => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/rulebook`);
      if (res.ok) {
        const data = await res.json();
        const rulebookData = data.rulebook || data;

        if (rulebookData.categories) {
          const flattened = [];
          rulebookData.categories.forEach((cat) => {
            if (Array.isArray(cat.activities)) {
              cat.activities.forEach((act) => {
                flattened.push({
                  ...act,
                  categoryName: cat.categoryName,
                  groupId: cat.groupId,
                });
              });
            }
          });
          setRulebook(flattened);
        }
      } else {
        throw new Error("Failed to fetch rulebook");
      }
    } catch (err) {
      console.error("Rulebook Hook error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRulebook();
  }, [fetchRulebook]);

  const categories = useMemo(() => {
    return rulebook.reduce((acc, current) => {
      const catName = current.categoryName || "Other";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(current);
      return acc;
    }, {});
  }, [rulebook]);

  const findActivity = useCallback((code) => {
    return rulebook.find((a) => (a.code || a.activityId) === code);
  }, [rulebook]);

  return { rulebook, categories, isLoading, error, findActivity };
}
