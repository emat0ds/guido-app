/**
 * Analytics module — local-first, server-ready.
 *
 * Today: all data stays on device (AsyncStorage).
 * Future: call exportPendingEvents() + markEventsAsSynced() to batch-upload
 * anonymized data to any backend without touching the rest of the codebase.
 *
 * No PII is ever stored. The device_id is a random UUID generated once.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyStats {
  questionsAnswered: number;
  correctCount: number;
  minutesStudied: number; // accumulated across all sessions that day
}

export interface CategoryStats {
  totalAnswered: number;
  correctCount: number;
}

export interface QuestionStats {
  timesAnswered: number;
  timesCorrect: number;
}

interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
  synced: boolean;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  DEVICE_ID: 'analytics_device_id',
  DAILY_STATS: 'analytics_daily_stats',       // Record<dateStr, DailyStats>
  CATEGORY_STATS: 'analytics_category_stats', // Record<macroId, CategoryStats>
  QUESTION_STATS: 'analytics_question_stats', // Record<questionId, QuestionStats>
  EVENTS: 'analytics_events',                 // AnalyticsEvent[] (rolling 30-day buffer)
};

// ─── Device ID ────────────────────────────────────────────────────────────────

export async function getDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(KEYS.DEVICE_ID);
  if (stored) return stored;
  const id = generateId();
  await AsyncStorage.setItem(KEYS.DEVICE_ID, id);
  return id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toDateString();
}

async function getDailyStatsMap(): Promise<Record<string, DailyStats>> {
  const raw = await AsyncStorage.getItem(KEYS.DAILY_STATS);
  return raw ? JSON.parse(raw) : {};
}

async function saveDailyStatsMap(map: Record<string, DailyStats>): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_STATS, JSON.stringify(map));
}

async function getCategoryStatsMap(): Promise<Record<string, CategoryStats>> {
  const raw = await AsyncStorage.getItem(KEYS.CATEGORY_STATS);
  return raw ? JSON.parse(raw) : {};
}

async function getQuestionStatsMap(): Promise<Record<string, QuestionStats>> {
  const raw = await AsyncStorage.getItem(KEYS.QUESTION_STATS);
  return raw ? JSON.parse(raw) : {};
}

async function appendEvent(type: string, data: Record<string, unknown>): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];

  // Rolling 30-day buffer: drop events older than 30 days
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const fresh = events.filter((e) => e.timestamp > cutoff);

  fresh.push({
    id: generateId(),
    type,
    timestamp: Date.now(),
    data,
    synced: false,
  });

  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(fresh));
}

// ─── Public tracking API ──────────────────────────────────────────────────────

/**
 * Call when a lesson session ends.
 * durationMs: milliseconds from first answer to last answer (or navigation away).
 */
export async function trackSessionEnd(
  macroId: string,
  questionsAnswered: number,
  correctCount: number,
  durationMs: number
): Promise<void> {
  const minutesStudied = durationMs / 60_000;

  // Daily stats
  const daily = await getDailyStatsMap();
  const today = todayStr();
  const existing = daily[today] ?? { questionsAnswered: 0, correctCount: 0, minutesStudied: 0 };
  daily[today] = {
    questionsAnswered: existing.questionsAnswered + questionsAnswered,
    correctCount: existing.correctCount + correctCount,
    minutesStudied: parseFloat((existing.minutesStudied + minutesStudied).toFixed(2)),
  };
  await saveDailyStatsMap(daily);

  // Category stats
  const catMap = await getCategoryStatsMap();
  const cat = catMap[macroId] ?? { totalAnswered: 0, correctCount: 0 };
  catMap[macroId] = {
    totalAnswered: cat.totalAnswered + questionsAnswered,
    correctCount: cat.correctCount + correctCount,
  };
  await AsyncStorage.setItem(KEYS.CATEGORY_STATS, JSON.stringify(catMap));

  // Event
  await appendEvent('session_end', {
    macroId,
    questionsAnswered,
    correctCount,
    durationMs,
  });
}

/**
 * Call on every answered question.
 */
export async function trackQuestionAnswered(
  questionId: number,
  isCorrect: boolean
): Promise<void> {
  const map = await getQuestionStatsMap();
  const key = String(questionId);
  const existing = map[key] ?? { timesAnswered: 0, timesCorrect: 0 };
  map[key] = {
    timesAnswered: existing.timesAnswered + 1,
    timesCorrect: existing.timesCorrect + (isCorrect ? 1 : 0),
  };
  await AsyncStorage.setItem(KEYS.QUESTION_STATS, JSON.stringify(map));
}

/**
 * Call when an exam simulation ends.
 */
export async function trackExamCompleted(score: number, passed: boolean): Promise<void> {
  await appendEvent('exam_completed', { score, passed });
}

/**
 * Call on app open (from _layout.tsx).
 */
export async function trackAppOpen(): Promise<void> {
  await appendEvent('app_open', {});
}

// ─── Data read API (for notifications, UI, future dashboard) ──────────────────

export async function getDailyStats(date?: string): Promise<DailyStats> {
  const map = await getDailyStatsMap();
  return map[date ?? todayStr()] ?? { questionsAnswered: 0, correctCount: 0, minutesStudied: 0 };
}

/**
 * Returns stats for the last N days (including today), keyed by dateString.
 * Missing days are returned with zeroes.
 */
export async function getRecentDailyStats(days: number): Promise<Record<string, DailyStats>> {
  const map = await getDailyStatsMap();
  const result: Record<string, DailyStats> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    result[key] = map[key] ?? { questionsAnswered: 0, correctCount: 0, minutesStudied: 0 };
  }
  return result;
}

export async function getCategoryStats(macroId: string): Promise<CategoryStats> {
  const map = await getCategoryStatsMap();
  return map[macroId] ?? { totalAnswered: 0, correctCount: 0 };
}

/**
 * Returns the N questions with the lowest accuracy (most often wrong).
 * Useful for the "ripasso" feature and future recommendations.
 */
export async function getWeakestQuestions(limit = 10): Promise<Array<{ questionId: number; accuracy: number; timesAnswered: number }>> {
  const map = await getQuestionStatsMap();
  return Object.entries(map)
    .filter(([, s]) => s.timesAnswered >= 2) // only if answered at least twice
    .map(([id, s]) => ({
      questionId: parseInt(id, 10),
      accuracy: s.timesCorrect / s.timesAnswered,
      timesAnswered: s.timesAnswered,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

/**
 * Returns the last N exam simulation results (most recent first).
 */
export async function getRecentExamResults(limit = 5): Promise<Array<{ score: number; passed: boolean; timestamp: number }>> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
  return events
    .filter((e) => e.type === 'exam_completed')
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((e) => ({ score: e.data.score as number, passed: e.data.passed as boolean, timestamp: e.timestamp }));
}

// ─── Future server sync API ───────────────────────────────────────────────────

/**
 * Returns all unsynced events. Call this to batch-upload to your backend.
 * Attach getDeviceId() as the user identifier (anonymous).
 */
export async function exportPendingEvents(): Promise<AnalyticsEvent[]> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
  return events.filter((e) => !e.synced);
}

/**
 * Mark events as synced after a successful upload.
 */
export async function markEventsAsSynced(ids: string[]): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
  const updated = events.map((e) => (ids.includes(e.id) ? { ...e, synced: true } : e));
  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(updated));
}
