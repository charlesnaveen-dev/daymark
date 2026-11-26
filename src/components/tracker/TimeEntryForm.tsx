import React, { useId, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Category, TimeEntry } from '../../types';
import {
  calculateDurationMinutes,
  CATEGORY_COLORS,
  CATEGORY_LIST,
  checkTimeOverlap,
  crossesMidnight,
  formatDuration,
  formatTime12h,
  getTodayDateString,
  parseTimeToMinutes,
} from '../../utils/time';

interface TimeEntryFormProps {
  initialEntry?: TimeEntry | null;
  defaultDate?: string;
  onSuccess?: (saved: TimeEntry) => void;
  onCancel?: () => void;
}

export function TimeEntryForm({
  initialEntry,
  defaultDate,
  onSuccess,
  onCancel,
}: TimeEntryFormProps) {
  const { entries, addOrUpdateEntry } = useData();
  const baseId = useId();

  const [date, setDate] = useState(
    initialEntry?.date ?? defaultDate ?? getTodayDateString()
  );
  const [startTime, setStartTime] = useState(initialEntry?.startTime ?? '10:00');
  const [endTime, setEndTime] = useState(initialEntry?.endTime ?? '11:00');
  const [category, setCategory] = useState<Category>(
    initialEntry?.category ?? 'Agency'
  );
  const [activityName, setActivityName] = useState(
    initialEntry?.activityName ?? ''
  );
  const [notes, setNotes] = useState(initialEntry?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const durationMinutes = useMemo(
    () => calculateDurationMinutes(startTime, endTime),
    [startTime, endTime]
  );

  const isMidnightCrossing = useMemo(
    () => crossesMidnight(startTime, endTime),
    [startTime, endTime]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedMsg(null);

    if (!date) {
      setError('Please select a date.');
      return;
    }

    const sMin = parseTimeToMinutes(startTime);
    const eMin = parseTimeToMinutes(endTime);
    if (Number.isNaN(sMin) || Number.isNaN(eMin)) {
      setError('Please enter valid start and end times.');
      return;
    }

    if (durationMinutes <= 0) {
      setError('End time must differ from start time.');
      return;
    }

    if (!activityName.trim()) {
      setError('Please enter an activity name.');
      return;
    }

    const overlap = checkTimeOverlap(
      {
        id: initialEntry?.id,
        date,
        startTime,
        endTime,
      },
      entries
    );

    if (overlap.hasOverlap && overlap.conflictingEntry) {
      const c = overlap.conflictingEntry;
      setError(
        `Overlaps with "${c.activityName}" (${formatTime12h(c.startTime)} – ${formatTime12h(c.endTime)} on ${c.date}).`
      );
      return;
    }

    setSubmitting(true);
    try {
      const saved = await addOrUpdateEntry({
        id: initialEntry?.id ?? crypto.randomUUID(),
        date,
        startTime,
        endTime,
        durationMinutes,
        category,
        activityName: activityName.trim(),
        notes: notes.trim(),
        createdAt: initialEntry?.createdAt,
      });

      setSavedMsg(
        initialEntry
          ? 'Time entry updated.'
          : `Logged ${formatDuration(saved.durationMinutes)} for ${saved.activityName}.`
      );

      if (!initialEntry) {
        setActivityName('');
        setNotes('');
      }
      onSuccess?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm text-[var(--danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedMsg && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--success)]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor={`${baseId}-date`}
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Date <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${baseId}-date`}
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor={`${baseId}-start`}
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            Start time <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${baseId}-start`}
            name="startTime"
            type="time"
            required
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor={`${baseId}-end`}
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            End time <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${baseId}-end`}
            name="endTime"
            type="time"
            required
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Clock className="h-4 w-4 text-[var(--accent-primary)]" />
          <span>Calculated duration</span>
        </div>
        <div className="flex items-center gap-2">
          {isMidnightCrossing && durationMinutes > 0 && (
            <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent-soft-text)]">
              Crosses midnight
            </span>
          )}
          <span className="tabular-nums font-semibold text-[var(--text-primary)]">
            {durationMinutes > 0 ? formatDuration(durationMinutes) : '—'}
          </span>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
          Category
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {CATEGORY_LIST.map((cat) => {
            const active = category === cat;
            const colors = CATEGORY_COLORS[cat];
            return (
              <label
                key={cat}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-medium transition-all ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-soft-text)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={active}
                  onChange={() => setCategory(cat)}
                  className="sr-only"
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors.dot }}
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor={`${baseId}-activity`}
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Activity name <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${baseId}-activity`}
          name="activityName"
          type="text"
          required
          autoFocus={!initialEntry}
          placeholder="e.g., Build client dashboard, Sound design session"
          value={activityName}
          onChange={(e) => {
            setActivityName(e.target.value);
            setError(null);
          }}
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor={`${baseId}-notes`}
          className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
        >
          Description / notes
        </label>
        <textarea
          id={`${baseId}-notes`}
          name="notes"
          rows={3}
          placeholder="Optional details, links, or reflection..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)] disabled:opacity-60"
        >
          {submitting
            ? 'Saving...'
            : initialEntry
              ? 'Save changes'
              : 'Log time'}
        </button>
      </div>
    </form>
  );
}
