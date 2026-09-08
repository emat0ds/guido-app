import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, radius, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface QuestionCardProps {
  question: string;
  type: 'boolean' | 'multiple';
  children: React.ReactNode;
}

export function QuestionCard({
  question,
  type,
  children,
}: QuestionCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[typography.question, styles.question, { color: colors.textPrimary }]}>{question}</Text>
      <View style={styles.answersContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  question: {
    marginBottom: spacing.lg,
  },
  answersContainer: {
    gap: spacing.md,
  },
});
