import React, { useState } from "react";
import { useChallenge, getLocalDateStr } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "../components/ui/drawer";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_COLOR: Record<string, string> = {
  excellent: "#22c55e",
  good: "#3b82f6",
  average: "#f59e0b",
  poor: "#ef4444",
};

const COMPLETED_ITEMS = [
  { key: "hormoziWatched", label: "Hormozi video" },
  { key: "marketingVideoWatched", label: "Marketing video" },
  { key: "threelearningsWritten", label: "3 learnings" },
  { key: "oneImplementationWritten", label: "Implementation" },
  { key: "listeningDone", label: "20m listening" },
  { key: "speakingDone", label: "20m speaking" },
  { key: "readingPagesDone", label: "10 pages" },
  { key: "fiveWordsLearned", label: "5 words" },
  { key: "contacted20Owners", label: "20 contacts" },
  { key: "followedUpLeads", label: "Follow-ups" },
  { key: "salesCallBooked", label: "Sales call" },
  { key: "postedContent", label: "Content posted" },
  { key: "wroteImprovementIdea", label: "Improvement idea" },
  { key: "clientTasksCompleted", label: "Client tasks" },
  { key: "processImproved", label: "Process improved" },
  { key: "read20Pages", label: "Read 20 pages" },
  { key: "workoutCompleted", label: "Workout" },
  { key: "threeLifresWater", label: "3L water" },
  { key: "sevenHoursSleep", label: "7h sleep" },
  { key: "revenueActivity", label: "Revenue act." },
  { key: "brandActivity", label: "Brand act." },
  { key: "skillBuilding", label: "Skill building" },
  { key: "avoidedTimeWaste", label: "No time waste" },
];

export default function Calendar() {
  const { days } = useChallenge();
  const todayStr = getLocalDateStr(); // local date — not UTC

  const [currentDate, setCurrentDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const selectedDay = selectedDate ? days[selectedDate] : null;
  const selectedScore = selectedDay ? calculateScore(selectedDay) : 0;
  const selectedStatus = selectedDay ? getStatus(selectedScore) : null;

  const legend = [
    { key: "excellent", label: "Excellent" },
    { key: "good", label: "Good" },
    { key: "average", label: "Average" },
    { key: "poor", label: "Poor" },
  ];

  return (
    <div className="space-y-5">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9 hover:bg-muted">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-bold">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9 hover:bg-muted">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-card border-border/60">
          <CardContent className="p-4 md:p-6">
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-3">
              {DAY_NAMES_SHORT.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-muted-foreground py-1.5 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`b-${i}`} />)}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayData = days[dStr];
                const score = dayData ? calculateScore(dayData) : 0;
                const status = dayData ? getStatus(score) : null;
                const isToday = dStr === todayStr;
                const isFuture = dStr > todayStr;

                return (
                  <button
                    key={day}
                    onClick={() => dayData && setSelectedDate(dStr)}
                    disabled={!dayData}
                    title={dayData ? `${status?.label} — ${score}/22` : undefined}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                      transition-all duration-150 relative
                      ${dayData ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95" : ""}
                      ${isFuture && !isToday ? "opacity-30" : ""}
                      ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                    `}
                    style={
                      status
                        ? { backgroundColor: `${status.hex}22`, border: `1px solid ${status.hex}55` }
                        : undefined
                    }
                  >
                    <span className={`text-sm font-bold leading-none ${isToday ? "text-primary" : status ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {day}
                    </span>
                    {dayData && status && (
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: status.hex }} />
                    )}
                    {isToday && !dayData && (
                      <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-primary/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5">
        {legend.map((l) => (
          <div key={l.key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[l.key] }} />
            <span className="text-xs text-muted-foreground font-medium">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day detail drawer */}
      <Drawer open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DrawerContent className="max-h-[88vh]">
          <div className="mx-auto w-full max-w-xl">
            <DrawerHeader className="px-5 pt-5 pb-4 border-b border-border">
              <div className="flex justify-between items-start">
                <div>
                  <DrawerTitle className="text-lg font-bold">
                    {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric"
                    })}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs mt-0.5">Daily summary</DrawerDescription>
                </div>
                {selectedStatus && (
                  <div
                    className="text-sm font-bold px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: `${selectedStatus.hex}20`, color: selectedStatus.hex }}
                  >
                    {selectedScore}/22 · {selectedStatus.label}
                  </div>
                )}
              </div>
            </DrawerHeader>

            <div className="px-5 py-5 space-y-4 overflow-y-auto max-h-[60vh]">
              {selectedDay && (
                <>
                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 border border-border/40 p-3.5 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                      <p className="text-xl font-bold">₹{(selectedDay.revenueGenerated || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/40 p-3.5 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Leads</p>
                      <p className="text-xl font-bold">
                        {(selectedDay.leadsContacted || 0) + (selectedDay.newLeadsContacted || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Completed checklist items */}
                  {(() => {
                    const done = COMPLETED_ITEMS.filter(item => (selectedDay as any)[item.key] === true);
                    return done.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {done.map(item => (
                            <Badge
                              key={item.key}
                              variant="secondary"
                              className="text-[11px] bg-primary/10 text-primary border-0 px-2.5 py-0.5 font-medium"
                            >
                              {item.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {selectedDay.bookName && (
                    <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40">
                      <p className="text-xs text-muted-foreground mb-1">Reading</p>
                      <p className="text-sm font-medium">{selectedDay.bookName}</p>
                    </div>
                  )}

                  {selectedDay.improvementIdea && (
                    <div className="bg-primary/5 p-3.5 rounded-xl border border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-1.5">Improvement Idea</p>
                      <p className="text-sm text-foreground/85 leading-relaxed">{selectedDay.improvementIdea}</p>
                    </div>
                  )}

                  {selectedDay.notes && (
                    <div className="bg-muted/20 p-3.5 rounded-xl border border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Notes</p>
                      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{selectedDay.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-5 pb-6 pt-3 border-t border-border">
              <DrawerClose asChild>
                <Button className="w-full" variant="outline">Close</Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
