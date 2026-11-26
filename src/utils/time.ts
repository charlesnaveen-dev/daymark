import { addDays, format, parseISO } from 'date-fns';
import { Category, TimeEntry } from '../types';

export const CATEGORY_LIST: Category[] = [
  'Agency',
  'Music',
  'Learning',
  'Personal',
  'Break',
  'Other',
];

export const FOCUSED_CATEGORIES: Category[] = ['Agency', 'Music'];

export const CATEGORY_COLORS: Record<
  Category,
  { bg: string; text: string; dot: string; chart: string }
> = {
  Agency: {
    bg: 'bg-[#EEEAFE] dark:bg-[#262247]',
    text: 'text-[#5A49CC] dark:text-[#BDB4F8]',
    dot: '#7665E8',
    chart: '#7665E8',
  },
  Music: {
    bg: 'bg-[#E7F6F1] dark:bg-[#17332B]',
    text: 'text-[#1F7F60] dark:text-[#5FD4AD]',
    dot: '#269B76',
    chart: '#269B76',
  },
  Learning: {
    bg: 'bg-[#E8F1FD] dark:bg-[#1B2B45]',
    text: 'text-[#2D68B8] dark:text-[#7BB0F7]',
    dot: '#3B82F6',
    chart: '#3B82F6',
  },
  Personal: {
    bg: 'bg-[#FDF3E7] dark:bg-[#332618]',
    text: 'text-[#B4681C] dark:text-[#F2B16D]',
    dot: '#D9822B',
    chart: '#D9822B',
  },
  Break: {
    bg: 'bg-[#F0F1F6] dark:bg-[#252836]',
    text: 'text-[#6A6E80] dark:text-[#A3A7BA]',
    dot: '#85889A',
    chart: '#85889A',
  },
  Other: {
    bg: 'bg-[#F5ECF7] dark:bg-[#312136]',
    text: 'text-[#8B4C9B] dark:text-[#D196E0]',
    dot: '#A855F7',
    chart: '#A855F7',
  },
};

export function parseTimeToMinutes(timeStr: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/**
 * Calculates duration in minutes between startTime (HH:mm) and endTime (HH:mm).
 * If endTime <= startTime, assumes the activity crosses midnight into the next day.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  if (start === end) return 0;
  if (end > start) return end - start;
  return 24 * 60 - start + end;
}

export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHoursDecimal(minutes: number): string {
  return (Math.max(0, minutes) / 60).toFixed(1);
}

export function formatTime12h(timeStr: string): string {
  const mins = parseTimeToMinutes(timeStr);
  if (Number.isNaN(mins)) return timeStr;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function crossesMidnight(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return end < start;
}

/**
 * Converts a date + start/end time into absolute epoch-minute intervals
 * so midnight-crossing entries are checked accurately against adjacent dates too.
 */
function toAbsoluteMinuteInterval(
  dateStr: string,
  startTime: string,
  endTime: string
): { startAbs: number; endAbs: number } | null {
  const startMin = parseTimeToMinutes(startTime);
  const duration = calculateDurationMinutes(startTime, endTime);
  if (Number.isNaN(startMin) || duration <= 0) return null;

  const baseDate = parseISO(dateStr);
  const dayEpochMinutes = Math.floor(baseDate.getTime() / 60000);
  const startAbs = dayEpochMinutes + startMin;
  return {
    startAbs,
    endAbs: startAbs + duration,
  };
}

export interface OverlapCheckResult {
  hasOverlap: boolean;
  conflictingEntry?: TimeEntry;
}

export function checkTimeOverlap(
  candidate: {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
  },
  existingEntries: TimeEntry[]
): OverlapCheckResult {
  const candInterval = toAbsoluteMinuteInterval(
    candidate.date,
    candidate.startTime,
    candidate.endTime
  );
  if (!candInterval) return { hasOverlap: false };

  const prevDate = format(addDays(parseISO(candidate.date), -1), 'yyyy-MM-dd');
  const nextDate = format(addDays(parseISO(candidate.date), 1), 'yyyy-MM-dd');

  for (const entry of existingEntries) {
    if (candidate.id && entry.id === candidate.id) continue;
    if (
      entry.date !== candidate.date &&
      entry.date !== prevDate &&
      entry.date !== nextDate
    ) {
      continue;
    }

    const entryInterval = toAbsoluteMinuteInterval(
      entry.date,
      entry.startTime,
      entry.endTime
    );
    if (!entryInterval) continue;

    // Overlap if intervals intersect (touching endpoints e.g. 12:30 and 12:30 are allowed)
    if (
      candInterval.startAbs < entryInterval.endAbs &&
      candInterval.endAbs > entryInterval.startAbs
    ) {
      return { hasOverlap: true, conflictingEntry: entry };
    }
  }

  return { hasOverlap: false };
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
