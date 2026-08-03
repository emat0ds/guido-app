import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, radius } from '@/constants/theme';

interface DailyGoalCardProps {
  count: number;
  goal: number;
  completed: boolean;
  celebrated: boolean;
  onCelebrationDone: () => void;
}

export function DailyGoalCard({
  count,
  goal,
  completed,
  celebrated,
  onCelebrationDone,
}: DailyGoalCardProps) {
  const progress = Math.min(count / goal, 1);
  const barProgress = useSharedValue(0);
  const checkScale = useSharedValue(1);
  const checkOpacity = useSharedValue(0);

  // Animate bar width whenever count changes
  useEffect(() => {
    barProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, barProgress]);

  // Celebration: pulse the check 3 times, then call onCelebrationDone
  useEffect(() => {
    if (completed && !celebrated) {
      checkOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 220 }),
          withTiming(1, { duration: 220 })
        ),
        3,
        false,
        (finished) => {
          if (finished) runOnJS(onCelebrationDone)();
        }
      );
    } else if (completed) {
      checkOpacity.value = 1;
    }
  }, [completed, celebrated, checkScale, checkOpacity, onCelebrationDone]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const displayed = Math.min(count, goal);
  const remaining = goal - displayed;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Obiettivo del giorno</Text>
          {completed && (
            <Animated.Text style={[styles.checkMark, checkStyle]}>✓</Animated.Text>
          )}
        </View>
        <Text style={styles.counter}>
          {displayed} <Text style={styles.counterDim}>/ {goal}</Text>
        </Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: completed ? colors.success : colors.purple },
            barStyle,
          ]}
        />
      </View>

      <Text style={styles.subtitle}>
        {completed
          ? 'Ottimo lavoro! Obiettivo raggiunto 🎯'
          : `Ancora ${remaining} ${remaining === 1 ? 'domanda' : 'domande'} per chiudere la giornata`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  counter: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counterDim: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
  },
  barTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 18,
  },
});
