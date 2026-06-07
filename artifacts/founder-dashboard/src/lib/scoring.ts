import { DayData } from "./storage";

export const calculateScore = (day: DayData): number => {
  let score = 0;
  // Learning (4)
  if (day.hormoziWatched) score++;
  if (day.marketingVideoWatched) score++;
  if (day.threelearningsWritten) score++;
  if (day.oneImplementationWritten) score++;
  
  // English (4)
  if (day.listeningDone) score++;
  if (day.speakingDone) score++;
  if (day.readingPagesDone) score++;
  if (day.fiveWordsLearned) score++;
  
  // Sales (3)
  if (day.contacted20Owners) score++;
  if (day.followedUpLeads) score++;
  if (day.salesCallBooked) score++;
  
  // Growth (2)
  if (day.postedContent) score++;
  if (day.wroteImprovementIdea) score++;
  
  // Operations (2)
  if (day.clientTasksCompleted) score++;
  if (day.processImproved) score++;
  
  // Fitness (3)
  if (day.workoutCompleted) score++;
  if (day.threeLifresWater) score++;
  if (day.sevenHoursSleep) score++;
  
  // Founder Thinking (4)
  if (day.revenueActivity) score++;
  if (day.brandActivity) score++;
  if (day.skillBuilding) score++;
  if (day.avoidedTimeWaste) score++;

  return score; // Max 22
};

export const getStatus = (score: number): { label: string; colorClass: string; hex: string } => {
  if (score >= 18) return { label: "Excellent Day", colorClass: "text-emerald-500 bg-emerald-500/10", hex: "#10b981" };
  if (score >= 15) return { label: "Good Day", colorClass: "text-blue-500 bg-blue-500/10", hex: "#3b82f6" };
  if (score >= 12) return { label: "Average Day", colorClass: "text-amber-500 bg-amber-500/10", hex: "#f59e0b" };
  return { label: "Needs Improvement", colorClass: "text-red-500 bg-red-500/10", hex: "#ef4444" };
};

export const calculateStreak = (days: Record<string, DayData>, todayStr: string): { current: number; longest: number } => {
  let current = 0;
  let longest = 0;
  
  const dates = Object.keys(days).sort();
  
  // Calculate longest
  let tempStreak = 0;
  for (let i = 0; i < dates.length; i++) {
    const score = calculateScore(days[dates[i]]);
    if (score >= 12) { // Consider >= 12 a kept streak
      tempStreak++;
      if (tempStreak > longest) longest = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current
  const today = new Date(todayStr);
  let checkDate = new Date(today);
  
  while (true) {
    const dStr = checkDate.toISOString().split("T")[0];
    const day = days[dStr];
    if (!day) {
        if(dStr === todayStr) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        }
        break;
    }
    
    if (calculateScore(day) >= 12) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { current, longest };
};

export const daysSince = (startStr: string): number => {
  const start = new Date(startStr);
  const now = new Date();
  start.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCurrentDay = (startStr: string | null): number => {
  if (!startStr) return 1;
  return Math.min(60, daysSince(startStr) + 1);
};
