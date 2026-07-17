import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';

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
  return (
    <View style={styles.container}>
      <Text style={[typography.question, styles.question]}>{question}</Text>
      <View style={styles.answersContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
