import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';

export function useAnimatedFade(shouldShow: boolean = true) {
  const opacity = useSharedValue(shouldShow ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(shouldShow ? 1 : 0, {
      duration: 300,
    });
  }, [shouldShow, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}
