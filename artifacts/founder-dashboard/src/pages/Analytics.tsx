import React, { useMemo } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore } from "../lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

const CHART_COLORS = {
  score: "#3b82f6",
  revenue: "#22c55e",
  leads: "#8b5cf6",
  completion: "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-xl shadow-xl text-sm">
        <p className="font-semibold mb-1.5 text-foreground">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="flex justify-between gap-4" style={{ color: entry.color }}>
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { days } = useChallenge();

  const chartData = useMemo(() => {
    const dates = Object.keys(days).sort().slice(-30);
    return dates.map((date) => {
      const d = days[date];
      const score = calculateScore(d);
      return {
        date: date.substring(5),
        score,
        revenue: d.revenueGenerated || 0,
        leads: (d.leadsContacted || 0) + (d.newLeadsContacted || 0),
        completion: Math.round((score / 22) * 100),
      };
    });
  }, [days]);

  const last7 = useMemo(() => {
    const dates = Object.keys(days).sort().slice(-7);
    if (!dates.length) return { avgScore: 0, totalRev: 0, totalLeads: 0 };
    let scoreSum = 0, revSum = 0, leadSum = 0;
    dates.forEach((d) => {
      scoreSum += calculateScore(days[d]);
      revSum += days[d].revenueGenerated || 0;
      leadSum += (days[d].leadsContacted || 0) + (days[d].newLeadsContacted || 0);
    });
    return {
      avgScore: Math.round((scoreSum / dates.length) * 10) / 10,
      totalRev: revSum,
      totalLeads: leadSum,
    };
  }, [days]);

  const summaryCards = [
    { label: "7-Day Avg Score", value: `${last7.avgScore} / 22`, color: "text-blue-500" },
    { label: "7-Day Revenue", value: `₹${last7.totalRev.toLocaleString()}`, color: "text-emerald-500" },
    { label: "7-Day Leads", value: String(last7.totalLeads), color: "text-violet-500" },
  ];

  const charts = [
    {
      title: "Daily Scores",
      type: "line" as const,
      dataKey: "score",
      name: "Score",
      color: CHART_COLORS.score,
      domain: [0, 22] as [number, number],
    },
    {
      title: "Revenue Generated (₹)",
      type: "bar" as const,
      dataKey: "revenue",
      name: "Revenue",
      color: CHART_COLORS.revenue,
    },
    {
      title: "Leads Contacted",
      type: "bar" as const,
      dataKey: "leads",
      name: "Leads",
      color: CHART_COLORS.leads,
    },
    {
      title: "Completion %",
      type: "line" as const,
      dataKey: "completion",
      name: "Completion %",
      color: CHART_COLORS.completion,
      domain: [0, 100] as [number, number],
    },
  ];

  const axisStyle = {
    stroke: "hsl(215 16% 65%)",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {summaryCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-snug mb-1">{s.label}</p>
                <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {charts.map((chart, i) => (
          <motion.div
            key={chart.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">{chart.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4 h-[200px]">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No data yet. Complete a checklist to see charts.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === "line" ? (
                      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" vertical={false} />
                        <XAxis dataKey="date" {...axisStyle} />
                        <YAxis {...axisStyle} domain={chart.domain} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey={chart.dataKey}
                          name={chart.name}
                          stroke={chart.color}
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: chart.color }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" vertical={false} />
                        <XAxis dataKey="date" {...axisStyle} />
                        <YAxis {...axisStyle} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 13% 18%)", opacity: 0.6 }} />
                        <Bar dataKey={chart.dataKey} name={chart.name} fill={chart.color} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
