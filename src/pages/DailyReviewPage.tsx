import React, { useEffect, useState } from 'react';
import { BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getTodayDateString } from '../utils/time';

export function DailyReviewPage() {
  const { reviews, saveReview } = useData();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const [accomplished, setAccomplished] = useState('');
  const [incomplete, setIncomplete] = useState('');
  const [distractions, setDistractions] = useState('');
  const [learned, setLearned] = useState('');
  const [improvements, setImprovements] = useState('');
  const [tomorrowPriority, setTomorrowPriority] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);

  const existing = reviews.find((r) => r.date === selectedDate);

  useEffect(() => {
    setAccomplished(existing?.accomplished ?? '');
    setIncomplete(existing?.incomplete ?? '');
    setDistractions(existing?.distractions ?? '');
    setLearned(existing?.learned ?? '');
    setImprovements(existing?.improvements ?? '');
    setTomorrowPriority(existing?.tomorrowPriority ?? '');
    setSavedNotice(false);
  }, [selectedDate, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await saveReview({
        id: existing?.id ?? crypto.randomUUID(),
        date: selectedDate,
        accomplished: accomplished.trim(),
        incomplete: incomplete.trim(),
        distractions: distractions.trim(),
        learned: learned.trim(),
        improvements: improvements.trim(),
        tomorrowPriority: tomorrowPriority.trim(),
        createdAt: existing?.createdAt,
      });
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Daily Review
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            11:00 PM reflection — review completed work and set tomorrow&apos;s
            priority.
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          aria-label="Review date"
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:col-span-2"
        >
          {savedNotice && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-2.5 text-sm font-medium text-[var(--success)]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Daily review saved for {selectedDate}.</span>
            </div>
          )}

          <ReviewField
            id="review-accomplished"
            label="What did I accomplish today?"
            value={accomplished}
            onChange={setAccomplished}
            placeholder="Key tasks shipped, music milestones, client progress..."
          />
          <ReviewField
            id="review-incomplete"
            label="What did I not complete?"
            value={incomplete}
            onChange={setIncomplete}
            placeholder="Carry-over items without self-judgment..."
          />
          <ReviewField
            id="review-distractions"
            label="What distracted me?"
            value={distractions}
            onChange={setDistractions}
            placeholder="Context switches, notifications, low energy..."
          />
          <ReviewField
            id="review-learned"
            label="What did I learn?"
            value={learned}
            onChange={setLearned}
            placeholder="Technical insight, production technique, or personal lesson..."
          />
          <ReviewField
            id="review-improvements"
            label="What should I improve tomorrow?"
            value={improvements}
            onChange={setImprovements}
            placeholder="One concrete adjustment for tomorrow..."
          />

          <div>
            <label
              htmlFor="review-priority"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Tomorrow&apos;s main priority
            </label>
            <input
              id="review-priority"
              type="text"
              value={tomorrowPriority}
              onChange={(e) => setTomorrowPriority(e.target.value)}
              placeholder="The single most important outcome tomorrow"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Daily Review'}
            </button>
          </div>
        </form>

        {/* Previous Reviews */}
        <section className="h-fit rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Previous Reviews
            </h2>
          </div>

          {sortedReviews.length === 0 ? (
            <p className="rounded-xl bg-[var(--bg-primary)] px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
              No reviews saved yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {sortedReviews.map((rev) => (
                <li key={rev.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(rev.date)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      rev.date === selectedDate
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)]/40'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <p className="tabular-nums text-xs font-semibold text-[var(--text-primary)]">
                      {rev.date}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {rev.tomorrowPriority ||
                        rev.accomplished ||
                        'Saved reflection'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function ReviewField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
      />
    </div>
  );
}
