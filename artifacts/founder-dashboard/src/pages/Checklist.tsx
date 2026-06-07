import React, { useState, useEffect, useRef } from "react";
import { useChallenge } from "../hooks/useChallenge";
import { calculateScore, getStatus } from "../lib/scoring";
import { CategorySection } from "../components/CategorySection";
import { 
  BookOpen, Mic, Briefcase, Zap, Settings, Dumbbell, Brain, Activity 
} from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Checklist() {
  const { getDay, updateDay } = useChallenge();
  const dateStr = new Date().toISOString().split("T")[0];
  
  const [data, setData] = useState(() => getDay(dateStr));
  
  // Local state for debounced inputs
  const [improvementIdea, setImprovementIdea] = useState(data.improvementIdea);
  const [bookName, setBookName] = useState(data.bookName);
  const [notes, setNotes] = useState(data.notes);

  // Load latest data on mount
  useEffect(() => {
    const todayData = getDay(dateStr);
    setData(todayData);
    setImprovementIdea(todayData.improvementIdea);
    setBookName(todayData.bookName);
    setNotes(todayData.notes);
  }, [dateStr, getDay]);

  // Handle immediate boolean/number updates
  const updateField = (field: keyof typeof data, value: any) => {
    setData(prev => {
      const next = { ...prev, [field]: value };
      updateDay(dateStr, next);
      return next;
    });
  };

  // Debounced text inputs
  const ideaTimeout = useRef<NodeJS.Timeout>();
  const handleIdeaChange = (val: string) => {
    setImprovementIdea(val);
    clearTimeout(ideaTimeout.current);
    ideaTimeout.current = setTimeout(() => updateField("improvementIdea", val), 500);
  };

  const bookTimeout = useRef<NodeJS.Timeout>();
  const handleBookChange = (val: string) => {
    setBookName(val);
    clearTimeout(bookTimeout.current);
    bookTimeout.current = setTimeout(() => updateField("bookName", val), 500);
  };

  const notesTimeout = useRef<NodeJS.Timeout>();
  const handleNotesChange = (val: string) => {
    setNotes(val);
    clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(() => updateField("notes", val), 500);
  };

  const score = calculateScore(data);
  const status = getStatus(score);
  const percentage = Math.round((score / 22) * 100);

  const CheckboxItem = ({ field, label }: { field: keyof typeof data, label: string }) => (
    <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-lg hover:bg-muted/40 transition-colors">
      <Checkbox 
        id={field} 
        checked={!!data[field]} 
        onCheckedChange={(c) => updateField(field, !!c)} 
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <Label htmlFor={field} className="flex-1 cursor-pointer font-medium leading-none text-foreground/80">{label}</Label>
    </div>
  );

  const NumberItem = ({ field, label }: { field: keyof typeof data, label: string }) => (
    <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg">
      <Label className="flex-1 text-foreground/80 font-medium">{label}</Label>
      <Input 
        type="number" 
        className="w-24 text-right bg-background border-border/50 focus-visible:ring-primary focus-visible:border-primary" 
        value={data[field] as number || ""}
        onChange={(e) => updateField(field, Number(e.target.value) || 0)}
      />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6 sticky top-16 bg-background/95 backdrop-blur z-10 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Checklist</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</p>
            <p className="text-2xl font-bold font-mono text-primary">{score}<span className="text-muted-foreground text-lg">/22</span></p>
          </div>
          <div className="h-10 w-px bg-border mx-1"></div>
          <div>
            <Badge variant="outline" className={`px-3 py-1 text-sm border-0 ${status.colorClass}`}>
              {status.label} ({percentage}%)
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategorySection title="Learning" points={4} icon={<BookOpen className="w-5 h-5" />} delay={0.1}>
          <CheckboxItem field="hormoziWatched" label="Alex Hormozi video watched" />
          <CheckboxItem field="marketingVideoWatched" label="Marketing/Agency video watched" />
          <CheckboxItem field="threelearningsWritten" label="3 learnings written" />
          <CheckboxItem field="oneImplementationWritten" label="1 implementation written" />
        </CategorySection>

        <CategorySection title="English Upgrade" points={4} icon={<Mic className="w-5 h-5" />} delay={0.2}>
          <CheckboxItem field="listeningDone" label="20 min listening" />
          <CheckboxItem field="speakingDone" label="20 min speaking" />
          <CheckboxItem field="readingPagesDone" label="10 pages reading" />
          <CheckboxItem field="fiveWordsLearned" label="5 new words learned" />
        </CategorySection>

        <CategorySection title="Client Acquisition" points={3} icon={<Briefcase className="w-5 h-5" />} delay={0.3}>
          <CheckboxItem field="contacted20Owners" label="Contacted 20 business owners" />
          <CheckboxItem field="followedUpLeads" label="Followed up with leads" />
          <CheckboxItem field="salesCallBooked" label="Sales call booked or attended" />
          <div className="pt-2 space-y-2">
            <NumberItem field="leadsContacted" label="Leads Contacted" />
            <NumberItem field="followUps" label="Follow-ups" />
            <NumberItem field="calls" label="Calls" />
          </div>
        </CategorySection>

        <CategorySection title="Pixocraft Growth" points={2} icon={<Zap className="w-5 h-5" />} delay={0.4}>
          <CheckboxItem field="postedContent" label="Posted 1 reel or carousel" />
          <CheckboxItem field="wroteImprovementIdea" label="Wrote 1 improvement idea" />
          <div className="pt-2">
            <Label className="text-muted-foreground mb-2 block">Improvement Idea</Label>
            <Textarea 
              placeholder="What can we do better?"
              value={improvementIdea}
              onChange={(e) => handleIdeaChange(e.target.value)}
              className="resize-none bg-background focus-visible:ring-primary"
              rows={3}
            />
          </div>
        </CategorySection>

        <CategorySection title="Service & Operations" points={2} icon={<Settings className="w-5 h-5" />} delay={0.5}>
          <CheckboxItem field="clientTasksCompleted" label="Client tasks completed" />
          <CheckboxItem field="processImproved" label="Process improved" />
        </CategorySection>

        <CategorySection title="Knowledge Building" icon={<Brain className="w-5 h-5" />} delay={0.6}>
          <CheckboxItem field="read20Pages" label="Read 20 pages" />
          <div className="pt-2">
            <Label className="text-muted-foreground mb-2 block">Book Name</Label>
            <Input 
              placeholder="What are you reading?"
              value={bookName}
              onChange={(e) => handleBookChange(e.target.value)}
              className="bg-background focus-visible:ring-primary"
            />
          </div>
        </CategorySection>

        <CategorySection title="Fitness" points={3} icon={<Dumbbell className="w-5 h-5" />} delay={0.7}>
          <CheckboxItem field="workoutCompleted" label="Workout completed" />
          <CheckboxItem field="threeLifresWater" label="3 litres water" />
          <CheckboxItem field="sevenHoursSleep" label="7 hours sleep" />
        </CategorySection>

        <CategorySection title="Founder Thinking" points={4} icon={<Activity className="w-5 h-5" />} delay={0.8}>
          <CheckboxItem field="revenueActivity" label="Revenue-growing activity completed" />
          <CheckboxItem field="brandActivity" label="Brand-growing activity completed" />
          <CheckboxItem field="skillBuilding" label="Skill-building activity completed" />
          <CheckboxItem field="avoidedTimeWaste" label="Avoided time-wasting activities" />
        </CategorySection>
      </div>

      <Card className="mt-8 border-primary/20 bg-card/40 backdrop-blur-md shadow-lg shadow-primary/5">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-primary w-5 h-5" /> 
            Daily Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-base">Revenue Generated Today (₹)</Label>
                <Input 
                  type="number" 
                  className="mt-2 text-lg font-mono bg-background focus-visible:ring-primary h-12"
                  value={data.revenueGenerated || ""}
                  onChange={(e) => updateField("revenueGenerated", Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label className="text-base">New Leads Contacted</Label>
                <Input 
                  type="number" 
                  className="mt-2 text-lg font-mono bg-background focus-visible:ring-primary h-12"
                  value={data.newLeadsContacted || ""}
                  onChange={(e) => updateField("newLeadsContacted", Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                <Label className="text-base cursor-pointer" htmlFor="contentPostedToggle">Content Posted Today?</Label>
                <Switch 
                  id="contentPostedToggle" 
                  checked={!!data.contentPosted}
                  onCheckedChange={(c) => updateField("contentPosted", c)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <div className="flex flex-col h-full">
              <Label className="text-base mb-2">Daily Notes / Reflections</Label>
              <Textarea 
                className="flex-1 min-h-[200px] resize-none bg-background focus-visible:ring-primary text-base p-4"
                placeholder="How did today go? Any blockers? Wins?"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
