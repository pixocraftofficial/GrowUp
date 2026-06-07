import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useChallenge, getLocalDateStr } from "../hooks/useChallenge";
import { calculateScore, getStatus, calculateStreak, getCurrentDay } from "../lib/scoring";
import { Flame, CheckCircle2, Target, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
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
  "Your future self is watching. Don't let them down.",
  "Execution beats perfection every single day.",
];

const STATUS_COLOR: Record<string, string> = {
  excellent: "#22c55e",
  good: "#3b82f6",
  average: "#f59e0b",
  poor: "#ef4444",
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

export default function Dashboard() {
  const { days, challengeStart } = useChallenge();
  const todayStr = getLocalDateStr();
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
    Object.values(days).forEach((day) =>
      Object.values(day).forEach((v) => { if (v === true) total++; })
    );
    return total;
  }, [days]);

  const recentDays = useMemo(() => {
    const arr = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      const dStr = getLocalDateStr(d);
      const data = days[dStr];
      const score = data ? calculateScore(data) : 0;
      arr.unshift({
        date: dStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        score,
        status: data ? getStatus(score) : null,
        hasData: !!data,
        isToday: dStr === todayStr,
      });
      d.setDate(d.getDate() - 1);
    }
    return arr;
  }, [days, todayStr]);

  const quote = QUOTES[currentDayNum % QUOTES.length];

  const stats = [
    {
      label: "Today's Score",
      value: `${todayScore}`,
      unit: "/22",
      sub: todayData ? todayStatus.label : "Not started",
      icon: Target,
      iconColor: "text-blue-400",
      glow: "shadow-blue-500/10",
    },
    {
      label: "Current Streak",
      value: `${currentStreak}`,
      unit: "days",
      sub: currentStreak > 0 ? "Keep going!" : "Start today",
      icon: Flame,
      iconColor: "text-orange-400",
      glow: "shadow-orange-500/10",
    },
    {
      label: "Longest Streak",
      value: `${longestStreak}`,
      unit: "days",
      sub: "Personal best",
      icon: CalendarDays,
      iconColor: "text-violet-400",
      glow: "shadow-violet-500/10",
    },
    {
      label: "Tasks Completed",
      value: `${totalTasksCompleted}`,
      unit: "",
      sub: "All time",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero: Sprint progress + CTA ── */}
      <motion.div {...fade(0)}>
        <Card className="relative overflow-hidden border-border/60 bg-card">
          {/* Decorative gradient orb */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Left: progress info */}
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-bold text-primary">{progress}%</span>
                  <span className="text-muted-foreground font-medium">complete</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Day <span className="font-semibold text-foreground">{currentDayNum}</span> of 60 — {60 - currentDayNum} days remaining
                </p>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden max-w-sm">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              {/* Right: CTA */}
              <Link href="/checklist">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 font-semibold px-6 h-12 w-full md:w-auto">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Fill Today's Checklist
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 4-col stat grid (2×2 mobile, 4×1 desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} {...fade(0.08 + i * 0.07)}>
              <Card className={`bg-card border-border/60 hover:border-primary/30 transition-all duration-200 hover:shadow-lg ${s.glow} group`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <div className={`w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center ${s.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{s.value}</span>
                    {s.unit && <span className="text-muted-foreground text-sm font-medium">{s.unit}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom two panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent 7 days — takes 2/3 width on desktop */}
        <motion.div className="lg:col-span-2" {...fade(0.35)}>
          <Card className="bg-card border-border/60 h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-base">Last 7 Days</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Score history</p>
                </div>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1 hover:text-foreground">
                    View all <TrendingUp className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              <div className="flex gap-2 h-28 items-end">
                {recentDays.map((day, i) => {
                  const barH = day.hasData ? Math.max(8, (day.score / 22) * 100) : 0;
                  const color = day.status ? STATUS_COLOR[day.status.key] : undefined;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.hasData ? day.score : ""}
                      </div>
                      <div className="flex-1 w-full flex items-end">
                        <div className="w-full bg-muted/40 rounded-lg overflow-hidden relative" style={{ height: "100%" }}>
                          {day.hasData && color && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${barH}%` }}
                              transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                              className="absolute bottom-0 left-0 right-0 rounded-lg"
                              style={{ backgroundColor: color, opacity: day.isToday ? 1 : 0.75 }}
                            />
                          )}
                          {day.isToday && (
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/40 rounded" />
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase ${day.isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {day.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                {[
                  { k: "excellent", label: "Excellent (18-22)" },
                  { k: "good", label: "Good (15-17)" },
                  { k: "average", label: "Average (12-14)" },
                  { k: "poor", label: "Poor (<12)" },
                ].map((l) => (
                  <div key={l.k} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[l.k] }} />
                    <span className="text-[10px] text-muted-foreground hidden sm:block">{l.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily quote — 1/3 width on desktop */}
        <motion.div {...fade(0.4)}>
          <Card className="bg-card border-border/60 h-full relative overflow-hidden">
            <div className="absolute -bottom-6 -right-4 text-[120px] font-serif text-primary/5 leading-none select-none pointer-events-none">&rdquo;</div>
            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[180px]">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Daily Fuel</p>
                <p className="text-base md:text-lg font-medium italic text-foreground/90 leading-relaxed">{quote}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-6">Day {currentDayNum} motivation</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
