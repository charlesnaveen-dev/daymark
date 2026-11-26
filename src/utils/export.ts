import { TimeEntry } from '../types';
import { formatDuration, formatHoursDecimal } from './time';

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTimeEntriesCsv(entries: TimeEntry[], filenamePrefix = 'daymark-entries') {
  const headers = [
    'Date',
    'Start Time',
    'End Time',
    'Duration (min)',
    'Duration',
    'Category',
    'Activity',
    'Notes',
  ];

  const sorted = [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const rows = sorted.map((e) =>
    [
      e.date,
      e.startTime,
      e.endTime,
      e.durationMinutes,
      formatDuration(e.durationMinutes),
      e.category,
      e.activityName,
      e.notes,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  downloadBlob(csv, `${filenamePrefix}.csv`, 'text/csv;charset=utf-8;');
}

export function exportMonthlySummaryCsv(
  entries: TimeEntry[],
  monthLabel: string
) {
  const byCategory = new Map<string, number>();
  for (const e of entries) {
    byCategory.set(
      e.category,
      (byCategory.get(e.category) ?? 0) + e.durationMinutes
    );
  }

  const headers = ['Month', 'Category', 'Total Minutes', 'Total Hours'];
  const rows = Array.from(byCategory.entries()).map(([cat, mins]) =>
    [monthLabel, cat, mins, formatHoursDecimal(mins)]
      .map(escapeCsvCell)
      .join(',')
  );

  const totalMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  rows.push(
    [monthLabel, 'ALL RECORDED', totalMinutes, formatHoursDecimal(totalMinutes)]
      .map(escapeCsvCell)
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  downloadBlob(
    csv,
    `daymark-monthly-summary-${monthLabel.replace(/\s+/g, '-').toLowerCase()}.csv`,
    'text/csv;charset=utf-8;'
  );
}
