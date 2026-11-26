import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Flame,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import {
  ACHIEVEMENT_MESSAGES,
  getDailyMotivation,
  getGreeting,
} from '../data/motivation';
import { getFocusForDay } from '../data/schedule';
import { TimeEntry } from '../types';
import {
  computeDailySummary,
  computeMilestones,
  computeStreak,
  computeWeeklyConsistency,
} from '../utils/analytics';
import {
  CATEGORY_COLORS,
  formatDuration,
  formatTime12h,
  getTodayDateString,
} from '../utils/time';
import { ProgressRing } from '../components/ui/ProgressRing';
import { TimeEntryModal } from '../components/tracker/TimeEntryModal';

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function DashboardPage() {
  const { entries, preferences, deleteEntry, loading } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const now = new Date();
  const todayStr = getTodayDateString();
  const greeting = getGreeting(now.getHours());
  const fullDateLabel = format(now, 'EEEE, MMMM d, yyyy');
  const motivation = getDailyMotivation(todayStr);
  const todayFocus = getFocusForDay(now.getDay());

  const summary = useMemo(
    () => computeDailySummary(entries, todayStr, preferences),
    [entries, todayStr, preferences]
  );

  const streak = useMemo(
    () => computeStreak(entries, preferences, now),
    [entries, preferences]
  );

  const weeklyConsistency = useMemo(
    () => computeWeeklyConsistency(entries, preferences, now),
    [entries, preferences]
  );

  const milestones = useMemo(
    () => computeMilestones(entries, preferences),
    [entries, preferences]
  );

  const todayTimeline = useMemo(
    () =>
      entries
        .filter((e) => e.date === todayStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [entries, todayStr]
  );

  const agencyPct = Math.min(
    100,
    Math.round(
      (summary.agencyMinutes / Math.max(1, preferences.agencyTargetMinutes)) *
        100
    )
  );
  const musicPct = Math.min(
    100,
    Math.round(
      (summary.musicMinutes / Math.max(1, preferences.musicTargetMinutes)) * 100
    )
  );

  const achievementLine =
    ACHIEVEMENT_MESSAGES[now.getDate() % ACHIEVEMENT_MESSAGES.length];

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--bg-card)]" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-[var(--bg-card)] lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-2xl bg-[var(--bg-card)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting & Daily Focus */}
      <motion.section
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {fullDateLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {greeting}, {preferences.displayName}.
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            {motivation}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 sm:min-w-[260px]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
            {todayFocus.dayName} Focus
          </p>
          <div className="mt-1.5 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Agency</span>
              <span className="font-medium text-[var(--text-primary)]">
                {todayFocus.agencyFocus}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Music</span>
              <span className="font-medium text-[var(--text-primary)]">
                {todayFocus.musicFocus}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Subtle Target Completion Celebration */}
      {summary.completionPercent >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-5 py-3.5 text-sm text-[var(--success)]"
        >
          <div className="flex items-center gap-2.5 font-medium">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Daily focused target reached. {achievementLine}
            </span>
          </div>
          <span className="tabular-nums font-semibold">
            {summary.completionPercent}%
          </span>
        </motion.div>
      )}

      {/* Daily Progress Overview + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:col-span-2"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <ProgressRing
                percent={summary.completionPercent}
                label={`${summary.completionPercent}%`}
                sublabel={`${formatDuration(summary.focusedMinutes)} / ${formatDuration(
                  summary.targetMinutes
                )}`}
              />
            </div>

            <div className="w-full flex-1 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Daily Focused Progress
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Target: {formatDuration(summary.targetMinutes)} (Agency + Music only)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Total recorded today:{' '}
                  </span>
                  <span className="tabular-nums text-xs font-semibold text-[var(--text-primary)]">
                    {formatDuration(summary.totalRecordedMinutes)}
                  </span>
                </div>
              </div>

              {/* Agency & Music Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">
                      Agency
                    </span>
                    <span className="tabular-nums text-[var(--text-secondary)]">
                      {formatDuration(summary.agencyMinutes)} /{' '}
                      {formatDuration(preferences.agencyTargetMinutes)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agencyPct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)]">
                      Music
                    </span>
                    <span className="tabular-nums text-[var(--text-secondary)]">
                      {formatDuration(summary.musicMinutes)} /{' '}
                      {formatDuration(preferences.musicTargetMinutes)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${musicPct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-[var(--success)]"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary time metrics */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl bg-[var(--bg-primary)] px-3 py-2.5">
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Personal
                  </p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                    {formatDuration(summary.personalMinutes)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-primary)] px-3 py-2.5">
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Break time
                  </p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                    {formatDuration(summary.breakMinutes)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-primary)] px-3 py-2.5">
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Learning
                  </p>
                  <p className="tabular-nums mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
                    {formatDuration(summary.learningMinutes)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions & Consistency */}
        <motion.section
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6"
        >
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Quick Actions
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-primary-hover)]"
              >
                <Plus className="h-4 w-4" />
                <span>Log Time</span>
              </button>
              <Link
                to="/schedule"
                className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <CalendarClock className="h-4 w-4 text-[var(--accent-primary)]" />
                <span>View Schedule</span>
              </Link>
              <Link
                to="/review"
                className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <BookOpenCheck className="h-4 w-4 text-[var(--accent-primary)]" />
                <span>Daily Review</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                <BarChart3 className="h-4 w-4 text-[var(--accent-primary)]" />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-primary)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent-primary)]" />
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Current Streak
                </span>
              </div>
              <span className="tabular-nums text-sm font-bold text-[var(--text-primary)]">
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-1">
              {weeklyConsistency.days.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={`${d.label}: ${d.percent}%`}
                >
                  <div
                    className={`h-2.5 w-full rounded-full ${
                      d.met
                        ? 'bg-[var(--success)]'
                        : d.percent > 0
                          ? 'bg-[var(--accent-primary)]/40'
                          : 'bg-[var(--bg-subtle)]'
                    }`}
                  />
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {d.label.slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
              {weeklyConsistency.metDays} of {weeklyConsistency.totalDays} days
              at target this week
            </p>
          </div>
        </motion.section>
      </div>

      {/* Today's Activity Timeline & Milestones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Today&apos;s Activity Timeline
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Chronological log of your recorded sessions
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              className="text-xs font-medium text-[var(--accent-primary)] hover:underline"
            >
              + Add session
            </button>
          </div>

          {todayTimeline.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                No sessions logged yet today
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Start with your first block and build momentum one session at a
                time.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-primary-hover)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log first session</span>
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {todayTimeline.map((entry) => {
                const colors = CATEGORY_COLORS[entry.category];
                return (
                  <li
                    key={entry.id}
                    className="group flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 transition-colors hover:border-[var(--border-strong)] sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3 sm:items-center">
                      <span className="tabular-nums w-32 shrink-0 text-xs font-medium text-[var(--text-secondary)]">
                        {formatTime12h(entry.startTime)} –{' '}
                        {formatTime12h(entry.endTime)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {entry.activityName}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                          >
                            {entry.category}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="tabular-nums text-xs font-semibold text-[var(--text-primary)]">
                        {formatDuration(entry.durationMinutes)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          aria-label={`Edit ${entry.activityName}`}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          aria-label={`Delete ${entry.activityName}`}
                          className="rounded-lg p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.section>

        {/* Milestones */}
        <motion.section
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Milestones
            </h2>
          </div>

          <div className="space-y-3">
            {milestones.map((m) => {
              const pct = Math.min(
                100,
                Math.round((m.currentValue / m.targetValue) * 100)
              );
              return (
                <div
                  key={m.id}
                  className="rounded-xl bg-[var(--bg-primary)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {m.title}
                    </span>
                    {m.achieved ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" />
                    ) : (
                      <span className="tabular-nums text-[11px] text-[var(--text-secondary)]">
                        {m.currentValue}/{m.targetValue} {m.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        m.achieved
                          ? 'bg-[var(--success)]'
                          : 'bg-[var(--accent-primary)]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>

      <TimeEntryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        initialEntry={editingEntry}
      />
    </div>
  );
}
