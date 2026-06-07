import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, BarChart3, Calendar, Settings, Moon, Sun, Zap } from "lucide-react";
import { useChallenge, useTheme, getLocalDateStr } from "../hooks/useChallenge";
import { getCurrentDay } from "../lib/scoring";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/checklist", label: "Daily Checklist", shortLabel: "Today", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", shortLabel: "Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", shortLabel: "Settings", icon: Settings },
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

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex">

      {/* ── Desktop Sidebar ─────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-20 border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Pixocraft 60</p>
              <p className="text-[11px] text-muted-foreground">{todayLabel}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Progress footer */}
        <div className="p-4 border-t border-border/50">
          <div className="bg-muted/40 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-xs font-bold text-foreground">Day {currentDay}</p>
                <p className="text-[11px] text-muted-foreground">of 60-day sprint</p>
              </div>
              <span className="text-lg font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full mt-3 text-muted-foreground hover:text-foreground justify-start gap-2 h-8 text-xs"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-[100dvh]">

        {/* Top header */}
        <header className="sticky top-0 z-10 h-14 flex items-center px-4 md:px-8 justify-between bg-background/80 backdrop-blur-md border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <h1 className="font-semibold text-[15px] tracking-tight">{pageTitle}</h1>
          </div>
          {/* Mobile theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="md:hidden rounded-xl text-muted-foreground hover:text-foreground w-9 h-9"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-28 md:pb-10 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Nav ────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute top-0 inset-x-2 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 42 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
