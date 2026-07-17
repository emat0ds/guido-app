import { useState, useEffect, useCallback } from 'react';
import { MACROS } from '@/constants/macros';
import {
  getQuestionStates,
} from '@/lib/storage';
import { isDueForReview, QuestionState } from '@/lib/progress';
import { Question } from '@/lib/questions';
import { getAllQuestions } from '@/lib/questions';

export interface ReviewItem {
  question: Question;
  state: QuestionState;
  daysUntilReview: number;
}

export function useReviewQueue() {
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDue, setTotalDue] = useState(0);

  const loadReviewQueue = useCallback(async () => {
    try {
      const allQuestions = await getAllQuestions();
      const queueItems: ReviewItem[] = [];

      for (const macro of MACROS) {
        const states = await getQuestionStates(macro.id);

        for (const [questionId, state] of Object.entries(states)) {
          if (isDueForReview(state)) {
            const question = allQuestions.find(
              (q) => q.id === parseInt(questionId, 10)
            );

            if (question) {
              const daysUntilReview = Math.ceil(
                (state.nextReview - Date.now()) / (1000 * 60 * 60 * 24)
              );

              queueItems.push({
                question,
                state,
                daysUntilReview: Math.max(0, daysUntilReview),
              });
            }
          }
        }
      }

      // Sort by daysUntilReview (most urgent first)
      queueItems.sort((a, b) => a.daysUntilReview - b.daysUntilReview);

      setReviewQueue(queueItems);
      setTotalDue(queueItems.length);
    } catch (error) {
      console.error('Error loading review queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  const refreshQueue = useCallback(async () => {
    setLoading(true);
    await loadReviewQueue();
  }, [loadReviewQueue]);

  return {
    reviewQueue,
    loading,
    totalDue,
    refreshQueue,
  };
}
