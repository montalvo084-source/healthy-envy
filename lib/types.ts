export interface ProteinSource {
  id: number;
  key: string;
  label: string;
  protein: number;
  unit: string;
  emoji: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Profile {
  id: number;
  name: string;
  age: number;
  proteinGoal: number;
  fiberGoal: number;
  unit: string;
  startWeight: number | null;
  startWaist: number | null;
  startChest: number | null;
  startArms: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseQuestion {
  id: number;
  phaseId: number;
  label: string;
  type: string;
  key: string;
  sortOrder: number;
}

export interface Phase {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
  duration: number;
  active: boolean;
  trackProtein: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  questions?: PhaseQuestion[];
}

export interface ProteinEntry {
  id: number;
  logId: number;
  sourceKey: string;
  quantity: number;
}

export interface QuestionAnswer {
  id: number;
  logId: number;
  questionKey: string;
  value: string;
}

export interface DailyLog {
  id: number;
  date: string;
  phaseId: number | null;
  phase?: Phase | null;
  proteinPriority: boolean | null;
  fiberGrams: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  proteinEntries?: ProteinEntry[];
  questionAnswers?: QuestionAnswer[];
}

export interface Checkpoint {
  id: number;
  date: string;
  weight: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  note: string | null;
  createdAt: string;
}

export interface DashboardStats {
  streak: number;
  totalLogs: number;
  avgProtein: number;
  todayLogged: boolean;
  activePhase: Phase | null;
  recentLogs: DailyLog[];
}
