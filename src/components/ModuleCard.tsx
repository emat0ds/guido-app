import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';

interface ModuleCardProps {
  title: string;
  color: string;
  progress: number;
  correctAnswers: number;
  totalQuestions: number;
  starsCount: number;
  isLocked?: boolean;
  onPress: () => void;
}

export function ModuleCard({
  title,
  color,
  progress,
  correctAnswers,
  totalQuestions,
  starsCount,
  isLocked = false,
  onPress,
}: ModuleCardProps) {
  const containerStyle: ViewStyle = {
    borderLeftColor: color,
    opacity: isLocked ? 0.5 : 1,
  };

  const progressPercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={isLocked ? 1 : 0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.starsContainer}>
          {[0, 1, 2].map((i) => (
            <Text
              key={i}
              style={[
                styles.star,
                { color: i < starsCount ? color : colors.textDisabled },
              ]}
            >
              ★
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progressPercentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={styles.subtitle}>
        {correctAnswers} / {totalQuestions} domande
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
  },
  subtitle: {
    fontSize: 12,
    color: '#555555',
  },
});
