import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionState, UserProgress } from './progress';

const STORAGE_KEYS = {
  USER_NAME: 'user_name',
  TOTAL_STREAK: 'total_streak',
  LAST_STUDY_DATE: 'last_study_date',
  STUDY_DAYS_COUNT: 'study_days_count',
  STUDY_DATES: 'study_dates',
  MACRO_PROGRESS: 'macro_progress_',
  QUESTION_STATES: 'question_states_',
  MASTERED_QUESTIONS: 'mastered_questions',
  UNLOCKED_BADGES: 'unlocked_badges',
  CONSECUTIVE_CORRECT: 'consecutive_correct',
  DAILY_GOAL_DATE: 'daily_goal_date',
  DAILY_GOAL_COUNT: 'daily_goal_count',
  DAILY_GOAL_CELEBRATED: 'daily_goal_celebrated',
};

export async function saveUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}

export async function getUserName(): Promise<string> {
  const name = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
  return name || '';
}

export async function saveMacroProgress(
  macroId: string,
  progress: UserProgress
): Promise<void> {
  const key = STORAGE_KEYS.MACRO_PROGRESS + macroId;
  await AsyncStorage.setItem(key, JSON.stringify(progress));
}

export async function getMacroProgress(macroId: string): Promise<UserProgress | null> {
  const key = STORAGE_KEYS.MACRO_PROGRESS + macroId;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export async function saveQuestionState(
  macroId: string,
  questionId: number,
  state: QuestionState
): Promise<void> {
  const key = STORAGE_KEYS.QUESTION_STATES + macroId;
  const existingData = await AsyncStorage.getItem(key);
  const states = existingData ? JSON.parse(existingData) : {};
  states[questionId] = state;
  await AsyncStorage.setItem(key, JSON.stringify(states));
  console.log('Salvato', questionId, '| corrette:', state.timesCorrect, '| sbagliate:', state.timesWrong, '| chiave:', key);
}

export async function getQuestionStates(
  macroId: string
): Promise<Record<number, QuestionState>> {
  const key = STORAGE_KEYS.QUESTION_STATES + macroId;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : {};
}

export async function getQuestionState(
  macroId: string,
  questionId: number
): Promise<QuestionState | null> {
  const states = await getQuestionStates(macroId);
  return states[questionId] || null;
}

export async function incrementStreak(): Promise<number> {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE);

  let streak = await getCurrentStreak();

  if (lastDate === today) {
    return streak;
  }

  const lastDateObj = lastDate ? new Date(lastDate) : null;
  const todayObj = new Date(today);

  if (lastDateObj) {
    const diffTime = todayObj.getTime() - lastDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  const rawDays = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_DAYS_COUNT);
  const studyDays = rawDays ? parseInt(rawDays, 10) : 0;
  await AsyncStorage.setItem(STORAGE_KEYS.STUDY_DAYS_COUNT, (studyDays + 1).toString());

  await AsyncStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today);
  await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_STREAK, streak.toString());

  return streak;
}

export async function getCurrentStreak(): Promise<number> {
  const streak = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_STREAK);
  return streak ? parseInt(streak, 10) : 0;
}

export async function hasStudiedToday(): Promise<boolean> {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE);
  return lastDate === today;
}

export async function recordStudyDate(): Promise<void> {
  const today = new Date().toDateString();
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_DATES);
  const dates: string[] = raw ? JSON.parse(raw) : [];
  if (dates.includes(today)) return;
  dates.push(today);
  await AsyncStorage.setItem(STORAGE_KEYS.STUDY_DATES, JSON.stringify(dates));
}

export async function getTotalStudyDays(): Promise<number> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_DATES);
  return raw ? JSON.parse(raw).length : 0;
}

export async function hasStudiedYesterday(): Promise<boolean> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_DATES);
  const dates: string[] = raw ? JSON.parse(raw) : [];
  return dates.includes(yesterdayStr);
}

export async function addMasteredQuestion(questionId: number): Promise<void> {
  const mastered = await AsyncStorage.getItem(STORAGE_KEYS.MASTERED_QUESTIONS);
  const list = mastered ? JSON.parse(mastered) : [];

  if (!list.includes(questionId)) {
    list.push(questionId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.MASTERED_QUESTIONS,
      JSON.stringify(list)
    );
  }
}

export async function getMasteredCount(): Promise<number> {
  const mastered = await AsyncStorage.getItem(STORAGE_KEYS.MASTERED_QUESTIONS);
  return mastered ? JSON.parse(mastered).length : 0;
}

export async function saveExamSession(session: {
  questions: any[];
  answers: (boolean | null)[];
  startedAt: number;
  finishedAt?: number;
}): Promise<void> {
  await AsyncStorage.setItem('current_exam_session', JSON.stringify(session));
}

export async function getExamSession(): Promise<{
  questions: any[];
  answers: (boolean | null)[];
  startedAt: number;
  finishedAt?: number;
} | null> {
  const val = await AsyncStorage.getItem('current_exam_session');
  return val ? JSON.parse(val) : null;
}

export async function getUnlockedBadges(): Promise<string[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES);
  return data ? JSON.parse(data) : [];
}

// Returns true if the badge was newly unlocked (i.e. wasn't already in the list).
export async function unlockBadge(id: string): Promise<boolean> {
  const current = await getUnlockedBadges();
  if (current.includes(id)) return false;
  await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify([...current, id]));
  return true;
}

// Increments or resets the consecutive correct counter.
// Returns the new count.
export async function updateConsecutiveCorrect(isCorrect: boolean): Promise<number> {
  if (!isCorrect) {
    await AsyncStorage.setItem(STORAGE_KEYS.CONSECUTIVE_CORRECT, '0');
    return 0;
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONSECUTIVE_CORRECT);
  const current = raw ? parseInt(raw, 10) : 0;
  const next = current + 1;
  await AsyncStorage.setItem(STORAGE_KEYS.CONSECUTIVE_CORRECT, next.toString());
  return next;
}

export interface DailyGoalData {
  count: number;
  celebrated: boolean;
}

export async function getDailyGoal(): Promise<DailyGoalData> {
  const today = new Date().toDateString();
  const storedDate = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_DATE);

  if (storedDate !== today) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.DAILY_GOAL_DATE, today],
      [STORAGE_KEYS.DAILY_GOAL_COUNT, '0'],
      [STORAGE_KEYS.DAILY_GOAL_CELEBRATED, 'false'],
    ]);
    return { count: 0, celebrated: false };
  }

  const countStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_COUNT);
  const celebStr = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_CELEBRATED);
  return {
    count: countStr ? parseInt(countStr, 10) : 0,
    celebrated: celebStr === 'true',
  };
}

// Returns the new count after incrementing (resets if a new day).
export async function incrementDailyGoal(): Promise<number> {
  const today = new Date().toDateString();
  const storedDate = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_DATE);

  let count = 0;
  if (storedDate === today) {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL_COUNT);
    count = raw ? parseInt(raw, 10) : 0;
  } else {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_DATE, today);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_CELEBRATED, 'false');
  }

  count += 1;
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_COUNT, count.toString());
  return count;
}

export async function markDailyGoalCelebrated(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL_CELEBRATED, 'true');
}

// ─── Stats: statistiche dettagliate per macro ─────────────────────────────────

export interface MacroDetailStats {
  macroId: string;
  answeredCount: number;  // domande viste almeno una volta
  correctCount: number;   // domande risposte correttamente almeno una volta
  masteredCount: number;  // domande dominate (timesCorrect >= 3)
  accuracy: number;       // % corrette su totale tentativi (0-100)
  hardestQuestions: Array<{ id: number; timesWrong: number; timesCorrect: number }>;
}

export async function getMacroDetailStats(macroId: string): Promise<MacroDetailStats> {
  const states = await getQuestionStates(macroId);
  const stateValues = Object.values(states) as QuestionState[];

  const answeredCount = stateValues.length;
  const correctCount = stateValues.filter((s) => s.timesCorrect > 0).length;
  const masteredCount = stateValues.filter((s) => s.mastered).length;

  const totalAttempts = stateValues.reduce((sum, s) => sum + s.timesCorrect + s.timesWrong, 0);
  const totalCorrect = stateValues.reduce((sum, s) => sum + s.timesCorrect, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const hardestQuestions = stateValues
    .filter((s) => s.timesWrong > 0)
    .map((s) => ({ id: s.id, timesWrong: s.timesWrong, timesCorrect: s.timesCorrect }))
    .sort((a, b) => b.timesWrong - a.timesWrong)
    .slice(0, 5);

  return { macroId, answeredCount, correctCount, masteredCount, accuracy, hardestQuestions };
}

// ─── Stats: ricalcolo dai QuestionState (fonte di verità) ────────────────────

/**
 * Ricalcola MacroProgress contando domande uniche, non risposte cumulative.
 * - correctAnswers = domande con almeno 1 risposta corretta
 * - wrongAnswers   = domande con almeno 1 risposta sbagliata
 * - masteredCount  = domande dominate (timesCorrect >= 3)
 */
export async function recalculateMacroProgress(
  macroId: string,
  totalQuestions: number
): Promise<UserProgress> {
  const states = await getQuestionStates(macroId);
  const stateValues = Object.values(states) as QuestionState[];

  const correctAnswers = stateValues.filter((s) => s.timesCorrect > 0).length;
  const wrongAnswers = stateValues.filter((s) => s.timesWrong > 0).length;
  const masteredCount = stateValues.filter((s) => s.mastered).length;

  const progress: UserProgress = {
    macroId,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    masteredCount,
    lastUpdated: Date.now(),
  };

  await saveMacroProgress(macroId, progress);
  return progress;
}

/**
 * Migration one-time: riporta i MacroProgress al valore corretto
 * leggendo i QuestionState reali. Sicura da eseguire più volte (idempotente).
 */
const MIGRATION_STATS_V1 = 'stats_migration_v1';

export async function runStatsMigrationIfNeeded(
  macros: Array<{ id: string; totalQuestions: number }>
): Promise<void> {
  const done = await AsyncStorage.getItem(MIGRATION_STATS_V1);
  if (done === 'true') return;
  await Promise.all(macros.map((m) => recalculateMacroProgress(m.id, m.totalQuestions)));
  await AsyncStorage.setItem(MIGRATION_STATS_V1, 'true');
  console.log('[Migration] stats_migration_v1 completata');
}

// ─────────────────────────────────────────────────────────────────────────────

export async function clearAllProgress(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const prefixes = Object.values(STORAGE_KEYS);
  const guidoKeys = keys.filter((key) =>
    prefixes.some((prefix) => key.startsWith(prefix) || key === prefix.replace(/[_]+$/, ''))
  );
  await Promise.all(guidoKeys.map((key) => AsyncStorage.removeItem(key)));
}
