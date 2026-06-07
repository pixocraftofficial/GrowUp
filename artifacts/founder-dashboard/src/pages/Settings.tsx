import React from "react";
import { useChallenge } from "../hooks/useChallenge";
import { storage } from "../lib/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function Settings() {
  const { resetChallenge, refreshDays } = useChallenge();
  const { toast } = useToast();

  const handleExport = () => {
    const data = storage.exportData();
    const dateStr = new Date().toISOString().split("T")[0];
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixocraft-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your backup file has been downloaded.",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = storage.importData(content);
      if (success) {
        refreshDays();
        toast({
          title: "Data Imported",
          description: "Your progress has been restored successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "The selected file is not a valid backup.",
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleReset = () => {
    resetChallenge();
    toast({
      title: "Challenge Reset",
      description: "All data cleared. Your 60 days start now.",
    });
  };

  return (
    <div className="space-y-8 pb-10 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your data and preferences.</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>All your data is stored locally in your browser. Back it up to keep it safe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div>
              <p className="font-semibold text-foreground">Export Backup</p>
              <p className="text-sm text-muted-foreground mt-1">Download a JSON file of your entire 60-day history.</p>
            </div>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div>
              <p className="font-semibold text-foreground">Import Backup</p>
              <p className="text-sm text-muted-foreground mt-1">Restore your data from a previous JSON backup.</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Input 
                type="file" 
                accept=".json" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
              />
              <Button variant="outline" className="w-full sm:w-auto pointer-events-none">
                <Upload className="w-4 h-4 mr-2" /> Import JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription className="text-destructive/80">Irreversible actions that will delete your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Reset Challenge</p>
              <p className="text-sm text-muted-foreground mt-1">Wipes all history and restarts your 60 days from today.</p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">Reset Everything</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your entire 60-day history, all notes, and metrics from your browser.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick inline Input component to avoid massive imports if shadcn input isn't perfect here
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
