import React, { useMemo } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { motion } from "framer-motion";

export default function Analytics() {
  const { days } = useChallenge();
  
  const chartData = useMemo(() => {
    const dates = Object.keys(days).sort();
    // get last 30 days
    const recentDates = dates.slice(-30);
    
    return recentDates.map(date => {
      const d = days[date];
      const score = calculateScore(d);
      return {
        date: date.substring(5), // MM-DD
        fullDate: date,
        score,
        revenue: d.revenueGenerated || 0,
        leads: (d.leadsContacted || 0) + (d.newLeadsContacted || 0),
        completion: Math.round((score / 22) * 100),
      };
    });
  }, [days]);

  const last7Days = useMemo(() => {
    const dates = Object.keys(days).sort().slice(-7);
    if (dates.length === 0) return { avgScore: 0, totalRev: 0, totalLeads: 0 };
    let scoreSum = 0, revSum = 0, leadSum = 0;
    dates.forEach(d => {
      scoreSum += calculateScore(days[d]);
      revSum += days[d].revenueGenerated || 0;
      leadSum += (days[d].leadsContacted || 0) + (days[d].newLeadsContacted || 0);
    });
    return {
      avgScore: Math.round((scoreSum / dates.length) * 10) / 10,
      totalRev: revSum,
      totalLeads: leadSum
    };
  }, [days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Metrics and performance trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/40 backdrop-blur border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase">Last 7 Days Avg Score</p>
              <h3 className="text-3xl font-bold text-primary mt-2">{last7Days.avgScore} <span className="text-lg text-muted-foreground">/ 22</span></h3>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card/40 backdrop-blur border-emerald-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase">Last 7 Days Revenue</p>
              <h3 className="text-3xl font-bold text-emerald-500 mt-2">₹{last7Days.totalRev.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/40 backdrop-blur border-violet-500/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase">Last 7 Days Leads</p>
              <h3 className="text-3xl font-bold text-violet-500 mt-2">{last7Days.totalLeads}</h3>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Daily Scores</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 22]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={18} stroke="hsl(var(--emerald-500))" strokeDasharray="3 3" opacity={0.5} />
                <ReferenceLine y={12} stroke="hsl(var(--amber-500))" strokeDasharray="3 3" opacity={0.5} />
                <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Generated (₹)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--emerald-500))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Leads Contacted</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                <Bar dataKey="leads" name="Leads" fill="hsl(var(--violet-500))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Completion %</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="stepAfter" dataKey="completion" name="Completion %" stroke="hsl(var(--amber-500))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
