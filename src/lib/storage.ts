import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestionState, UserProgress } from './progress';

const STORAGE_KEYS = {
  USER_NAME: 'user_name',
  TOTAL_STREAK: 'total_streak',
  LAST_STUDY_DATE: 'last_study_date',
  MACRO_PROGRESS: 'macro_progress_',
  QUESTION_STATES: 'question_states_',
  MASTERED_QUESTIONS: 'mastered_questions',
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

  await AsyncStorage.setItem(STORAGE_KEYS.LAST_STUDY_DATE, today);
  await AsyncStorage.setItem(STORAGE_KEYS.TOTAL_STREAK, streak.toString());

  return streak;
}

export async function getCurrentStreak(): Promise<number> {
  const streak = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_STREAK);
  return streak ? parseInt(streak, 10) : 0;
}

export async function getTotalStudyDays(): Promise<number> {
  const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_STUDY_DATE);
  if (!lastDate) return 0;

  const startDate = new Date('2026-01-01');
  const endDate = new Date(lastDate);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(1, diffDays);
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

export async function clearAllProgress(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const prefixes = Object.values(STORAGE_KEYS);
  const guidoKeys = keys.filter((key) =>
    prefixes.some((prefix) => key.startsWith(prefix) || key === prefix.replace(/[_]+$/, ''))
  );
  await Promise.all(guidoKeys.map((key) => AsyncStorage.removeItem(key)));
}
