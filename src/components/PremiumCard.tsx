import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface PremiumCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  padding?: number;
}

export function PremiumCard({
  children,
  variant = 'primary',
  padding = spacing.lg,
  style,
  ...props
}: PremiumCardProps) {
  let backgroundColor = colors.surface;
  let borderColor = colors.border;
  let shadowColor = colors.purple;

  if (variant === 'secondary') {
    backgroundColor = colors.surfaceAlt;
    borderColor = colors.border;
  } else if (variant === 'success') {
    backgroundColor = colors.successDim;
    borderColor = colors.successBorder;
    shadowColor = colors.success;
  } else if (variant === 'error') {
    backgroundColor = colors.errorDim;
    borderColor = colors.errorBorder;
    shadowColor = colors.error;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          padding,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.lg,
    // Web shadow (CSS)
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
