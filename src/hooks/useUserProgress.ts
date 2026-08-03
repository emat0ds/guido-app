import { useState, useEffect, useCallback } from 'react';
import { MACROS } from '@/constants/macros';
import {
  getMacroProgress,
  saveMacroProgress,
  getCurrentStreak,
  incrementStreak,
  getMasteredCount,
  getTotalStudyDays,
  getUserName,
} from '@/lib/storage';
import { UserProgress } from '@/lib/progress';

export interface GlobalProgress {
  userName: string;
  totalProgress: number;
  currentStreak: number;
  totalStudyDays: number;
  masteredCount: number;
  wrongCount: number;
  macroProgress: Record<string, UserProgress>;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<GlobalProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    try {
      const userName = await getUserName();
      const streak = await getCurrentStreak();
      const days = await getTotalStudyDays();
      const mastered = await getMasteredCount();

      const macroProgressMap: Record<string, UserProgress> = {};
      let totalCorrect = 0;
      let totalWrong = 0;

      for (const macro of MACROS) {
        const macroData = await getMacroProgress(macro.id);

        if (macroData) {
          macroProgressMap[macro.id] = macroData;
          totalCorrect += macroData.correctAnswers;
          totalWrong += macroData.wrongAnswers || 0;
        } else {
          macroProgressMap[macro.id] = {
            macroId: macro.id,
            totalQuestions: macro.totalQuestions,
            correctAnswers: 0,
            wrongAnswers: 0,
            masteredCount: 0,
            lastUpdated: 0,
          };
        }
      }

      const totalAnswered = totalCorrect + totalWrong;
      const totalQuestions = MACROS.reduce((sum, m) => sum + m.totalQuestions, 0);
      const totalProgress =
        totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

      setProgress({
        userName,
        totalProgress,
        currentStreak: streak,
        totalStudyDays: days,
        masteredCount: mastered,
        wrongCount: totalWrong,
        macroProgress: macroProgressMap,
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateMacroProgress = useCallback(
    async (macroId: string, update: Partial<UserProgress>) => {
      if (!progress) return;

      const current = progress.macroProgress[macroId] || {
        macroId,
        totalQuestions: MACROS.find((m) => m.id === macroId)?.totalQuestions || 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        masteredCount: 0,
        lastUpdated: 0,
      };

      const updated: UserProgress = {
        ...current,
        ...update,
        lastUpdated: Date.now(),
      };

      await saveMacroProgress(macroId, updated);

      setProgress((prev) => {
        if (!prev) return null;
        const merged = { ...prev.macroProgress, [macroId]: updated };
        const correct = Object.values(merged).reduce((sum, m) => sum + m.correctAnswers, 0);
        const wrong = Object.values(merged).reduce((sum, m) => sum + (m.wrongAnswers || 0), 0);
        const answered = correct + wrong;
        const totalQ = MACROS.reduce((sum, m) => sum + m.totalQuestions, 0);
        return {
          ...prev,
          macroProgress: merged,
          totalProgress: totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0,
          wrongCount: wrong,
        };
      });
    },
    [progress]
  );

  const recordStudySession = useCallback(async () => {
    const newStreak = await incrementStreak();
    setProgress((prev) =>
      prev ? { ...prev, currentStreak: newStreak } : null
    );
  }, []);

  return {
    progress,
    loading,
    loadProgress,
    updateMacroProgress,
    recordStudySession,
  };
}
