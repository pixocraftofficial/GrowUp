import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus, calculateStreak, getCurrentDay } from "../lib/scoring";
import { StatCard } from "../components/StatCard";
import { 
  Flame, CheckCircle2, Target, CalendarDays, TrendingUp, DollarSign
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const QUOTES = [
  "You cannot outwork a bad strategy, but a good strategy without execution is nothing.",
  "Discipline equals freedom.",
  "The only difference between a good day and a bad day is your attitude.",
  "Do the boring work.",
  "Focus on the inputs, the outputs will take care of themselves.",
  "Consistency is the ultimate growth hack.",
  "Nobody cares. Work harder.",
  "Action cures fear.",
  "If you want to be in the top 1%, you have to do what the 99% won't.",
  "Small daily improvements over time lead to stunning results."
];

export default function Dashboard() {
  const { days, challengeStart } = useChallenge();
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = days[todayStr];
  const todayScore = todayData ? calculateScore(todayData) : 0;
  const todayStatus = getStatus(todayScore);
  const currentDayNum = getCurrentDay(challengeStart);
  
  const { current: currentStreak, longest: longestStreak } = useMemo(() => calculateStreak(days, todayStr), [days, todayStr]);
  
  const totalTasksCompleted = useMemo(() => {
    let total = 0;
    Object.values(days).forEach(day => {
      // Sum boolean values that are true
      Object.values(day).forEach(val => {
        if (val === true) total++;
      });
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
        hasData: !!data
      });
      date.setDate(date.getDate() - 1);
    }
    return arr;
  }, [days, todayStr]);

  const quoteOfTheDay = QUOTES[currentDayNum % QUOTES.length];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. It's Day {currentDayNum} of your growth sprint.</p>
        </div>
        <Link href="/checklist">
          <Button size="lg" className="shadow-lg shadow-primary/20 w-full md:w-auto">
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Today's Checklist
          </Button>
        </Link>
      </div>

      {/* Progress */}
      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sprint Progress</p>
              <h3 className="text-2xl font-bold">{Math.round((currentDayNum / 60) * 100)}%</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Day</p>
              <h3 className="text-2xl font-bold">{currentDayNum} / 60</h3>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden mt-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentDayNum / 60) * 100}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Score" 
          value={`${todayScore}/22`} 
          subtitle={todayData ? todayStatus.label : "Not started"}
          icon={<Target className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard 
          title="Current Streak" 
          value={`${currentStreak} days`} 
          icon={<Flame className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard 
          title="Longest Streak" 
          value={`${longestStreak} days`} 
          icon={<CalendarDays className="w-5 h-5" />}
          delay={0.3}
        />
        <StatCard 
          title="Tasks Completed" 
          value={totalTasksCompleted} 
          icon={<CheckCircle2 className="w-5 h-5" />}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Days */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Recent Days</h2>
          <div className="flex gap-2 h-32">
            {recentDays.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col justify-end gap-2 group">
                <div className="flex-1 bg-muted/50 rounded-md relative overflow-hidden flex items-end">
                  {day.hasData && day.status && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.score / 22) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full absolute bottom-0 left-0"
                      style={{ backgroundColor: day.status.hex, opacity: 0.8 }}
                    />
                  )}
                  {day.hasData && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm z-10 text-sm font-bold">
                      {day.score}
                    </div>
                  )}
                </div>
                <div className="text-center text-xs font-medium text-muted-foreground uppercase">
                  {day.dayName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Daily Fuel</h2>
          <Card className="h-32 bg-card/40 backdrop-blur-md border-border/50 flex flex-col justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            </div>
            <p className="text-lg italic font-serif text-foreground/90 leading-snug">"{quoteOfTheDay}"</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
