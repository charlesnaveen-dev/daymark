export type Category =
  | 'Agency'
  | 'Music'
  | 'Personal'
  | 'Break'
  | 'Learning'
  | 'Other';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface TimeEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  category: Category;
  activityName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  accomplished: string;
  incomplete: string;
  distractions: string;
  learned: string;
  improvements: string;
  tomorrowPriority: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  displayName: string;
  theme: ThemeMode;
  agencyTargetMinutes: number; // default 300 (5h)
  musicTargetMinutes: number; // default 210 (3h 30m)
  streakThresholdPercent: number; // default 80
  dailyReviewTime: string; // default "23:00"
  updatedAt: string;
}

export interface ScheduleSubBlock {
  timeRange: string;
  title: string;
}

export interface ScheduleBlock {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timeLabel: string;
  title: string;
  category: Category;
  description?: string;
  subBlocks?: ScheduleSubBlock[];
}

export interface WeeklyFocusItem {
  dayIndex: number; // 0 = Sunday ... 6 = Saturday
  dayName: string;
  agencyFocus: string;
  musicFocus: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'hours' | 'days';
  achieved: boolean;
}
