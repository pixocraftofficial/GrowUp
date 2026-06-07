import React, { useMemo } from "react";
import { useChallenge, getLocalDateStr } from "../hooks/useChallenge";
import { calculateScore, getStatus, calculateStreak, getCurrentDay } from "../lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "wouter";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Cell, PieChart, Pie, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Target, Flame, DollarSign, Users } from "lucide-react";

/* ── helpers ─────────────────────────────────── */
const STATUS_HEX: Record<string, string> = {
  excellent: "#10b981",
  good:      "#3b82f6",
  average:   "#f59e0b",
  poor:      "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border p-3 rounded-xl shadow-xl text-sm min-w-[120px]">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="flex justify-between gap-4" style={{ color: e.color }}>
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-bold">{e.value}</span>
        </p>
      ))}
    </div>
  );
};

const axis = { stroke: "#6b7280", fontSize: 11, tickLine: false, axisLine: false };

const EmptyChart = ({ children }: { children?: React.ReactNode }) => (
  <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-4">
    <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center">
      <TrendingUp className="w-6 h-6 text-muted-foreground/40" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">No data yet</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">Complete your first checklist to see this chart</p>
    </div>
    {children}
  </div>
);

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

/* ── Category definitions ────────────────────── */
const CATEGORIES = [
  {
    label: "Learning",
    keys: ["hormoziWatched", "marketingVideoWatched", "threelearningsWritten", "oneImplementationWritten"] as const,
    max: 4, color: "#3b82f6",
  },
  {
    label: "English",
    keys: ["listeningDone", "speakingDone", "readingPagesDone", "fiveWordsLearned"] as const,
    max: 4, color: "#8b5cf6",
  },
  {
    label: "Sales",
    keys: ["contacted20Owners", "followedUpLeads", "salesCallBooked"] as const,
    max: 3, color: "#06b6d4",
  },
  {
    label: "Growth",
    keys: ["postedContent", "wroteImprovementIdea"] as const,
    max: 2, color: "#f59e0b",
  },
  {
    label: "Ops",
    keys: ["clientTasksCompleted", "processImproved"] as const,
    max: 2, color: "#10b981",
  },
  {
    label: "Fitness",
    keys: ["workoutCompleted", "threeLifresWater", "sevenHoursSleep"] as const,
    max: 3, color: "#f43f5e",
  },
  {
    label: "Founder",
    keys: ["revenueActivity", "brandActivity", "skillBuilding", "avoidedTimeWaste"] as const,
    max: 4, color: "#a78bfa",
  },
];

/* ── Habit rows for the consistency section ── */
const HABITS = [
  { key: "hormoziWatched",         label: "Hormozi video" },
  { key: "marketingVideoWatched",  label: "Marketing video" },
  { key: "threelearningsWritten",  label: "3 learnings written" },
  { key: "listeningDone",          label: "20m listening" },
  { key: "speakingDone",           label: "20m speaking" },
  { key: "contacted20Owners",      label: "20 contacts" },
  { key: "workoutCompleted",       label: "Workout" },
  { key: "threeLifresWater",       label: "3L water" },
  { key: "sevenHoursSleep",        label: "7h sleep" },
  { key: "postedContent",          label: "Content posted" },
  { key: "revenueActivity",        label: "Revenue activity" },
  { key: "avoidedTimeWaste",       label: "No time waste" },
] as const;

/* ── Component ───────────────────────────────── */
export default function Analytics() {
  const { days, challengeStart } = useChallenge();
  const todayStr = getLocalDateStr();
  const dayEntries = Object.keys(days).sort();
  const hasData   = dayEntries.length > 0;
  const dayCount  = dayEntries.length;

  /* summary stats */
  const summary = useMemo(() => {
    if (!hasData) return { avgScore: 0, totalRev: 0, totalLeads: 0, bestScore: 0, streak: 0 };
    let scoreSum = 0, totalRev = 0, totalLeads = 0, bestScore = 0;
    dayEntries.forEach((d) => {
      const s = calculateScore(days[d]);
      scoreSum += s;
      if (s > bestScore) bestScore = s;
      totalRev   += days[d].revenueGenerated   || 0;
      totalLeads += (days[d].leadsContacted    || 0) + (days[d].newLeadsContacted || 0);
    });
    const { current } = calculateStreak(days, todayStr);
    return {
      avgScore:   Math.round((scoreSum / dayCount) * 10) / 10,
      totalRev,
      totalLeads,
      bestScore,
      streak: current,
    };
  }, [days, dayEntries, hasData, dayCount, todayStr]);

  /* score trend (last 30 days) */
  const trendData = useMemo(() =>
    dayEntries.slice(-30).map((d) => {
      const s = calculateScore(days[d]);
      return { date: d.substring(5), score: s, completion: Math.round((s / 22) * 100) };
    }), [days, dayEntries]);

  /* revenue / leads (last 30 days) */
  const revenueData = useMemo(() =>
    dayEntries.slice(-30).map((d) => ({
      date: d.substring(5),
      revenue: days[d].revenueGenerated || 0,
      leads:   (days[d].leadsContacted  || 0) + (days[d].newLeadsContacted || 0),
    })), [days, dayEntries]);

  /* category avg (radar) */
  const radarData = useMemo(() => {
    if (!hasData) return [];
    return CATEGORIES.map((cat) => {
      let total = 0;
      dayEntries.forEach((d) => {
        cat.keys.forEach((k) => { if ((days[d] as any)[k]) total++; });
      });
      const maxPossible = cat.max * dayCount;
      return { label: cat.label, value: maxPossible ? Math.round((total / maxPossible) * 100) : 0 };
    });
  }, [days, dayEntries, hasData, dayCount]);

  /* score distribution pie */
  const distData = useMemo(() => {
    const counts = { excellent: 0, good: 0, average: 0, poor: 0 };
    dayEntries.forEach((d) => {
      const st = getStatus(calculateScore(days[d]));
      const key = st.label.toLowerCase().split(" ")[0] as keyof typeof counts;
      if (key in counts) counts[key]++;
    });
    return [
      { name: "Excellent", value: counts.excellent, color: STATUS_HEX.excellent },
      { name: "Good",      value: counts.good,      color: STATUS_HEX.good },
      { name: "Average",   value: counts.average,   color: STATUS_HEX.average },
      { name: "Poor",      value: counts.poor,      color: STATUS_HEX.poor },
    ].filter((d) => d.value > 0);
  }, [days, dayEntries]);

  /* habit consistency */
  const habitData = useMemo(() => {
    if (!hasData) return [];
    return HABITS.map((h) => {
      const done = dayEntries.filter((d) => (days[d] as any)[h.key] === true).length;
      return { label: h.label, pct: Math.round((done / dayCount) * 100), done, total: dayCount };
    }).sort((a, b) => b.pct - a.pct);
  }, [days, dayEntries, hasData, dayCount]);

  const statCards = [
    { label: "Avg Daily Score",    value: hasData ? `${summary.avgScore}/22` : "—", icon: Target,     color: "text-blue-400",   bg: "bg-blue-500/10"   },
    { label: "Best Score",         value: hasData ? `${summary.bestScore}/22` : "—", icon: Flame,    color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Total Revenue",      value: hasData ? `₹${summary.totalRev.toLocaleString()}` : "—", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Leads",        value: hasData ? String(summary.totalLeads) : "—", icon: Users,   color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">

      {/* ── If zero data: big CTA ── */}
      {!hasData && (
        <motion.div {...fade(0)}>
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">No data yet</h2>
                <p className="text-muted-foreground mt-1 text-sm max-w-sm">
                  Fill in your first daily checklist and come back here to see your scores, revenue, habits, and category breakdown.
                </p>
              </div>
              <Link href="/checklist">
                <Button className="gap-2 mt-2 shadow-lg shadow-primary/20">
                  Fill Today's Checklist <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} {...fade(i * 0.07)}>
              <Card className="bg-card border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                    <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{dayCount} days tracked</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Score trend + distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Score trend — 2/3 */}
        <motion.div className="lg:col-span-2" {...fade(0.2)}>
          <Card className="bg-card border-border/60 h-full">
            <CardHeader className="px-5 py-4 pb-2">
              <CardTitle className="text-sm font-semibold">Daily Score Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Last {trendData.length || 30} days</p>
            </CardHeader>
            <CardContent className="px-3 pb-4 h-[220px]">
              {trendData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" vertical={false} />
                    <XAxis dataKey="date" {...axis} />
                    <YAxis {...axis} domain={[0, 22]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" name="Score" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Score distribution pie — 1/3 */}
        <motion.div {...fade(0.25)}>
          <Card className="bg-card border-border/60 h-full">
            <CardHeader className="px-5 py-4 pb-2">
              <CardTitle className="text-sm font-semibold">Day Quality Split</CardTitle>
              <p className="text-xs text-muted-foreground">Score distribution</p>
            </CardHeader>
            <CardContent className="px-3 pb-4 h-[220px]">
              {distData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distData} cx="50%" cy="46%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                      {distData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${v} days`, name]} />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Category radar + Habit consistency ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Radar — category completion % */}
        <motion.div {...fade(0.3)}>
          <Card className="bg-card border-border/60">
            <CardHeader className="px-5 py-4 pb-2">
              <CardTitle className="text-sm font-semibold">Category Completion</CardTitle>
              <p className="text-xs text-muted-foreground">Average % of each category completed per day</p>
            </CardHeader>
            <CardContent className="px-3 pb-4 h-[260px]">
              {radarData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(220 13% 22%)" />
                    <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Radar name="Completion %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip formatter={(v) => [`${v}%`, "Completion"]} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Habit consistency bars */}
        <motion.div {...fade(0.35)}>
          <Card className="bg-card border-border/60">
            <CardHeader className="px-5 py-4 pb-3">
              <CardTitle className="text-sm font-semibold">Habit Consistency</CardTitle>
              <p className="text-xs text-muted-foreground">How often each habit was completed</p>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {habitData.length === 0 ? (
                <div className="h-[200px]"><EmptyChart /></div>
              ) : (
                <div className="space-y-2.5">
                  {habitData.map((h) => (
                    <div key={h.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-foreground/80 truncate max-w-[60%]">{h.label}</span>
                        <span className="text-xs font-bold text-muted-foreground">{h.done}/{h.total} · {h.pct}%</span>
                      </div>
                      <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${h.pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          style={{ backgroundColor: h.pct >= 80 ? "#10b981" : h.pct >= 50 ? "#3b82f6" : h.pct >= 25 ? "#f59e0b" : "#ef4444" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Revenue & Leads charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <motion.div {...fade(0.4)}>
          <Card className="bg-card border-border/60">
            <CardHeader className="px-5 py-4 pb-2">
              <CardTitle className="text-sm font-semibold">Revenue Generated (₹)</CardTitle>
              <p className="text-xs text-muted-foreground">Daily revenue logged</p>
            </CardHeader>
            <CardContent className="px-3 pb-4 h-[200px]">
              {revenueData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" vertical={false} />
                    <XAxis dataKey="date" {...axis} />
                    <YAxis {...axis} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 13% 20%)" }} />
                    <Bar dataKey="revenue" name="Revenue ₹" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fade(0.45)}>
          <Card className="bg-card border-border/60">
            <CardHeader className="px-5 py-4 pb-2">
              <CardTitle className="text-sm font-semibold">Leads Contacted</CardTitle>
              <p className="text-xs text-muted-foreground">Daily outreach volume</p>
            </CardHeader>
            <CardContent className="px-3 pb-4 h-[200px]">
              {revenueData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" vertical={false} />
                    <XAxis dataKey="date" {...axis} />
                    <YAxis {...axis} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 13% 20%)" }} />
                    <Bar dataKey="leads" name="Leads" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Category day-by-day bar ── */}
      <motion.div {...fade(0.5)}>
        <Card className="bg-card border-border/60">
          <CardHeader className="px-5 py-4 pb-2">
            <CardTitle className="text-sm font-semibold">Category Scores Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">How many pts earned per category each day</p>
          </CardHeader>
          <CardContent className="px-3 pb-4 h-[220px]">
            {trendData.length === 0 ? <EmptyChart /> : (() => {
              const catTrendData = dayEntries.slice(-20).map((d) => {
                const row: any = { date: d.substring(5) };
                CATEGORIES.forEach((cat) => {
                  let pts = 0;
                  cat.keys.forEach((k) => { if ((days[d] as any)[k]) pts++; });
                  row[cat.label] = pts;
                });
                return row;
              });
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catTrendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 20%)" vertical={false} />
                    <XAxis dataKey="date" {...axis} />
                    <YAxis {...axis} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 13% 20%)" }} />
                    {CATEGORIES.map((cat) => (
                      <Bar key={cat.label} dataKey={cat.label} stackId="a" fill={cat.color} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
