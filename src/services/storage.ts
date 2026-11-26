import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { DailyReview, TimeEntry, UserPreferences } from '../types';

const KEYS = {
  entries: 'daymark_entries_v1',
  reviews: 'daymark_reviews_v1',
  prefs: 'daymark_prefs_v1',
  localSession: 'daymark_local_session_v1',
};

export interface LocalUser {
  id: string;
  email: string;
  displayName: string;
}

export function getDefaultPreferences(userId: string, displayName = 'Creator'): UserPreferences {
  return {
    userId,
    displayName,
    theme: 'system',
    agencyTargetMinutes: 300, // 5 hours
    musicTargetMinutes: 210, // 3 hours 30 minutes
    streakThresholdPercent: 80,
    dailyReviewTime: '23:00',
    updatedAt: new Date().toISOString(),
  };
}

// Local session helpers (Development mode only)
export function getLocalSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(KEYS.localSession);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(user: LocalUser | null) {
  if (!user) {
    localStorage.removeItem(KEYS.localSession);
  } else {
    localStorage.setItem(KEYS.localSession, JSON.stringify(user));
  }
}

function readLocalArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalArray<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------- TIME ENTRIES ----------
export async function fetchTimeEntries(userId: string): Promise<TimeEntry[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      durationMinutes: row.duration_minutes,
      category: row.category,
      activityName: row.activity_name,
      notes: row.notes ?? '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  return readLocalArray<TimeEntry>(KEYS.entries).filter((e) => e.userId === userId);
}

export async function upsertTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: entry.id,
      user_id: entry.userId,
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
      duration_minutes: entry.durationMinutes,
      category: entry.category,
      activity_name: entry.activityName,
      notes: entry.notes,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('time_entries')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      startTime: data.start_time.slice(0, 5),
      endTime: data.end_time.slice(0, 5),
      durationMinutes: data.duration_minutes,
      category: data.category,
      activityName: data.activity_name,
      notes: data.notes ?? '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const all = readLocalArray<TimeEntry>(KEYS.entries);
  const idx = all.findIndex((e) => e.id === entry.id);
  const next = { ...entry, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  writeLocalArray(KEYS.entries, all);
  return next;
}

export async function removeTimeEntry(id: string, userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const all = readLocalArray<TimeEntry>(KEYS.entries);
  writeLocalArray(
    KEYS.entries,
    all.filter((e) => !(e.id === id && e.userId === userId))
  );
}

// ---------- DAILY REVIEWS ----------
export async function fetchDailyReviews(userId: string): Promise<DailyReview[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('daily_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      accomplished: row.accomplished ?? '',
      incomplete: row.incomplete ?? '',
      distractions: row.distractions ?? '',
      learned: row.learned ?? '',
      improvements: row.improvements ?? '',
      tomorrowPriority: row.tomorrow_priority ?? '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  return readLocalArray<DailyReview>(KEYS.reviews).filter((r) => r.userId === userId);
}

export async function upsertDailyReview(review: DailyReview): Promise<DailyReview> {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: review.id,
      user_id: review.userId,
      date: review.date,
      accomplished: review.accomplished,
      incomplete: review.incomplete,
      distractions: review.distractions,
      learned: review.learned,
      improvements: review.improvements,
      tomorrow_priority: review.tomorrowPriority,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('daily_reviews')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      accomplished: data.accomplished ?? '',
      incomplete: data.incomplete ?? '',
      distractions: data.distractions ?? '',
      learned: data.learned ?? '',
      improvements: data.improvements ?? '',
      tomorrowPriority: data.tomorrow_priority ?? '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const all = readLocalArray<DailyReview>(KEYS.reviews);
  const idx = all.findIndex((r) => r.userId === review.userId && r.date === review.date);
  const next = { ...review, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  writeLocalArray(KEYS.reviews, all);
  return next;
}

// ---------- PREFERENCES ----------
export async function fetchUserPreferences(
  userId: string,
  fallbackName = 'Creator'
): Promise<UserPreferences> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      const defaults = getDefaultPreferences(userId, fallbackName);
      await saveUserPreferences(defaults);
      return defaults;
    }
    return {
      userId: data.user_id,
      displayName: data.display_name ?? fallbackName,
      theme: data.theme ?? 'system',
      agencyTargetMinutes: data.agency_target_minutes ?? 300,
      musicTargetMinutes: data.music_target_minutes ?? 210,
      streakThresholdPercent: data.streak_threshold_percent ?? 80,
      dailyReviewTime: data.daily_review_time ?? '23:00',
      updatedAt: data.updated_at,
    };
  }

  const all = readLocalArray<UserPreferences>(KEYS.prefs);
  const found = all.find((p) => p.userId === userId);
  if (found) return found;
  const defaults = getDefaultPreferences(userId, fallbackName);
  all.push(defaults);
  writeLocalArray(KEYS.prefs, all);
  return defaults;
}

export async function saveUserPreferences(prefs: UserPreferences): Promise<UserPreferences> {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      user_id: prefs.userId,
      display_name: prefs.displayName,
      theme: prefs.theme,
      agency_target_minutes: prefs.agencyTargetMinutes,
      music_target_minutes: prefs.musicTargetMinutes,
      streak_threshold_percent: prefs.streakThresholdPercent,
      daily_review_time: prefs.dailyReviewTime,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return {
      userId: data.user_id,
      displayName: data.display_name,
      theme: data.theme,
      agencyTargetMinutes: data.agency_target_minutes,
      musicTargetMinutes: data.music_target_minutes,
      streakThresholdPercent: data.streak_threshold_percent,
      dailyReviewTime: data.daily_review_time,
      updatedAt: data.updated_at,
    };
  }

  const all = readLocalArray<UserPreferences>(KEYS.prefs);
  const idx = all.findIndex((p) => p.userId === prefs.userId);
  const next = { ...prefs, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = next;
  } else {
    all.push(next);
  }
  writeLocalArray(KEYS.prefs, all);
  return next;
}
