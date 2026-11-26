import { useEffect, useState } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Category } from '../../types';
import { CATEGORY_LIST } from '../../utils/time';

interface LiveTimerWidgetProps {
  onSaveTimer: (data: {
    date: string;
    startTime: string;
    endTime: string;
    category: Category;
    activityName: string;
  }) => void;
}

export function LiveTimerWidget({ onSaveTimer }: LiveTimerWidgetProps) {
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [category, setCategory] = useState<Category>('Agency');
  const [activityName, setActivityName] = useState('');

  useEffect(() => {
    if (!running || !startedAt) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, startedAt]);

  const handleStart = () => {
    setStartedAt(new Date());
    setElapsedSec(0);
    setRunning(true);
  };

  const handleStopAndLog = () => {
    if (!startedAt) return;
    const end = new Date();
    setRunning(false);

    const startTime = format(startedAt, 'HH:mm');
    let endTime = format(end, 'HH:mm');
    if (startTime === endTime) {
      // Ensure at least 1 minute if stopped immediately
      const plusOne = new Date(startedAt.getTime() + 60000);
      endTime = format(plusOne, 'HH:mm');
    }

    onSaveTimer({
      date: format(startedAt, 'yyyy-MM-dd'),
      startTime,
      endTime,
      category,
      activityName: activityName.trim() || `${category} focused session`,
    });

    setStartedAt(null);
    setElapsedSec(0);
  };

  const handleReset = () => {
    setRunning(false);
    setStartedAt(null);
    setElapsedSec(0);
  };

  const hrs = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);
  const secs = elapsedSec % 60;
  const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Optional Live Timer
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Secondary helper — manual entry remains primary.
          </p>
        </div>
        <span className="tabular-nums text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {formatted}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          placeholder="What are you working on?"
          aria-label="Timer activity name"
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-label="Timer category"
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
        >
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-soft-text)] transition-colors hover:bg-[var(--accent-primary)] hover:text-white"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Start timer</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleStopAndLog}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-primary-hover)]"
            >
              <Square className="h-3.5 w-3.5" />
              <span>Stop &amp; Save Entry</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
