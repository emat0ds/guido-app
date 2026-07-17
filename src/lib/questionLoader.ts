// Import the questions data directly
const questionsData = require('../../data/questions_with_explanations.json');

let cachedQuestions: any[] | null = null;

export async function loadQuestions(): Promise<any[]> {
  if (cachedQuestions !== null) {
    return cachedQuestions;
  }

  try {
    // Use the imported data directly
    cachedQuestions = questionsData || [];
    return cachedQuestions || [];
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export function clearQuestionCache(): void {
  cachedQuestions = null;
}
