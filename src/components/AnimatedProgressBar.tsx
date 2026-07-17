import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

interface AnimatedProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
}

export function AnimatedProgressBar({
  percentage,
  height = 6,
  color = colors.purple,
}: AnimatedProgressBarProps) {
  const widthValue = useSharedValue(0);

  useEffect(() => {
    widthValue.value = withTiming(percentage, {
      duration: 600,
    });
  }, [percentage, widthValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthValue.value}%`,
  }));

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, height },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});
