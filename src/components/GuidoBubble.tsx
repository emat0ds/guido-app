import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface GuidoBubbleProps {
  text: string;
  variant?: 'default' | 'success' | 'error';
}

export function GuidoBubble({ text, variant = 'default' }: GuidoBubbleProps) {
  const { colors } = useTheme();
  const opacityValue = useSharedValue(0);
  const translateYValue = useSharedValue(10);

  useEffect(() => {
    opacityValue.value = withTiming(1, { duration: 400 });
    translateYValue.value = withTiming(0, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  let bgColor = colors.surface;
  let accentColor = colors.purpleLight;

  if (variant === 'success') {
    bgColor = colors.successDim;
    accentColor = colors.success;
  } else if (variant === 'error') {
    bgColor = colors.errorDim;
    accentColor = colors.error;
  }

  return (
    <Animated.View style={[animatedStyle, styles.wrapper]}>
      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: colors.purpleDim }]}>
          <Text style={styles.letter}>G</Text>
        </View>
        <View style={[styles.bubble, { backgroundColor: bgColor }]}>
          <Text style={[styles.text, { color: colors.textMuted }]}>{text}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3d2fff33',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  letter: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7c6fff',
  },
  bubble: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 12,
    lineHeight: 20,
  },
});
