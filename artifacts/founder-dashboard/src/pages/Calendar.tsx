import React, { useState } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "../components/ui/drawer";
import { Badge } from "../components/ui/badge";

export default function Calendar() {
  const { days } = useChallenge();
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Your 60-day visual history.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card/40 border border-border/50 rounded-xl p-1 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-36 text-center font-bold text-lg">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {blanks.map(i => (
              <div key={`blank-${i}`} className="aspect-square rounded-xl bg-transparent" />
            ))}
            {calendarDays.map(day => {
              const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = days[dStr];
              const score = dayData ? calculateScore(dayData) : 0;
              const status = dayData ? getStatus(score) : null;
              const isToday = new Date().toISOString().split("T")[0] === dStr;

              return (
                <div 
                  key={day} 
                  onClick={() => dayData && setSelectedDate(dStr)}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
                    ${dayData ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:z-10' : 'bg-muted/10'}
                    ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                  `}
                  style={status ? { backgroundColor: `${status.hex}20`, border: `1px solid ${status.hex}50` } : {}}
                >
                  <span className={`text-lg md:text-xl font-bold ${status ? '' : 'text-muted-foreground'}`}>{day}</span>
                  {dayData && (
                    <div className="mt-1">
                      <Badge variant="secondary" style={{ backgroundColor: status?.hex, color: '#fff', border: 'none' }} className="px-1.5 py-0 md:px-2 md:py-0.5 text-[10px] md:text-xs">
                        {score}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Drawer open={!!selectedDate} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto w-full max-w-lg p-6">
            <DrawerHeader className="px-0 pt-0 pb-6 border-b border-border text-left">
              <div className="flex justify-between items-start">
                <div>
                  <DrawerTitle className="text-2xl font-bold">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </DrawerTitle>
                  <DrawerDescription className="mt-1">
                    Daily summary
                  </DrawerDescription>
                </div>
                {selectedDate && days[selectedDate] && (() => {
                  const s = calculateScore(days[selectedDate]);
                  const st = getStatus(s);
                  return (
                    <Badge style={{ backgroundColor: `${st.hex}20`, color: st.hex }} className="text-lg px-3 py-1 border-0">
                      Score: {s}/22
                    </Badge>
                  );
                })()}
              </div>
            </DrawerHeader>

            <div className="py-6 space-y-6 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              {selectedDate && days[selectedDate] ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                      <p className="text-xl font-bold">₹{days[selectedDate].revenueGenerated || 0}</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Leads</p>
                      <p className="text-xl font-bold">{(days[selectedDate].leadsContacted || 0) + (days[selectedDate].newLeadsContacted || 0)}</p>
                    </div>
                  </div>
                  
                  {days[selectedDate].notes && (
                    <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                      <p className="font-semibold mb-2">Notes</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{days[selectedDate].notes}</p>
                    </div>
                  )}

                  {days[selectedDate].improvementIdea && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                      <p className="font-semibold text-primary mb-2">Improvement Idea</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">{days[selectedDate].improvementIdea}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
            
            <div className="pt-4 mt-auto">
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
