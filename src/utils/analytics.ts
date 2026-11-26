import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';
import { Category, Milestone, TimeEntry, UserPreferences } from '../types';
import { CATEGORY_LIST } from './time';

export interface DailySummary {
  date: string;
  agencyMinutes: number;
  musicMinutes: number;
  learningMinutes: number;
  personalMinutes: number;
  breakMinutes: number;
  otherMinutes: number;
  focusedMinutes: number; // Agency + Music ONLY
  totalRecordedMinutes: number; // All categories
  targetMinutes: number; // Agency target + Music target (default 510)
  completionPercent: number; // Focused / target * 100
  isTargetMet: boolean;
}

export function computeDailySummary(
  entries: TimeEntry[],
  dateStr: string,
  prefs: Pick<UserPreferences, 'agencyTargetMinutes' | 'musicTargetMinutes' | 'streakThresholdPercent'>
): DailySummary {
  const dayEntries = entries.filter((e) => e.date === dateStr);
  const byCat: Record<Category, number> = {
    Agency: 0,
    Music: 0,
    Learning: 0,
    Personal: 0,
    Break: 0,
    Other: 0,
  };

  for (const e of dayEntries) {
    byCat[e.category] = (byCat[e.category] ?? 0) + e.durationMinutes;
  }

  const focusedMinutes = byCat.Agency + byCat.Music;
  const totalRecordedMinutes = CATEGORY_LIST.reduce(
    (sum, cat) => sum + byCat[cat],
    0
  );
  const targetMinutes = Math.max(
    1,
    prefs.agencyTargetMinutes + prefs.musicTargetMinutes
  );
  const completionPercent = Math.round((focusedMinutes / targetMinutes) * 100);

  return {
    date: dateStr,
    agencyMinutes: byCat.Agency,
    musicMinutes: byCat.Music,
    learningMinutes: byCat.Learning,
    personalMinutes: byCat.Personal,
    breakMinutes: byCat.Break,
    otherMinutes: byCat.Other,
    focusedMinutes,
    totalRecordedMinutes,
    targetMinutes,
    completionPercent,
    isTargetMet: completionPercent >= prefs.streakThresholdPercent,
  };
}

export function computeStreak(
  entries: TimeEntry[],
  prefs: Pick<UserPreferences, 'agencyTargetMinutes' | 'musicTargetMinutes' | 'streakThresholdPercent'>,
  referenceDate: Date = new Date()
): number {
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const todaySummary = computeDailySummary(entries, todayStr, prefs);

  let streak = 0;
  let cursor = todaySummary.isTargetMet
    ? referenceDate
    : subDays(referenceDate, 1);

  for (let i = 0; i < 365; i++) {
    const dStr = format(cursor, 'yyyy-MM-dd');
    const summary = computeDailySummary(entries, dStr, prefs);
    if (summary.isTargetMet) {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function computeWeeklyConsistency(
  entries: TimeEntry[],
  prefs: Pick<UserPreferences, 'agencyTargetMinutes' | 'musicTargetMinutes' | 'streakThresholdPercent'>,
  referenceDate: Date = new Date()
): { metDays: number; totalDays: number; days: { date: string; label: string; met: boolean; percent: number }[] } {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const interval = eachDayOfInterval({ start, end });

  const days = interval.map((d) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const summary = computeDailySummary(entries, dateStr, prefs);
    return {
      date: dateStr,
      label: format(d, 'EEE'),
      met: summary.isTargetMet,
      percent: summary.completionPercent,
    };
  });

  return {
    metDays: days.filter((d) => d.met).length,
    totalDays: days.length,
    days,
  };
}

export function computeMilestones(
  entries: TimeEntry[],
  prefs: Pick<UserPreferences, 'agencyTargetMinutes' | 'musicTargetMinutes' | 'streakThresholdPercent'>
): Milestone[] {
  let totalFocusedMin = 0;
  let totalAgencyMin = 0;
  let totalMusicMin = 0;

  for (const e of entries) {
    if (e.category === 'Agency') {
      totalAgencyMin += e.durationMinutes;
      totalFocusedMin += e.durationMinutes;
    } else if (e.category === 'Music') {
      totalMusicMin += e.durationMinutes;
      totalFocusedMin += e.durationMinutes;
    }
  }

  const focusedHours = Math.floor(totalFocusedMin / 60);
  const agencyHours = Math.floor(totalAgencyMin / 60);
  const musicHours = Math.floor(totalMusicMin / 60);
  const streak = computeStreak(entries, prefs);

  return [
    {
      id: 'focused-10',
      title: 'First 10 focused hours',
      description: 'Log 10 hours of Agency and Music deep work.',
      targetValue: 10,
      currentValue: Math.min(10, focusedHours),
      unit: 'hours',
      achieved: focusedHours >= 10,
    },
    {
      id: 'focused-25',
      title: 'First 25 focused hours',
      description: 'Build steady momentum with 25 focused hours.',
      targetValue: 25,
      currentValue: Math.min(25, focusedHours),
      unit: 'hours',
      achieved: focusedHours >= 25,
    },
    {
      id: 'streak-7',
      title: '7-day consistency',
      description: 'Meet your daily completion target 7 days in a row.',
      targetValue: 7,
      currentValue: Math.min(7, streak),
      unit: 'days',
      achieved: streak >= 7,
    },
    {
      id: 'music-50',
      title: 'First 50 hours of music production',
      description: 'Invest 50 hours in musicianship and production.',
      targetValue: 50,
      currentValue: Math.min(50, musicHours),
      unit: 'hours',
      achieved: musicHours >= 50,
    },
    {
      id: 'agency-100',
      title: 'First 100 hours of agency work',
      description: 'Complete 100 hours of technical and business execution.',
      targetValue: 100,
      currentValue: Math.min(100, agencyHours),
      unit: 'hours',
      achieved: agencyHours >= 100,
    },
  ];
}

export function getRangeDates(startStr: string, endStr: string): string[] {
  const start = parseISO(startStr);
  const end = parseISO(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
}

export function getDefaultWeekRange(referenceDate: Date = new Date()): {
  start: string;
  end: string;
} {
  return {
    start: format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}

export function getDefaultMonthRange(referenceDate: Date = new Date()): {
  start: string;
  end: string;
} {
  return {
    start: format(startOfMonth(referenceDate), 'yyyy-MM-dd'),
    end: format(endOfMonth(referenceDate), 'yyyy-MM-dd'),
  };
}

export function getTopActivities(
  entries: TimeEntry[],
  limit = 5
): { name: string; category: Category; minutes: number }[] {
  const map = new Map<string, { name: string; category: Category; minutes: number }>();
  for (const e of entries) {
    const key = `${e.category}::${e.activityName.trim().toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.minutes += e.durationMinutes;
    } else {
      map.set(key, {
        name: e.activityName,
        category: e.category,
        minutes: e.durationMinutes,
      });
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}

export function getWeeklyComparisonForMonth(
  entries: TimeEntry[],
  referenceDate: Date = new Date()
): { weekLabel: string; agencyHours: number; musicHours: number; totalHours: number }[] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weeks: { weekLabel: string; agencyHours: number; musicHours: number; totalHours: number }[] = [];

  let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
  let weekNum = 1;

  while (cursor <= monthEnd) {
    const wEnd = addDays(cursor, 6);
    const startStr = format(cursor < monthStart ? monthStart : cursor, 'yyyy-MM-dd');
    const endStr = format(wEnd > monthEnd ? monthEnd : wEnd, 'yyyy-MM-dd');

    const weekEntries = entries.filter(
      (e) => e.date >= startStr && e.date <= endStr
    );

    const agencyMin = weekEntries
      .filter((e) => e.category === 'Agency')
      .reduce((s, e) => s + e.durationMinutes, 0);
    const musicMin = weekEntries
      .filter((e) => e.category === 'Music')
      .reduce((s, e) => s + e.durationMinutes, 0);
    const totalMin = weekEntries.reduce((s, e) => s + e.durationMinutes, 0);

    weeks.push({
      weekLabel: `Week ${weekNum}`,
      agencyHours: Number((agencyMin / 60).toFixed(1)),
      musicHours: Number((musicMin / 60).toFixed(1)),
      totalHours: Number((totalMin / 60).toFixed(1)),
    });

    cursor = addDays(cursor, 7);
    weekNum++;
  }

  return weeks;
}
