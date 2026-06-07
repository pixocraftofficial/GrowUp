import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus, calculateStreak, getCurrentDay } from "../lib/scoring";
import { Flame, CheckCircle2, Target, CalendarDays } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const QUOTES = [
  "Discipline equals freedom.",
  "Do the boring work.",
  "Action cures fear.",
  "Nobody cares. Work harder.",
  "Consistency is the ultimate growth hack.",
  "Focus on the inputs, the outputs will take care of themselves.",
  "Small daily improvements over time lead to stunning results.",
  "If you want to be in the top 1%, do what the 99% won't.",
  "You cannot outwork a bad strategy, but good strategy without execution is nothing.",
  "The only difference between a good day and a bad day is your attitude.",
];

const STATUS_COLORS: Record<string, string> = {
  excellent: "#22c55e",
  good: "#3b82f6",
  average: "#f59e0b",
  poor: "#ef4444",
};

export default function Dashboard() {
  const { days, challengeStart } = useChallenge();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = days[todayStr];
  const todayScore = todayData ? calculateScore(todayData) : 0;
  const todayStatus = getStatus(todayScore);
  const currentDayNum = getCurrentDay(challengeStart);
  const progress = Math.min(100, Math.round((currentDayNum / 60) * 100));

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => calculateStreak(days, todayStr),
    [days, todayStr]
  );

  const totalTasksCompleted = useMemo(() => {
    let total = 0;
    Object.values(days).forEach((day) => {
      Object.values(day).forEach((val) => { if (val === true) total++; });
    });
    return total;
  }, [days]);

  const recentDays = useMemo(() => {
    const arr = [];
    const date = new Date(todayStr);
    for (let i = 0; i < 7; i++) {
      const dStr = date.toISOString().split("T")[0];
      const data = days[dStr];
      const score = data ? calculateScore(data) : 0;
      arr.unshift({
        date: dStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        score,
        status: data ? getStatus(score) : null,
        hasData: !!data,
      });
      date.setDate(date.getDate() - 1);
    }
    return arr;
  }, [days, todayStr]);

  const quoteOfTheDay = QUOTES[currentDayNum % QUOTES.length];

  const stats = [
    {
      label: "Today's Score",
      value: `${todayScore}/22`,
      sub: todayData ? todayStatus.label : "Not started",
      icon: <Target className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      label: "Streak",
      value: `${currentStreak}d`,
      sub: "current",
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-400",
    },
    {
      label: "Best Streak",
      value: `${longestStreak}d`,
      sub: "all time",
      icon: <CalendarDays className="w-5 h-5" />,
      color: "text-violet-400",
    },
    {
      label: "Tasks Done",
      value: totalTasksCompleted,
      sub: "total",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Sprint Progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sprint Progress</p>
                <p className="text-2xl font-bold mt-0.5">{progress}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Day</p>
                <p className="text-2xl font-bold mt-0.5">{currentDayNum} <span className="text-muted-foreground text-base font-normal">/ 60</span></p>
              </div>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <Link href="/checklist">
              <Button className="w-full mt-4 shadow-md shadow-primary/20 h-11 font-semibold">
                <CheckCircle2 className="mr-2 w-4 h-4" />
                Fill Today's Checklist
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{s.label}</p>
                {s.sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{s.sub}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Daily Quote */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden">
          <div className="absolute top-2 left-3 text-5xl font-serif text-primary/10 leading-none select-none">&ldquo;</div>
          <CardContent className="p-5 pt-7">
            <p className="text-base font-medium italic text-foreground/90 leading-relaxed">{quoteOfTheDay}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent 7 Days */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last 7 Days</h2>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-1.5 h-20 items-end">
              {recentDays.map((day, i) => {
                const barHeight = day.hasData ? Math.max(10, (day.score / 22) * 100) : 0;
                const color = day.status ? STATUS_COLORS[day.status.key] : undefined;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="flex-1 w-full bg-muted/40 rounded-md relative overflow-hidden flex items-end">
                      {day.hasData && color && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${barHeight}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="w-full absolute bottom-0 left-0 rounded-md"
                          style={{ backgroundColor: color, opacity: 0.85 }}
                        />
                      )}
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">{day.dayName}</span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
              {[
                { label: "Excellent", color: STATUS_COLORS.excellent },
                { label: "Good", color: STATUS_COLORS.good },
                { label: "Average", color: STATUS_COLORS.average },
                { label: "Poor", color: STATUS_COLORS.poor },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[10px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
