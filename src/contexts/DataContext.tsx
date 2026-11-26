import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchDailyReviews,
  fetchTimeEntries,
  fetchUserPreferences,
  getDefaultPreferences,
  removeTimeEntry,
  saveUserPreferences,
  upsertDailyReview,
  upsertTimeEntry,
} from '../services/storage';
import { DailyReview, ThemeMode, TimeEntry, UserPreferences } from '../types';
import { useAuth } from './AuthContext';

interface DataContextValue {
  entries: TimeEntry[];
  reviews: DailyReview[];
  preferences: UserPreferences;
  loading: boolean;
  addOrUpdateEntry: (
    entry: Omit<TimeEntry, 'userId' | 'createdAt' | 'updatedAt'> & {
      createdAt?: string;
    }
  ) => Promise<TimeEntry>;
  deleteEntry: (id: string) => Promise<void>;
  saveReview: (
    review: Omit<DailyReview, 'userId' | 'createdAt' | 'updatedAt'> & {
      createdAt?: string;
    }
  ) => Promise<DailyReview>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    getDefaultPreferences('guest')
  );
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setReviews([]);
      return;
    }
    setLoading(true);
    try {
      const [loadedEntries, loadedReviews, loadedPrefs] = await Promise.all([
        fetchTimeEntries(user.id),
        fetchDailyReviews(user.id),
        fetchUserPreferences(user.id, user.displayName),
      ]);
      setEntries(loadedEntries);
      setReviews(loadedReviews);
      setPreferences(loadedPrefs);
      applyThemeToDocument(loadedPrefs.theme);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    applyThemeToDocument(preferences.theme);
  }, [preferences.theme]);

  const addOrUpdateEntry = async (
    input: Omit<TimeEntry, 'userId' | 'createdAt' | 'updatedAt'> & {
      createdAt?: string;
    }
  ) => {
    if (!user) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const full: TimeEntry = {
      ...input,
      userId: user.id,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    };
    const saved = await upsertTimeEntry(full);
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === saved.id);
      if (exists) {
        return prev.map((e) => (e.id === saved.id ? saved : e));
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deleteEntry = async (id: string) => {
    if (!user) throw new Error('Not authenticated');
    await removeTimeEntry(id, user.id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const saveReview = async (
    input: Omit<DailyReview, 'userId' | 'createdAt' | 'updatedAt'> & {
      createdAt?: string;
    }
  ) => {
    if (!user) throw new Error('Not authenticated');
    const now = new Date().toISOString();
    const full: DailyReview = {
      ...input,
      userId: user.id,
      createdAt: input.createdAt ?? now,
      updatedAt: now,
    };
    const saved = await upsertDailyReview(full);
    setReviews((prev) => {
      const idx = prev.findIndex((r) => r.date === saved.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const updatePreferences = async (patch: Partial<UserPreferences>) => {
    if (!user) throw new Error('Not authenticated');
    const next: UserPreferences = {
      ...preferences,
      ...patch,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };
    const saved = await saveUserPreferences(next);
    setPreferences(saved);
    applyThemeToDocument(saved.theme);
  };

  return (
    <DataContext.Provider
      value={{
        entries,
        reviews,
        preferences,
        loading,
        addOrUpdateEntry,
        deleteEntry,
        saveReview,
        updatePreferences,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
