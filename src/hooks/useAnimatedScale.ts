import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

export function useAnimatedScale(initialScale = 1) {
  const scale = useSharedValue(initialScale);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerScale = (targetScale: number, duration = 200) => {
    scale.value = withSpring(targetScale, {
      damping: 10,
      mass: 1,
      stiffness: 100,
    });
  };

  return {
    animatedStyle,
    triggerScale,
    scale,
  };
}
