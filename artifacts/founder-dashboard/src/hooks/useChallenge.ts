import { useState, useEffect, useCallback } from "react";
import { storage, DayData, getEmptyDayData } from "../lib/storage";

export function useChallenge() {
  const [days, setDays] = useState<Record<string, DayData>>({});
  const [challengeStart, setChallengeStart] = useState<string | null>(null);

  useEffect(() => {
    let start = storage.getChallengeStart();
    if (!start) {
      start = new Date().toISOString();
      storage.setChallengeStart(start);
    }
    setChallengeStart(start);
    setDays(storage.getDays());
  }, []);

  const getDay = useCallback((dateStr: string) => {
    return days[dateStr] || getEmptyDayData(dateStr);
  }, [days]);

  const updateDay = useCallback((dateStr: string, updates: Partial<DayData>) => {
    setDays(prev => {
      const current = prev[dateStr] || getEmptyDayData(dateStr);
      const updated = { ...current, ...updates };
      storage.saveDay(updated);
      return { ...prev, [dateStr]: updated };
    });
  }, []);

  const resetChallenge = useCallback(() => {
    storage.resetChallenge();
    const start = new Date().toISOString();
    storage.setChallengeStart(start);
    setChallengeStart(start);
    setDays({});
  }, []);

  const refresh = useCallback(() => {
    setDays(storage.getDays());
    const start = storage.getChallengeStart();
    if (start) setChallengeStart(start);
  }, []);

  return {
    days,
    challengeStart,
    getDay,
    updateDay,
    resetChallenge,
    refreshDays: refresh,
  };
}

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pixocraft_theme");
      if (saved) return saved === "dark";
    }
    // Default to dark — this is a premium dark-first app
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("pixocraft_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("pixocraft_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return { isDark, toggleTheme };
}

/** Returns today's date string in local time — "YYYY-MM-DD" */
export function getLocalDateStr(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
