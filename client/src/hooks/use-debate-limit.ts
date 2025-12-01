import { useState, useEffect } from "react";

const FREE_LIMIT = 3;
const STORAGE_KEY = "echo_chamber_debates";

interface DebateUsage {
  count: number;
  month: string; // "2024-01" format to track monthly reset
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getUsage(): DebateUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { count: 0, month: getCurrentMonth() };
    }
    const usage = JSON.parse(stored) as DebateUsage;
    // Reset if it's a new month
    if (usage.month !== getCurrentMonth()) {
      return { count: 0, month: getCurrentMonth() };
    }
    return usage;
  } catch {
    return { count: 0, month: getCurrentMonth() };
  }
}

function setUsage(usage: DebateUsage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // Ignore storage errors
  }
}

export function useDebateLimit() {
  const [usage, setUsageState] = useState<DebateUsage>(() => getUsage());
  const [isPro, setIsPro] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = getUsage();
    setUsageState(stored);
    
    // Check if user is Pro (will be set via auth later)
    const proStatus = localStorage.getItem("echo_chamber_pro");
    setIsPro(proStatus === "true");
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - usage.count);
  const canGenerate = isPro || remaining > 0;

  const recordDebate = () => {
    if (isPro) return; // Pro users don't count
    
    const newUsage = {
      count: usage.count + 1,
      month: getCurrentMonth(),
    };
    setUsageState(newUsage);
    setUsage(newUsage);
  };

  const upgradeSuccess = () => {
    setIsPro(true);
    localStorage.setItem("echo_chamber_pro", "true");
  };

  return {
    remaining,
    used: usage.count,
    limit: FREE_LIMIT,
    canGenerate,
    isPro,
    recordDebate,
    upgradeSuccess,
  };
}
