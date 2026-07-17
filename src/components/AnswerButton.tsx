import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, spacing, radius } from '@/constants/theme';

interface AnswerButtonProps {
  label: string;
  text?: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  onPress: () => void;
  containerStyle?: ViewStyle;
}

export function AnswerButton({
  label,
  text,
  isSelected,
  isCorrect,
  isWrong,
  disabled = false,
  onPress,
  containerStyle,
}: AnswerButtonProps) {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    if (isCorrect) {
      scaleValue.value = withSpring(1.02, { damping: 10, mass: 1 });
    } else if (isWrong) {
      scaleValue.value = withSpring(0.98, { damping: 10, mass: 1 });
    } else {
      scaleValue.value = withSpring(1, { damping: 10, mass: 1 });
    }
  }, [isSelected, isCorrect, isWrong]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  let backgroundColor = colors.surfaceAlt;
  let borderColor = colors.border;
  let textColor = colors.textSecondary;

  if (isCorrect) {
    backgroundColor = colors.successDim;
    borderColor = colors.success;
    textColor = colors.success;
  } else if (isWrong) {
    backgroundColor = colors.errorDim;
    borderColor = colors.error;
    textColor = colors.error;
  } else if (isSelected) {
    backgroundColor = colors.purpleDim;
    borderColor = colors.purple;
    textColor = colors.purpleLight;
  }

  const innerStyle: ViewStyle = { backgroundColor, borderColor };
  const labelStyle: TextStyle = { color: textColor };

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <TouchableOpacity
        style={[styles.container, innerStyle]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.label, labelStyle, !text && styles.labelCentered]}>
          {label}
        </Text>
        {text && <Text style={[styles.text, { color: textColor }]}>{text}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  labelCentered: {
    textAlign: 'center',
    marginBottom: 0,
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
