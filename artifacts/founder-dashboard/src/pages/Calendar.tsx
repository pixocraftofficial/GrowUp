import React, { useState } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "../components/ui/drawer";
import { Badge } from "../components/ui/badge";
import { motion } from "framer-motion";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["S","M","T","W","T","F","S"];

export default function Calendar() {
  const { days } = useChallenge();
  const [currentDate, setCurrentDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const blanks = Array.from({ length: firstDayOfWeek });
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const legend = [
    { label: "Excellent", color: "#22c55e" },
    { label: "Good", color: "#3b82f6" },
    { label: "Average", color: "#f59e0b" },
    { label: "Poor", color: "#ef4444" },
  ];

  const selectedDay = selectedDate ? days[selectedDate] : null;
  const selectedScore = selectedDay ? calculateScore(selectedDay) : 0;
  const selectedStatus = selectedDay ? getStatus(selectedScore) : null;

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-xl h-9 w-9">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-bold">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-xl h-9 w-9">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d, i) => (
                <div key={i} className="text-center text-[11px] font-bold text-muted-foreground py-1.5">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {blanks.map((_, i) => <div key={`b-${i}`} />)}
              {calendarDays.map((day) => {
                const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayData = days[dStr];
                const score = dayData ? calculateScore(dayData) : 0;
                const status = dayData ? getStatus(score) : null;
                const isToday = todayStr === dStr;

                return (
                  <button
                    key={day}
                    onClick={() => dayData && setSelectedDate(dStr)}
                    disabled={!dayData}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150
                      ${dayData ? "cursor-pointer active:scale-95" : "opacity-50"}
                      ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
                    `}
                    style={
                      status
                        ? { backgroundColor: `${status.hex}22`, border: `1px solid ${status.hex}55` }
                        : { backgroundColor: "hsl(220 13% 14%)" }
                    }
                  >
                    <span className={`text-sm font-bold leading-none ${isToday ? "text-primary" : status ? "text-foreground" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    {dayData && status && (
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1"
                        style={{ backgroundColor: status.hex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Day detail drawer */}
      <Drawer open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="px-5 pt-5 pb-4 border-b border-border">
              <div className="flex justify-between items-start">
                <div>
                  <DrawerTitle className="text-lg font-bold">
                    {selectedDate &&
                      new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric",
                      })}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs mt-0.5">Daily summary</DrawerDescription>
                </div>
                {selectedStatus && (
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${selectedStatus.hex}22`, color: selectedStatus.hex }}
                  >
                    {selectedScore}/22
                  </span>
                )}
              </div>
            </DrawerHeader>

            <div className="px-5 py-5 space-y-4 overflow-y-auto max-h-[55vh]">
              {selectedDay && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                      <p className="text-lg font-bold">₹{(selectedDay.revenueGenerated || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Leads</p>
                      <p className="text-lg font-bold">
                        {(selectedDay.leadsContacted || 0) + (selectedDay.newLeadsContacted || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Completed tasks summary */}
                  <div className="bg-muted/20 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "hormoziWatched", label: "Hormozi" },
                        { key: "marketingVideoWatched", label: "Marketing video" },
                        { key: "threelearningsWritten", label: "3 Learnings" },
                        { key: "oneImplementationWritten", label: "Implementation" },
                        { key: "listeningDone", label: "Listening" },
                        { key: "speakingDone", label: "Speaking" },
                        { key: "contacted20Owners", label: "20 Contacts" },
                        { key: "salesCallBooked", label: "Sales call" },
                        { key: "postedContent", label: "Content posted" },
                        { key: "workoutCompleted", label: "Workout" },
                        { key: "threeLifresWater", label: "3L water" },
                        { key: "sevenHoursSleep", label: "7h sleep" },
                        { key: "revenueActivity", label: "Revenue act." },
                        { key: "brandActivity", label: "Brand act." },
                        { key: "avoidedTimeWaste", label: "No time waste" },
                      ]
                        .filter((t) => (selectedDay as any)[t.key] === true)
                        .map((t) => (
                          <Badge key={t.key} variant="secondary" className="text-[11px] bg-primary/10 text-primary border-0 px-2 py-0.5">
                            {t.label}
                          </Badge>
                        ))}
                      {Object.values(selectedDay).filter((v) => v === true).length === 0 && (
                        <span className="text-sm text-muted-foreground">None recorded</span>
                      )}
                    </div>
                  </div>

                  {selectedDay.notes && (
                    <div className="bg-muted/20 p-3 rounded-xl border border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Notes</p>
                      <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{selectedDay.notes}</p>
                    </div>
                  )}

                  {selectedDay.improvementIdea && (
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-1.5">Improvement Idea</p>
                      <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{selectedDay.improvementIdea}</p>
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
