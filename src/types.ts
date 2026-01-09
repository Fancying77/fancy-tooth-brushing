export enum Screen {
  HOME = 'home',
  BRUSHING = 'brushing',
  CELEBRATION = 'celebration'
}

export enum TimeSlot {
  MORNING = 'morning',
  EVENING = 'evening',
  NONE = 'none'
}

export interface BrushLog {
  date: string;
  slot: TimeSlot;
  timestamp: number;
}

export interface AppState {
  stars: number;
  streak: number;
  logs: BrushLog[];
  unlockedMilestones: number[];
  firstUseDate: string;
}
