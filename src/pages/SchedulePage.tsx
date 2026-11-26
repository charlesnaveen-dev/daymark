import { useMemo } from 'react';
import { CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import {
  DAILY_SCHEDULE,
  getFocusForDay,
  WEEKLY_FOCUS_ROTATION,
} from '../data/schedule';
import { CATEGORY_COLORS, parseTimeToMinutes } from '../utils/time';

export function SchedulePage() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDayIndex = now.getDay();
  const todayFocus = getFocusForDay(todayDayIndex);

  const activeBlockId = useMemo(() => {
    const found = DAILY_SCHEDULE.find((block) => {
      const start = parseTimeToMinutes(block.startTime);
      const end = parseTimeToMinutes(block.endTime);
      return currentMinutes >= start && currentMinutes < end;
    });
    return found?.id ?? null;
  }, [currentMinutes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            My Daily Schedule
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Structured execution blueprint from 10:00 AM to 11:15 PM.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-xs">
          <span className="font-semibold text-[var(--accent-primary)]">
            Today ({todayFocus.dayName}):
          </span>{' '}
          <span className="text-[var(--text-primary)]">
            {todayFocus.agencyFocus} &amp; {todayFocus.musicFocus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Blueprint */}
        <section className="space-y-3 lg:col-span-2">
          {DAILY_SCHEDULE.map((block) => {
            const isActive = block.id === activeBlockId;
            const colors = CATEGORY_COLORS[block.category];

            return (
              <div
                key={block.id}
                className={`rounded-2xl border p-5 transition-colors ${
                  isActive
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)]/35'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-[var(--accent-primary)]" />
                    <span className="tabular-nums text-xs font-semibold text-[var(--text-secondary)]">
                      {block.timeLabel}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-[var(--accent-primary)] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        Now
                      </span>
                    )}
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                  >
                    {block.category}
                  </span>
                </div>

                <h2 className="mt-2 text-base font-semibold tracking-tight text-[var(--text-primary)]">
                  {block.title}
                </h2>

                {block.description && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {block.description}
                  </p>
                )}

                {block.subBlocks && (
                  <ul className="mt-3 space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
                    {block.subBlocks.map((sub) => (
                      <li
                        key={sub.timeRange}
                        className="flex items-baseline gap-3 text-sm"
                      >
                        <span className="tabular-nums w-24 shrink-0 text-xs font-medium text-[var(--text-secondary)]">
                          {sub.timeRange}
                        </span>
                        <span className="text-[var(--text-primary)]">
                          {sub.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>

        {/* Weekly Focus Rotation */}
        <section className="h-fit rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Weekly Focus Rotation
            </h2>
          </div>

          <div className="space-y-3">
            {WEEKLY_FOCUS_ROTATION.map((item) => {
              const isToday = item.dayIndex === todayDayIndex;
              return (
                <div
                  key={item.dayName}
                  className={`rounded-xl border p-3.5 ${
                    isToday
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)]/40'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {item.dayName}
                    </span>
                    {isToday && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent-primary)]">
                        <CheckCircle2 className="h-3 w-3" />
                        Today
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        Agency:
                      </span>{' '}
                      {item.agencyFocus}
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">
                        Music:
                      </span>{' '}
                      {item.musicFocus}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
