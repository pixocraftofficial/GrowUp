import React, { useState, useEffect, useRef } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { CategorySection } from "../components/CategorySection";
import { BookOpen, Mic, Briefcase, Zap, Settings, Dumbbell, Brain, Activity } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";

export default function Checklist() {
  const { getDay, updateDay } = useChallenge();
  const dateStr = new Date().toISOString().split("T")[0];

  const [data, setData] = useState(() => getDay(dateStr));
  const [improvementIdea, setImprovementIdea] = useState(data.improvementIdea);
  const [bookName, setBookName] = useState(data.bookName);
  const [notes, setNotes] = useState(data.notes);

  useEffect(() => {
    const todayData = getDay(dateStr);
    setData(todayData);
    setImprovementIdea(todayData.improvementIdea);
    setBookName(todayData.bookName);
    setNotes(todayData.notes);
  }, [dateStr, getDay]);

  const updateField = (field: keyof typeof data, value: any) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      updateDay(dateStr, next);
      return next;
    });
  };

  const ideaTimer = useRef<NodeJS.Timeout>();
  const bookTimer = useRef<NodeJS.Timeout>();
  const notesTimer = useRef<NodeJS.Timeout>();

  const debounce = (timer: React.MutableRefObject<NodeJS.Timeout | undefined>, fn: () => void, ms = 400) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const score = calculateScore(data);
  const status = getStatus(score);
  const pct = Math.round((score / 22) * 100);

  const CheckboxItem = ({ field, label }: { field: keyof typeof data; label: string }) => (
    <div className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-muted/30 transition-colors">
      <Checkbox
        id={String(field)}
        checked={!!data[field]}
        onCheckedChange={(c) => updateField(field, !!c)}
        className="shrink-0 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <Label htmlFor={String(field)} className="flex-1 cursor-pointer text-sm font-medium text-foreground/85 leading-snug">
        {label}
      </Label>
    </div>
  );

  const NumberItem = ({ field, label }: { field: keyof typeof data; label: string }) => (
    <div className="flex items-center gap-3 py-1 px-1">
      <Label className="flex-1 text-sm text-muted-foreground">{label}</Label>
      <Input
        type="number"
        className="w-20 h-9 text-right bg-background/60 border-border/50 focus-visible:ring-primary text-sm"
        value={(data[field] as number) || ""}
        onChange={(e) => updateField(field, Number(e.target.value) || 0)}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Sticky score bar */}
      <div className="sticky top-14 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-primary">{score}<span className="text-muted-foreground text-base font-normal">/22</span></span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.colorClass}`}>
              {pct}%
            </span>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: status.hex }}
          />
        </div>
      </div>

      {/* Category sections - single column on mobile, 2-col on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategorySection title="Learning" points={4} icon={<BookOpen className="w-4 h-4" />} delay={0.05}>
          <CheckboxItem field="hormoziWatched" label="Alex Hormozi video watched" />
          <CheckboxItem field="marketingVideoWatched" label="Marketing/Agency video watched" />
          <CheckboxItem field="threelearningsWritten" label="3 learnings written" />
          <CheckboxItem field="oneImplementationWritten" label="1 implementation written" />
        </CategorySection>

        <CategorySection title="English Upgrade" points={4} icon={<Mic className="w-4 h-4" />} delay={0.1}>
          <CheckboxItem field="listeningDone" label="20 min listening" />
          <CheckboxItem field="speakingDone" label="20 min speaking" />
          <CheckboxItem field="readingPagesDone" label="10 pages reading" />
          <CheckboxItem field="fiveWordsLearned" label="5 new words learned" />
        </CategorySection>

        <CategorySection title="Client Acquisition" points={3} icon={<Briefcase className="w-4 h-4" />} delay={0.15}>
          <CheckboxItem field="contacted20Owners" label="Contacted 20 business owners" />
          <CheckboxItem field="followedUpLeads" label="Followed up with leads" />
          <CheckboxItem field="salesCallBooked" label="Sales call booked or attended" />
          <div className="pt-1 space-y-1 border-t border-border/30 mt-1">
            <NumberItem field="leadsContacted" label="Leads contacted" />
            <NumberItem field="followUps" label="Follow-ups sent" />
            <NumberItem field="calls" label="Calls held" />
          </div>
        </CategorySection>

        <CategorySection title="Pixocraft Growth" points={2} icon={<Zap className="w-4 h-4" />} delay={0.2}>
          <CheckboxItem field="postedContent" label="Posted 1 reel or carousel" />
          <CheckboxItem field="wroteImprovementIdea" label="Wrote 1 improvement idea" />
          <div className="pt-1">
            <Textarea
              placeholder="What can we improve?"
              value={improvementIdea}
              onChange={(e) => {
                setImprovementIdea(e.target.value);
                debounce(ideaTimer, () => updateField("improvementIdea", e.target.value));
              }}
              className="resize-none bg-background/60 focus-visible:ring-primary text-sm mt-1"
              rows={2}
            />
          </div>
        </CategorySection>

        <CategorySection title="Service & Operations" points={2} icon={<Settings className="w-4 h-4" />} delay={0.25}>
          <CheckboxItem field="clientTasksCompleted" label="Client tasks completed" />
          <CheckboxItem field="processImproved" label="Process improved" />
        </CategorySection>

        <CategorySection title="Knowledge Building" icon={<Brain className="w-4 h-4" />} delay={0.3}>
          <CheckboxItem field="read20Pages" label="Read 20 pages" />
          <Input
            placeholder="Book name"
            value={bookName}
            onChange={(e) => {
              setBookName(e.target.value);
              debounce(bookTimer, () => updateField("bookName", e.target.value));
            }}
            className="bg-background/60 focus-visible:ring-primary text-sm mt-2 h-9"
          />
        </CategorySection>

        <CategorySection title="Fitness" points={3} icon={<Dumbbell className="w-4 h-4" />} delay={0.35}>
          <CheckboxItem field="workoutCompleted" label="Workout completed" />
          <CheckboxItem field="threeLifresWater" label="3 litres water" />
          <CheckboxItem field="sevenHoursSleep" label="7 hours sleep" />
        </CategorySection>

        <CategorySection title="Founder Thinking" points={4} icon={<Activity className="w-4 h-4" />} delay={0.4}>
          <CheckboxItem field="revenueActivity" label="Revenue-growing activity done" />
          <CheckboxItem field="brandActivity" label="Brand-growing activity done" />
          <CheckboxItem field="skillBuilding" label="Skill-building activity done" />
          <CheckboxItem field="avoidedTimeWaste" label="Avoided time-wasting activities" />
        </CategorySection>
      </div>

      {/* Daily Metrics */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Daily Metrics</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Revenue Today (₹)</Label>
              <Input
                type="number"
                className="bg-background/60 border-border/50 focus-visible:ring-primary font-mono"
                value={data.revenueGenerated || ""}
                onChange={(e) => updateField("revenueGenerated", Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">New Leads</Label>
              <Input
                type="number"
                className="bg-background/60 border-border/50 focus-visible:ring-primary font-mono"
                value={data.newLeadsContacted || ""}
                onChange={(e) => updateField("newLeadsContacted", Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl">
            <Label className="text-sm font-medium cursor-pointer" htmlFor="contentPostedToggle">Content posted today?</Label>
            <Switch
              id="contentPostedToggle"
              checked={!!data.contentPosted}
              onCheckedChange={(c) => updateField("contentPosted", c)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Notes / Reflections</Label>
            <Textarea
              className="resize-none bg-background/60 focus-visible:ring-primary text-sm"
              placeholder="How did today go? Wins? Blockers?"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                debounce(notesTimer, () => updateField("notes", e.target.value));
              }}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
