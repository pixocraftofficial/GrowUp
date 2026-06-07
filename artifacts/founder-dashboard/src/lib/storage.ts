export interface DayData {
  date: string;
  // Learning (4 pts)
  hormoziWatched: boolean;
  marketingVideoWatched: boolean;
  threelearningsWritten: boolean;
  oneImplementationWritten: boolean;
  // English (4 pts)
  listeningDone: boolean;
  speakingDone: boolean;
  readingPagesDone: boolean;
  fiveWordsLearned: boolean;
  // Sales (3 pts)
  contacted20Owners: boolean;
  followedUpLeads: boolean;
  salesCallBooked: boolean;
  leadsContacted: number;
  followUps: number;
  calls: number;
  // Growth (2 pts)
  postedContent: boolean;
  wroteImprovementIdea: boolean;
  improvementIdea: string;
  // Operations (2 pts)
  clientTasksCompleted: boolean;
  processImproved: boolean;
  // Knowledge Building (0 pts)
  read20Pages: boolean;
  bookName: string;
  // Fitness (3 pts)
  workoutCompleted: boolean;
  threeLifresWater: boolean;
  sevenHoursSleep: boolean;
  // Founder Thinking (4 pts)
  revenueActivity: boolean;
  brandActivity: boolean;
  skillBuilding: boolean;
  avoidedTimeWaste: boolean;
  // Daily Metrics
  revenueGenerated: number;
  newLeadsContacted: number;
  contentPosted: boolean;
  notes: string;
}

export const getEmptyDayData = (date: string): DayData => ({
  date,
  hormoziWatched: false,
  marketingVideoWatched: false,
  threelearningsWritten: false,
  oneImplementationWritten: false,
  listeningDone: false,
  speakingDone: false,
  readingPagesDone: false,
  fiveWordsLearned: false,
  contacted20Owners: false,
  followedUpLeads: false,
  salesCallBooked: false,
  leadsContacted: 0,
  followUps: 0,
  calls: 0,
  postedContent: false,
  wroteImprovementIdea: false,
  improvementIdea: "",
  clientTasksCompleted: false,
  processImproved: false,
  read20Pages: false,
  bookName: "",
  workoutCompleted: false,
  threeLifresWater: false,
  sevenHoursSleep: false,
  revenueActivity: false,
  brandActivity: false,
  skillBuilding: false,
  avoidedTimeWaste: false,
  revenueGenerated: 0,
  newLeadsContacted: 0,
  contentPosted: false,
  notes: "",
});

export const storage = {
  getDays: (): Record<string, DayData> => {
    const data = localStorage.getItem("pixocraft_days");
    return data ? JSON.parse(data) : {};
  },
  saveDay: (day: DayData) => {
    const days = storage.getDays();
    days[day.date] = day;
    localStorage.setItem("pixocraft_days", JSON.stringify(days));
  },
  getDay: (date: string): DayData => {
    const days = storage.getDays();
    return days[date] || getEmptyDayData(date);
  },
  getChallengeStart: (): string | null => {
    return localStorage.getItem("pixocraft_challenge_start");
  },
  setChallengeStart: (date: string) => {
    localStorage.setItem("pixocraft_challenge_start", date);
  },
  resetChallenge: () => {
    localStorage.removeItem("pixocraft_days");
    localStorage.removeItem("pixocraft_challenge_start");
  },
  exportData: () => {
    const data = {
      days: storage.getDays(),
      start: storage.getChallengeStart(),
    };
    return JSON.stringify(data, null, 2);
  },
  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.days) {
        localStorage.setItem("pixocraft_days", JSON.stringify(data.days));
      }
      if (data.start) {
        localStorage.setItem("pixocraft_challenge_start", data.start);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};
