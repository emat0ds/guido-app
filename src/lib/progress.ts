export interface QuestionState {
  id: number;
  timesCorrect: number;
  timesWrong: number;
  lastSeen: number;
  nextReview: number;
  mastered: boolean;
}

export interface UserProgress {
  macroId: string;
  totalQuestions: number;
  correctAnswers: number;
  masteredCount: number;
  lastUpdated: number;
}

export function calculateNextReview(state: QuestionState, isCorrect: boolean): number {
  const now = Date.now();

  if (!isCorrect) {
    // Wrong answer: review again tomorrow
    return now + 24 * 60 * 60 * 1000;
  }

  const newTimesCorrect = state.timesCorrect + 1;

  if (newTimesCorrect === 1) {
    // First correct: review in 1 day
    return now + 24 * 60 * 60 * 1000;
  }

  if (newTimesCorrect === 2) {
    // Second correct: review in 3 days
    return now + 3 * 24 * 60 * 60 * 1000;
  }

  // Third+ correct: mastered, no more reviews
  return Infinity;
}

export function updateQuestionState(
  state: QuestionState,
  isCorrect: boolean
): QuestionState {
  const newState: QuestionState = {
    ...state,
    lastSeen: Date.now(),
  };

  if (isCorrect) {
    newState.timesCorrect = state.timesCorrect + 1;
    newState.nextReview = calculateNextReview(newState, true);

    if (newState.timesCorrect >= 3) {
      newState.mastered = true;
    }
  } else {
    newState.timesWrong = state.timesWrong + 1;
    newState.nextReview = calculateNextReview(newState, false);
  }

  return newState;
}

export function isDueForReview(state: QuestionState): boolean {
  return state.nextReview <= Date.now() && !state.mastered;
}

export function getAccuracyRate(state: QuestionState): number {
  const total = state.timesCorrect + state.timesWrong;
  if (total === 0) return 0;
  return (state.timesCorrect / total) * 100;
}
