import { getQuestionsByMacroId, getRandomQuestions, Question } from './questions';

export const EXAM_DURATION_SECONDS = 30 * 60;
export const EXAM_TOTAL_QUESTIONS = 40;
export const EXAM_MAX_ERRORS = 4;

export interface ExamSession {
  questions: Question[];
  answers: (boolean | null)[];
  startedAt: number;
  finishedAt?: number;
}

const EXAM_DISTRIBUTION = [
  { macroIds: ['la-strada'], count: 10 },
  { macroIds: ['segnali-stradali', 'segnaletica-avanzata'], count: 12 },
  { macroIds: ['manovre'], count: 9 },
  { macroIds: ['il-veicolo'], count: 4 },
  { macroIds: ['documenti-responsabilita'], count: 3 },
  { macroIds: ['salute-ambiente'], count: 2 },
];

export async function buildExamSession(): Promise<Question[]> {
  const selected: Question[] = [];

  for (const group of EXAM_DISTRIBUTION) {
    const pool: Question[] = [];
    for (const macroId of group.macroIds) {
      const qs = await getQuestionsByMacroId(macroId);
      pool.push(...qs);
    }
    selected.push(...getRandomQuestions(pool, group.count));
  }

  return selected.sort(() => Math.random() - 0.5);
}

export function computeExamResult(session: ExamSession): {
  correct: number;
  errors: number;
  passed: boolean;
  unanswered: number;
} {
  let correct = 0;
  let unanswered = 0;

  for (let i = 0; i < session.questions.length; i++) {
    const q = session.questions[i];
    const a = session.answers[i];
    if (a === null || a === undefined) {
      unanswered++;
    } else if (a === q.answer) {
      correct++;
    }
  }

  const errors = session.questions.length - correct;
  return {
    correct,
    errors,
    passed: errors <= EXAM_MAX_ERRORS,
    unanswered,
  };
}
