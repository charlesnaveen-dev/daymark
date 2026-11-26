import { describe, expect, it } from 'vitest';
import { TimeEntry } from '../../types';
import {
  calculateDurationMinutes,
  checkTimeOverlap,
  crossesMidnight,
  formatDuration,
} from '../time';
import { computeDailySummary, computeMilestones } from '../analytics';

const mockPrefs = {
  agencyTargetMinutes: 300,
  musicTargetMinutes: 210,
  streakThresholdPercent: 80,
};

function makeEntry(overrides: Partial<TimeEntry>): TimeEntry {
  return {
    id: '1',
    userId: 'u1',
    date: '2026-11-26',
    startTime: '10:00',
    endTime: '12:30',
    durationMinutes: 150,
    category: 'Agency',
    activityName: 'Build project',
    notes: '',
    createdAt: '2026-11-26T10:00:00Z',
    updatedAt: '2026-11-26T10:00:00Z',
    ...overrides,
  };
}

describe('time calculations', () => {
  it('calculates standard duration correctly', () => {
    expect(calculateDurationMinutes('10:00', '12:30')).toBe(150);
    expect(crossesMidnight('10:00', '12:30')).toBe(false);
    expect(formatDuration(150)).toBe('2h 30m');
  });

  it('supports activities crossing midnight', () => {
    expect(calculateDurationMinutes('23:00', '01:30')).toBe(150);
    expect(crossesMidnight('23:00', '01:30')).toBe(true);
  });

  it('returns 0 when start and end are identical', () => {
    expect(calculateDurationMinutes('10:00', '10:00')).toBe(0);
  });
});

describe('overlap validation', () => {
  const existing = [
    makeEntry({
      id: 'e1',
      date: '2026-11-26',
      startTime: '10:00',
      endTime: '12:30',
      durationMinutes: 150,
    }),
  ];

  it('detects overlapping intervals on the same date', () => {
    const res = checkTimeOverlap(
      { date: '2026-11-26', startTime: '11:00', endTime: '13:00' },
      existing
    );
    expect(res.hasOverlap).toBe(true);
    expect(res.conflictingEntry?.id).toBe('e1');
  });

  it('allows touching endpoints without overlap', () => {
    const res = checkTimeOverlap(
      { date: '2026-11-26', startTime: '12:30', endTime: '14:00' },
      existing
    );
    expect(res.hasOverlap).toBe(false);
  });

  it('excludes the entry being edited', () => {
    const res = checkTimeOverlap(
      { id: 'e1', date: '2026-11-26', startTime: '10:00', endTime: '12:30' },
      existing
    );
    expect(res.hasOverlap).toBe(false);
  });
});

describe('daily target & milestone calculations', () => {
  it('excludes Break and Personal from focused-work target', () => {
    const entries: TimeEntry[] = [
      makeEntry({ id: '1', category: 'Agency', durationMinutes: 300 }),
      makeEntry({ id: '2', category: 'Music', durationMinutes: 210 }),
      makeEntry({ id: '3', category: 'Break', durationMinutes: 120 }),
      makeEntry({ id: '4', category: 'Personal', durationMinutes: 60 }),
    ];

    const summary = computeDailySummary(entries, '2026-11-26', mockPrefs);
    expect(summary.focusedMinutes).toBe(510);
    expect(summary.completionPercent).toBe(100);
    expect(summary.totalRecordedMinutes).toBe(690);
    expect(summary.isTargetMet).toBe(true);
  });

  it('computes milestones accurately', () => {
    const entries: TimeEntry[] = [
      makeEntry({ id: '1', category: 'Agency', durationMinutes: 600 }),
    ];
    const milestones = computeMilestones(entries, mockPrefs);
    const first10 = milestones.find((m) => m.id === 'focused-10');
    expect(first10?.achieved).toBe(true);
  });
});
