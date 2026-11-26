import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ThemeMode } from '../types';

export function SettingsPage() {
  const { user, isCloudMode, signOut } = useAuth();
  const { preferences, updatePreferences } = useData();

  const [displayName, setDisplayName] = useState(preferences.displayName);
  const [theme, setTheme] = useState<ThemeMode>(preferences.theme);
  const [agencyHours, setAgencyHours] = useState(
    String(preferences.agencyTargetMinutes / 60)
  );
  const [musicHours, setMusicHours] = useState(
    String(preferences.musicTargetMinutes / 60)
  );
  const [streakThreshold, setStreakThreshold] = useState(
    String(preferences.streakThresholdPercent)
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(preferences.displayName);
    setTheme(preferences.theme);
    setAgencyHours(String(preferences.agencyTargetMinutes / 60));
    setMusicHours(String(preferences.musicTargetMinutes / 60));
    setStreakThreshold(String(preferences.streakThresholdPercent));
  }, [preferences]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const agencyMin = Math.max(
      30,
      Math.round((parseFloat(agencyHours) || 5) * 60)
    );
    const musicMin = Math.max(
      30,
      Math.round((parseFloat(musicHours) || 3.5) * 60)
    );
    const threshold = Math.min(
      100,
      Math.max(10, parseInt(streakThreshold, 10) || 80)
    );

    await updatePreferences({
      displayName: displayName.trim() || 'Creator',
      theme,
      agencyTargetMinutes: agencyMin,
      musicTargetMinutes: musicMin,
      streakThresholdPercent: threshold,
    });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Personalize your appearance, daily targets, and account session.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6"
      >
        {saved && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-2.5 text-sm font-medium text-[var(--success)]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences updated.</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-name"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Display Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Appearance
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'system', label: 'System', icon: Monitor },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      updatePreferences({ theme: opt.id });
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-soft-text)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="settings-agency"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Agency Daily Target (hours)
            </label>
            <input
              id="settings-agency"
              type="number"
              step="0.5"
              min="0.5"
              max="16"
              value={agencyHours}
              onChange={(e) => setAgencyHours(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="settings-music"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Music Daily Target (hours)
            </label>
            <input
              id="settings-music"
              type="number"
              step="0.5"
              min="0.5"
              max="16"
              value={musicHours}
              onChange={(e) => setMusicHours(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="settings-streak"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Streak Threshold (%)
            </label>
            <input
              id="settings-streak"
              type="number"
              min="10"
              max="100"
              value={streakThreshold}
              onChange={(e) => setStreakThreshold(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-primary-hover)]"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Account & Storage Mode */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Account &amp; Sync
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Signed in as <strong className="text-[var(--text-primary)]">{user?.email}</strong> ·{' '}
            {isCloudMode
              ? 'Connected to Supabase Cloud'
              : 'Local Development Mode (stored in browser localStorage)'}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-2 text-xs font-semibold text-[var(--danger)] transition-colors hover:opacity-90"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </section>
    </div>
  );
}
