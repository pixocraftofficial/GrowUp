import React, { useState, useEffect, useRef } from "react";
import { useChallenge, getLocalDateStr } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { BookOpen, Mic, Briefcase, Zap, Settings, Dumbbell, Brain, Activity, Check } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { motion } from "framer-motion";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  learning: <BookOpen className="w-4 h-4" />,
  english: <Mic className="w-4 h-4" />,
  sales: <Briefcase className="w-4 h-4" />,
  growth: <Zap className="w-4 h-4" />,
  ops: <Settings className="w-4 h-4" />,
  knowledge: <Brain className="w-4 h-4" />,
  fitness: <Dumbbell className="w-4 h-4" />,
  founder: <Activity className="w-4 h-4" />,
};

function CheckRow({
  id, label, checked, onChange
}: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left group
        ${checked
          ? "bg-primary/10 hover:bg-primary/15"
          : "hover:bg-muted/50"
        }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150
        ${checked
          ? "bg-primary border-primary shadow-sm shadow-primary/30"
          : "border-border group-hover:border-primary/50"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className={`text-sm font-medium transition-colors ${checked ? "text-foreground line-through decoration-primary/40" : "text-foreground/80"}`}>
        {label}
      </span>
    </button>
  );
}

function NumberRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Label className="flex-1 text-sm text-muted-foreground font-medium">{label}</Label>
      <Input
        type="number"
        min={0}
        className="w-24 h-8 text-right bg-muted/40 border-border/50 focus-visible:ring-primary focus-visible:border-primary text-sm font-mono"
        value={value || ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  pts?: number;
  iconKey: string;
  delay?: number;
  children: React.ReactNode;
}

function Section({ title, pts, iconKey, delay = 0, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="bg-card border-border/60 hover:border-border transition-colors overflow-hidden">
        <CardHeader className="px-5 py-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                {CATEGORY_ICONS[iconKey]}
              </div>
              <span className="font-semibold text-sm">{title}</span>
            </div>
            {pts !== undefined && (
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {pts} pts
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 py-2 space-y-0.5">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Checklist() {
  const { getDay, updateDay } = useChallenge();
  const dateStr = getLocalDateStr();
  const [data, setData] = useState(() => getDay(dateStr));
  const [improvementIdea, setImprovementIdea] = useState(data.improvementIdea);
  const [bookName, setBookName] = useState(data.bookName);
  const [notes, setNotes] = useState(data.notes);

  useEffect(() => {
    const d = getDay(dateStr);
    setData(d);
    setImprovementIdea(d.improvementIdea);
    setBookName(d.bookName);
    setNotes(d.notes);
  }, [dateStr, getDay]);

  const updateField = (field: keyof typeof data, value: any) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      updateDay(dateStr, next);
      return next;
    });
  };

  const ideaTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bookTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounce = (timer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>, fn: () => void, ms = 400) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const score = calculateScore(data);
  const status = getStatus(score);
  const pct = Math.round((score / 22) * 100);

  const dateLabel = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Score header */}
      <div className="rounded-2xl border border-border/60 bg-card px-4 md:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium hidden sm:block">{dateLabel}</p>
          <p className="text-sm text-muted-foreground font-medium sm:hidden">
            {new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <div className="flex items-center gap-4">
            <div className="h-8 flex items-center gap-2 px-3 bg-card border border-border/60 rounded-xl">
              <span className="text-xl font-bold font-mono text-primary leading-none">{score}</span>
              <span className="text-muted-foreground text-sm">/22</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 md:w-36 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: status.hex }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: status.hex }}>{pct}%</span>
            </div>
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full hidden md:block"
              style={{ backgroundColor: `${status.hex}20`, color: status.hex }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Section title="Learning" pts={4} iconKey="learning" delay={0.05}>
          <CheckRow id="hormozi" label="Alex Hormozi video watched" checked={!!data.hormoziWatched} onChange={v => updateField("hormoziWatched", v)} />
          <CheckRow id="mktg" label="Marketing/Agency video watched" checked={!!data.marketingVideoWatched} onChange={v => updateField("marketingVideoWatched", v)} />
          <CheckRow id="learn3" label="3 learnings written" checked={!!data.threelearningsWritten} onChange={v => updateField("threelearningsWritten", v)} />
          <CheckRow id="impl1" label="1 implementation written" checked={!!data.oneImplementationWritten} onChange={v => updateField("oneImplementationWritten", v)} />
        </Section>

        <Section title="English Upgrade" pts={4} iconKey="english" delay={0.1}>
          <CheckRow id="listen" label="20 min listening" checked={!!data.listeningDone} onChange={v => updateField("listeningDone", v)} />
          <CheckRow id="speak" label="20 min speaking" checked={!!data.speakingDone} onChange={v => updateField("speakingDone", v)} />
          <CheckRow id="read10" label="10 pages reading" checked={!!data.readingPagesDone} onChange={v => updateField("readingPagesDone", v)} />
          <CheckRow id="words5" label="5 new words learned" checked={!!data.fiveWordsLearned} onChange={v => updateField("fiveWordsLearned", v)} />
        </Section>

        <Section title="Client Acquisition" pts={3} iconKey="sales" delay={0.15}>
          <CheckRow id="owners20" label="Contacted 20 business owners" checked={!!data.contacted20Owners} onChange={v => updateField("contacted20Owners", v)} />
          <CheckRow id="followup" label="Followed up with leads" checked={!!data.followedUpLeads} onChange={v => updateField("followedUpLeads", v)} />
          <CheckRow id="salescall" label="Sales call booked or attended" checked={!!data.salesCallBooked} onChange={v => updateField("salesCallBooked", v)} />
          <div className="pt-1 mt-1 border-t border-border/40 space-y-0.5">
            <NumberRow label="Leads contacted" value={data.leadsContacted} onChange={v => updateField("leadsContacted", v)} />
            <NumberRow label="Follow-ups sent" value={data.followUps} onChange={v => updateField("followUps", v)} />
            <NumberRow label="Calls held" value={data.calls} onChange={v => updateField("calls", v)} />
          </div>
        </Section>

        <Section title="Pixocraft Growth" pts={2} iconKey="growth" delay={0.2}>
          <CheckRow id="reel" label="Posted 1 reel or carousel" checked={!!data.postedContent} onChange={v => updateField("postedContent", v)} />
          <CheckRow id="idea" label="Wrote 1 improvement idea" checked={!!data.wroteImprovementIdea} onChange={v => updateField("wroteImprovementIdea", v)} />
          <div className="px-3 pt-2 pb-1">
            <Textarea
              placeholder="What can we improve?"
              value={improvementIdea}
              onChange={(e) => {
                setImprovementIdea(e.target.value);
                debounce(ideaTimer, () => updateField("improvementIdea", e.target.value));
              }}
              className="resize-none bg-muted/30 border-border/50 focus-visible:ring-primary text-sm min-h-[72px]"
              rows={2}
            />
          </div>
        </Section>

        <Section title="Service & Operations" pts={2} iconKey="ops" delay={0.25}>
          <CheckRow id="clienttasks" label="Client tasks completed" checked={!!data.clientTasksCompleted} onChange={v => updateField("clientTasksCompleted", v)} />
          <CheckRow id="process" label="Process improved" checked={!!data.processImproved} onChange={v => updateField("processImproved", v)} />
        </Section>

        <Section title="Knowledge Building" iconKey="knowledge" delay={0.3}>
          <CheckRow id="read20" label="Read 20 pages" checked={!!data.read20Pages} onChange={v => updateField("read20Pages", v)} />
          <div className="px-3 pt-1 pb-2">
            <Input
              placeholder="Book name"
              value={bookName}
              onChange={(e) => {
                setBookName(e.target.value);
                debounce(bookTimer, () => updateField("bookName", e.target.value));
              }}
              className="h-9 bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
            />
          </div>
        </Section>

        <Section title="Fitness" pts={3} iconKey="fitness" delay={0.35}>
          <CheckRow id="workout" label="Workout completed" checked={!!data.workoutCompleted} onChange={v => updateField("workoutCompleted", v)} />
          <CheckRow id="water" label="3 litres water" checked={!!data.threeLifresWater} onChange={v => updateField("threeLifresWater", v)} />
          <CheckRow id="sleep" label="7 hours sleep" checked={!!data.sevenHoursSleep} onChange={v => updateField("sevenHoursSleep", v)} />
        </Section>

        <Section title="Founder Thinking" pts={4} iconKey="founder" delay={0.4}>
          <CheckRow id="revact" label="Revenue-growing activity done" checked={!!data.revenueActivity} onChange={v => updateField("revenueActivity", v)} />
          <CheckRow id="brandact" label="Brand-growing activity done" checked={!!data.brandActivity} onChange={v => updateField("brandActivity", v)} />
          <CheckRow id="skillbuild" label="Skill-building activity done" checked={!!data.skillBuilding} onChange={v => updateField("skillBuilding", v)} />
          <CheckRow id="notimewaste" label="Avoided time-wasting activities" checked={!!data.avoidedTimeWaste} onChange={v => updateField("avoidedTimeWaste", v)} />
        </Section>

      </div>

      {/* Daily Metrics */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card border-border/60">
          <CardHeader className="px-5 py-4 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">Daily Metrics</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Revenue Generated Today (₹)
                  </Label>
                  <Input
                    type="number"
                    className="bg-muted/30 border-border/50 focus-visible:ring-primary font-mono text-base h-11"
                    value={data.revenueGenerated || ""}
                    onChange={(e) => updateField("revenueGenerated", Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    New Leads Contacted
                  </Label>
                  <Input
                    type="number"
                    className="bg-muted/30 border-border/50 focus-visible:ring-primary font-mono text-base h-11"
                    value={data.newLeadsContacted || ""}
                    onChange={(e) => updateField("newLeadsContacted", Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between bg-muted/30 border border-border/50 px-4 py-3 rounded-xl">
                  <Label className="text-sm font-medium cursor-pointer" htmlFor="contentPosted">
                    Content posted today?
                  </Label>
                  <Switch
                    id="contentPosted"
                    checked={!!data.contentPosted}
                    onCheckedChange={(v) => updateField("contentPosted", v)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Notes & Reflections
                </Label>
                <Textarea
                  className="resize-none bg-muted/30 border-border/50 focus-visible:ring-primary text-sm min-h-[160px] h-full"
                  placeholder="How did today go? Wins? Blockers? What to improve?"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    debounce(notesTimer, () => updateField("notes", e.target.value));
                  }}
                  rows={6}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
