import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, BarChart3, Calendar, Settings, Moon, Sun } from "lucide-react";
import { useChallenge, useTheme } from "../hooks/useChallenge";
import { getCurrentDay } from "../lib/scoring";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/checklist", label: "Today", icon: CheckSquare },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/checklist": "Daily Checklist",
  "/analytics": "Analytics",
  "/calendar": "Calendar",
  "/settings": "Settings",
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { challengeStart } = useChallenge();
  const { isDark, toggleTheme } = useTheme();
  const currentDay = getCurrentDay(challengeStart);
  const progress = Math.min(100, Math.round((currentDay / 60) * 100));
  const pageTitle = PAGE_TITLES[location] ?? "Pixocraft 60";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-10 bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-mono font-bold text-lg shadow-md shadow-primary/30">
              P
            </div>
            <h1 className="text-lg font-bold tracking-tight">Pixocraft 60</h1>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.label === "Home" ? "Dashboard" : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 mb-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day {currentDay} of 60</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-[100dvh]">

        {/* Top header */}
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="md:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm shadow-primary/30">
              P
            </div>
            <h2 className="font-semibold text-base tracking-tight">{pageTitle}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl text-muted-foreground hover:text-foreground -mr-1">
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </Button>
        </header>

        {/* Page content — bottom padding for mobile nav bar */}
        <div className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
