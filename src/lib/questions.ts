import { loadQuestions } from './questionLoader';
import { MACROS } from '@/constants/macros';

export interface Question {
  id: number;
  question: string;
  answer: boolean;
  macro_area: string;
  category: string;
  explanation?: string;
  imagePath?: string;
}

let questionsCache: Question[] | null = null;

export async function getAllQuestions(): Promise<Question[]> {
  if (questionsCache) {
    return questionsCache;
  }

  const rawData = await loadQuestions();
  questionsCache = rawData.map((q: any) => ({
    id: q.id || Math.random(),
    question: q.question || '',
    answer: q.answer === true,
    macro_area: q.macro_area || '',
    category: q.category || '',
    explanation: q.explanation || '',
    imagePath: q.img || q.imagePath,
  }));

  return questionsCache;
}

export async function getQuestionsByMacroId(macroId: string): Promise<Question[]> {
  const allQuestions = await getAllQuestions();
  const macro = MACROS.find((m) => m.id === macroId);
  if (!macro) return [];

  return allQuestions.filter((q: any) =>
    macro.categories.some(
      (cat) =>
        q.category &&
        q.category.toLowerCase().replace(/\s+/g, '-') ===
          cat.toLowerCase()
    )
  );
}

export function getRandomQuestions(
  questions: Question[],
  count: number
): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questions.length));
}

export async function getQuestionById(id: number): Promise<Question | undefined> {
  const allQuestions = await getAllQuestions();
  return allQuestions.find((q: any) => q.id === id);
}

export async function getQuestionsByCategory(category: string): Promise<Question[]> {
  const allQuestions = await getAllQuestions();
  return allQuestions
    .filter(
      (q: any) =>
        q.category &&
        q.category.toLowerCase().replace(/\s+/g, '-') ===
          category.toLowerCase()
    )
    .map((q: any) => ({
      id: q.id || Math.random(),
      question: q.question || '',
      answer: q.answer === true,
      macro_area: q.macro || q.macro_area || '',
      category: q.category || '',
      explanation: q.explanation || '',
      imagePath: q.img || q.imagePath,
    }));
}
