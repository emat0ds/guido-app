import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';

interface TheoryCardProps {
  title: string;
  content: string;
}

export function TheoryCard({ title, content }: TheoryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.h2, styles.title]}>{title}</Text>
      <Text style={[typography.body, styles.content]}>{content}</Text>
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
  title: {
    marginBottom: spacing.md,
  },
  content: {
    lineHeight: 24,
  },
});
