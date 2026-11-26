import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Category, TimeEntry } from '../types';
import {
  calculateDurationMinutes,
  CATEGORY_COLORS,
  checkTimeOverlap,
  formatDuration,
  formatTime12h,
  getTodayDateString,
} from '../utils/time';
import { TimeEntryForm } from '../components/tracker/TimeEntryForm';
import { LiveTimerWidget } from '../components/tracker/LiveTimerWidget';
import { TimeEntryModal } from '../components/tracker/TimeEntryModal';

export function TimeTrackerPage() {
  const { entries, addOrUpdateEntry, deleteEntry } = useData();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [timerMessage, setTimerMessage] = useState<string | null>(null);

  const dayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [entries, selectedDate]
  );

  const totalDayMinutes = useMemo(
    () => dayEntries.reduce((s, e) => s + e.durationMinutes, 0),
    [dayEntries]
  );

  const handleSaveTimer = async (data: {
    date: string;
    startTime: string;
    endTime: string;
    category: Category;
    activityName: string;
  }) => {
    setTimerMessage(null);
    const durationMinutes = calculateDurationMinutes(
      data.startTime,
      data.endTime
    );
    if (durationMinutes <= 0) {
      setTimerMessage('Timer duration was too short to log.');
      return;
    }

    const overlap = checkTimeOverlap(
      { date: data.date, startTime: data.startTime, endTime: data.endTime },
      entries
    );
    if (overlap.hasOverlap) {
      setTimerMessage(
        'Timer session overlaps with an existing entry. Please adjust manually.'
      );
      return;
    }

    await addOrUpdateEntry({
      id: crypto.randomUUID(),
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes,
      category: data.category,
      activityName: data.activityName,
      notes: 'Logged via optional live timer',
    });
    setSelectedDate(data.date);
    setTimerMessage(`Saved ${formatDuration(durationMinutes)} from timer.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Manual Time Tracker
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Log focused work, learning, personal activities, and breaks for today
          or previous dates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Primary Manual Entry Form */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:col-span-3">
          <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
            New Time Entry
          </h2>
          <TimeEntryForm
            defaultDate={selectedDate}
            onSuccess={(saved) => setSelectedDate(saved.date)}
          />
        </section>

        {/* Secondary Live Timer + Date Summary */}
        <div className="space-y-6 lg:col-span-2">
          <LiveTimerWidget onSaveTimer={handleSaveTimer} />
          {timerMessage && (
            <p
              role="status"
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)]"
            >
              {timerMessage}
            </p>
          )}

          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Entries for Date
                </h2>
                <p className="tabular-nums text-xs text-[var(--text-secondary)]">
                  Total: {formatDuration(totalDayMinutes)}
                </p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Filter entries by date"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>

            {dayEntries.length === 0 ? (
              <p className="rounded-xl bg-[var(--bg-primary)] px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
                No entries recorded for {selectedDate}.
              </p>
            ) : (
              <ul className="space-y-2">
                {dayEntries.map((entry) => {
                  const colors = CATEGORY_COLORS[entry.category];
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                          {entry.activityName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                          <span className="tabular-nums">
                            {formatTime12h(entry.startTime)} –{' '}
                            {formatTime12h(entry.endTime)}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                          >
                            {entry.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="tabular-nums mr-1 text-xs font-semibold text-[var(--text-primary)]">
                          {formatDuration(entry.durationMinutes)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingEntry(entry)}
                          aria-label={`Edit ${entry.activityName}`}
                          className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          aria-label={`Delete ${entry.activityName}`}
                          className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <TimeEntryModal
        open={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        initialEntry={editingEntry}
      />
    </div>
  );
}
