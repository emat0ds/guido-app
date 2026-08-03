import { useState, useCallback, useEffect } from 'react';
import { getDailyGoal, markDailyGoalCelebrated } from '@/lib/storage';

export const DAILY_GOAL_TARGET = 10;

export function useDailyGoal(refreshKey?: number) {
  const [count, setCount] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  const load = useCallback(async () => {
    const data = await getDailyGoal();
    setCount(data.count);
    setCelebrated(data.celebrated);
  }, []);

  useEffect(() => {
    load();
  }, [refreshKey]);

  const markCelebrated = useCallback(async () => {
    await markDailyGoalCelebrated();
    setCelebrated(true);
  }, []);

  return {
    count,
    goal: DAILY_GOAL_TARGET,
    completed: count >= DAILY_GOAL_TARGET,
    celebrated,
    setCount,
    markCelebrated,
    load,
  };
}
