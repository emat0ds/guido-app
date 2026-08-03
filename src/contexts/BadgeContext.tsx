import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing } from '@/constants/theme';
import { BadgeDef } from '@/lib/badges';

interface BadgeContextValue {
  showBadgeUnlock: (badge: BadgeDef) => void;
}

const BadgeContext = createContext<BadgeContextValue>({
  showBadgeUnlock: () => {},
});

export function useBadge() {
  return useContext(BadgeContext);
}

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [badge, setBadge] = useState<BadgeDef | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    opacity.value = withTiming(0, { duration: 220 });
    scale.value = withTiming(0.85, { duration: 220 }, (done) => {
      if (done) runOnJS(setVisible)(false);
    });
  }, [opacity, scale]);

  const showBadgeUnlock = useCallback(
    (incoming: BadgeDef) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setBadge(incoming);
      scale.value = 0.85;
      opacity.value = 0;
      setVisible(true);

      // Tiny delay so Modal mounts before animation starts
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 180 });
        opacity.value = withTiming(1, { duration: 180 });
      }, 40);

      timerRef.current = setTimeout(dismiss, 3600);
    },
    [dismiss, opacity, scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <BadgeContext.Provider value={{ showBadgeUnlock }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={dismiss}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={dismiss}
        >
          <Animated.View style={[styles.card, animatedStyle]}>
            <Text style={styles.label}>BADGE SBLOCCATO</Text>
            <Text style={styles.emoji}>{badge?.emoji}</Text>
            <Text style={styles.name}>{badge?.name}</Text>
            <Text style={styles.description}>{badge?.description}</Text>
            <View style={styles.hint}>
              <Text style={styles.hintText}>Tocca per chiudere</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </BadgeContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 320,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.purpleLight,
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 52,
    lineHeight: 62,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  hint: {
    marginTop: spacing.lg,
  },
  hintText: {
    fontSize: 11,
    color: colors.textDim,
  },
});
