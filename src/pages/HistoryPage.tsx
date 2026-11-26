import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Download,
  FileSpreadsheet,
  Pencil,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Category, TimeEntry } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LIST,
  formatDuration,
  formatTime12h,
} from '../utils/time';
import {
  exportMonthlySummaryCsv,
  exportTimeEntriesCsv,
} from '../utils/export';
import { TimeEntryModal } from '../components/tracker/TimeEntryModal';

export function HistoryPage() {
  const { entries, deleteEntry } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (categoryFilter !== 'All' && e.category !== categoryFilter) {
          return false;
        }
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        if (q) {
          const hay = `${e.activityName} ${e.notes} ${e.category}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.startTime.localeCompare(a.startTime);
      });
  }, [entries, categoryFilter, startDate, endDate, searchQuery]);

  const totalFilteredMinutes = useMemo(
    () => filtered.reduce((s, e) => s + e.durationMinutes, 0),
    [filtered]
  );

  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const currentMonthLabel = format(new Date(), 'MMMM yyyy');
  const currentMonthEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(currentMonthStr)),
    [entries, currentMonthStr]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Activity History &amp; Export
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Search, filter, edit, or export your recorded sessions.
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportTimeEntriesCsv(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() =>
              exportMonthlySummaryCsv(currentMonthEntries, currentMonthLabel)
            }
            disabled={currentMonthEntries.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Monthly Summary</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)] disabled:opacity-50"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <search className="no-print rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity or notes..."
              aria-label="Search activities"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] py-2 pr-3 pl-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as Category | 'All')
            }
            aria-label="Filter by category"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          >
            <option value="All">All categories</option>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start date filter"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End date filter"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
          />
        </div>
      </search>

      {/* Results Table / List */}
      <section className="print-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Showing <strong className="text-[var(--text-primary)]">{filtered.length}</strong>{' '}
            {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
          <span className="tabular-nums">
            Total duration:{' '}
            <strong className="text-[var(--text-primary)]">
              {formatDuration(totalFilteredMinutes)}
            </strong>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] px-6 py-12 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No matching entries found
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Try clearing your filters or log a new time entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Time</th>
                  <th className="py-3 pr-4">Activity</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4 text-right">Duration</th>
                  <th className="no-print py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filtered.map((entry) => {
                  const colors = CATEGORY_COLORS[entry.category];
                  return (
                    <tr key={entry.id} className="hover:bg-[var(--bg-primary)]/60">
                      <td className="tabular-nums whitespace-nowrap py-3 pr-4 text-xs text-[var(--text-secondary)]">
                        {entry.date}
                      </td>
                      <td className="tabular-nums whitespace-nowrap py-3 pr-4 text-xs text-[var(--text-secondary)]">
                        {formatTime12h(entry.startTime)} –{' '}
                        {formatTime12h(entry.endTime)}
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[var(--text-primary)]">
                          {entry.activityName}
                        </p>
                        {entry.notes && (
                          <p className="mt-0.5 max-w-md truncate text-xs text-[var(--text-secondary)]">
                            {entry.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${colors.bg} ${colors.text}`}
                        >
                          {entry.category}
                        </span>
                      </td>
                      <td className="tabular-nums whitespace-nowrap py-3 pr-4 text-right text-xs font-semibold text-[var(--text-primary)]">
                        {formatDuration(entry.durationMinutes)}
                      </td>
                      <td className="no-print whitespace-nowrap py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingEntry(entry)}
                            aria-label={`Edit ${entry.activityName}`}
                            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEntry(entry.id)}
                            aria-label={`Delete ${entry.activityName}`}
                            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <TimeEntryModal
        open={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        initialEntry={editingEntry}
      />
    </div>
  );
}
