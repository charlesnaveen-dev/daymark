import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData } from '../contexts/DataContext';
import {
  computeDailySummary,
  getDefaultMonthRange,
  getDefaultWeekRange,
  getRangeDates,
  getTopActivities,
  getWeeklyComparisonForMonth,
} from '../utils/analytics';
import {
  CATEGORY_COLORS,
  CATEGORY_LIST,
  formatDuration,
  formatHoursDecimal,
  getTodayDateString,
} from '../utils/time';

type ReportTab = 'daily' | 'weekly' | 'monthly';

export function AnalyticsPage() {
  const { entries, preferences } = useData();
  const [tab, setTab] = useState<ReportTab>('weekly');

  const todayStr = getTodayDateString();
  const [dailyDate, setDailyDate] = useState(todayStr);

  const defaultWeek = getDefaultWeekRange();
  const [weekStart, setWeekStart] = useState(defaultWeek.start);
  const [weekEnd, setWeekEnd] = useState(defaultWeek.end);

  const defaultMonth = getDefaultMonthRange();
  const [monthStart, setMonthStart] = useState(defaultMonth.start);
  const [monthEnd, setMonthEnd] = useState(defaultMonth.end);

  // Daily Report Data
  const dailySummary = useMemo(
    () => computeDailySummary(entries, dailyDate, preferences),
    [entries, dailyDate, preferences]
  );

  const dailyPlannedVsActual = useMemo(
    () => [
      {
        name: 'Agency',
        Planned: Number((preferences.agencyTargetMinutes / 60).toFixed(1)),
        Actual: Number((dailySummary.agencyMinutes / 60).toFixed(1)),
      },
      {
        name: 'Music',
        Planned: Number((preferences.musicTargetMinutes / 60).toFixed(1)),
        Actual: Number((dailySummary.musicMinutes / 60).toFixed(1)),
      },
    ],
    [dailySummary, preferences]
  );

  // Weekly Report Data
  const weekDates = useMemo(
    () => getRangeDates(weekStart, weekEnd),
    [weekStart, weekEnd]
  );

  const weeklyChartData = useMemo(
    () =>
      weekDates.map((d) => {
        const s = computeDailySummary(entries, d, preferences);
        return {
          date: d,
          label: format(parseISO(d), 'EEE d'),
          Agency: Number((s.agencyMinutes / 60).toFixed(2)),
          Music: Number((s.musicMinutes / 60).toFixed(2)),
          focusedMinutes: s.focusedMinutes,
        };
      }),
    [weekDates, entries, preferences]
  );

  const weekEntries = useMemo(
    () => entries.filter((e) => e.date >= weekStart && e.date <= weekEnd),
    [entries, weekStart, weekEnd]
  );

  const weekStats = useMemo(() => {
    const totalFocusedMin = weeklyChartData.reduce(
      (s, d) => s + d.focusedMinutes,
      0
    );
    const activeDays = Math.max(1, weeklyChartData.length);
    const mostProductive = [...weeklyChartData].sort(
      (a, b) => b.focusedMinutes - a.focusedMinutes
    )[0];

    return {
      totalFocusedMin,
      avgFocusedMin: Math.round(totalFocusedMin / activeDays),
      mostProductive:
        mostProductive && mostProductive.focusedMinutes > 0
          ? `${mostProductive.label} (${formatDuration(mostProductive.focusedMinutes)})`
          : '—',
      topActivities: getTopActivities(weekEntries, 5),
    };
  }, [weeklyChartData, weekEntries]);

  // Monthly Report Data
  const monthEntries = useMemo(
    () => entries.filter((e) => e.date >= monthStart && e.date <= monthEnd),
    [entries, monthStart, monthEnd]
  );

  const monthCategoryData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const mins = monthEntries
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + e.durationMinutes, 0);
      return {
        name: cat,
        value: Number((mins / 60).toFixed(1)),
        minutes: mins,
        color: CATEGORY_COLORS[cat].chart,
      };
    }).filter((item) => item.minutes > 0);
  }, [monthEntries]);

  const monthWeeklyComparison = useMemo(
    () => getWeeklyComparisonForMonth(monthEntries, parseISO(monthStart)),
    [monthEntries, monthStart]
  );

  const monthStats = useMemo(() => {
    const totalWorkedMin = monthEntries.reduce(
      (s, e) => s + e.durationMinutes,
      0
    );
    const monthDates = getRangeDates(monthStart, monthEnd);
    const metDays = monthDates.filter(
      (d) => computeDailySummary(entries, d, preferences).isTargetMet
    ).length;

    return {
      totalWorkedMin,
      metDays,
      totalDays: monthDates.length,
    };
  }, [monthEntries, monthStart, monthEnd, entries, preferences]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Analytics &amp; Reports
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Honest insights computed strictly from your recorded sessions.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Report period"
          className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1"
        >
          {(['daily', 'weekly', 'monthly'] as ReportTab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* DAILY TAB */}
      {tab === 'daily' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Select date
            </span>
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              aria-label="Daily report date"
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Recorded" value={formatDuration(dailySummary.totalRecordedMinutes)} />
            <StatCard label="Agency" value={formatDuration(dailySummary.agencyMinutes)} />
            <StatCard label="Music" value={formatDuration(dailySummary.musicMinutes)} />
            <StatCard label="Personal" value={formatDuration(dailySummary.personalMinutes)} />
            <StatCard label="Break" value={formatDuration(dailySummary.breakMinutes)} />
            <StatCard label="Target Completion" value={`${dailySummary.completionPercent}%`} />
          </div>

          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
            <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
              Planned vs Actual Focused Hours
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyPlannedVsActual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-subtle)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Planned" fill="var(--border-strong)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Actual" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* WEEKLY TAB */}
      {tab === 'weekly' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Date range
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                aria-label="Week start date"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
              <span className="text-xs text-[var(--text-secondary)]">to</span>
              <input
                type="date"
                value={weekEnd}
                onChange={(e) => setWeekEnd(e.target.value)}
                aria-label="Week end date"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Focused Hours" value={`${formatHoursDecimal(weekStats.totalFocusedMin)}h`} />
            <StatCard label="Avg Focused / Day" value={`${formatHoursDecimal(weekStats.avgFocusedMin)}h`} />
            <StatCard label="Most Productive Day" value={weekStats.mostProductive} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                Agency vs Music Daily Performance
              </h2>
              {weekEntries.length === 0 ? (
                <EmptyChartState />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} unit="h" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="Agency" stackId="a" fill="#7665E8" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="Music" stackId="a" fill="#269B76" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                Top Activities
              </h2>
              {weekStats.topActivities.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)]">
                  No activities logged in this range yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {weekStats.topActivities.map((act) => (
                    <li
                      key={`${act.category}-${act.name}`}
                      className="flex items-center justify-between gap-2 rounded-xl bg-[var(--bg-primary)] px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                          {act.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {act.category}
                        </p>
                      </div>
                      <span className="tabular-nums text-xs font-semibold text-[var(--text-primary)]">
                        {formatDuration(act.minutes)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {/* MONTHLY TAB */}
      {tab === 'monthly' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Month range
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={monthStart}
                onChange={(e) => setMonthStart(e.target.value)}
                aria-label="Month start date"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
              <span className="text-xs text-[var(--text-secondary)]">to</span>
              <input
                type="date"
                value={monthEnd}
                onChange={(e) => setMonthEnd(e.target.value)}
                aria-label="Month end date"
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Hours Recorded"
              value={`${formatHoursDecimal(monthStats.totalWorkedMin)}h`}
            />
            <StatCard
              label="Target Days Met"
              value={`${monthStats.metDays} / ${monthStats.totalDays}`}
            />
            <StatCard
              label="Monthly Consistency"
              value={`${
                monthStats.totalDays > 0
                  ? Math.round((monthStats.metDays / monthStats.totalDays) * 100)
                  : 0
              }%`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                Weekly Comparisons
              </h2>
              {monthEntries.length === 0 ? (
                <EmptyChartState />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthWeeklyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="weekLabel" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} unit="h" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="agencyHours" name="Agency (h)" fill="#7665E8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="musicHours" name="Music (h)" fill="#269B76" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                Category Breakdown (Hours)
              </h2>
              {monthCategoryData.length === 0 ? (
                <EmptyChartState />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={92}
                        paddingAngle={3}
                      >
                        {monthCategoryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-subtle)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="tabular-nums mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] px-6 text-center">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No recorded sessions in this period
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Charts will populate automatically as you log real entries.
        </p>
      </div>
    </div>
  );
}
