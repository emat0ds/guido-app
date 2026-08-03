import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { getSignImage } from '@/lib/imageMap';
import { colors } from '@/constants/theme';

interface QuestionImageProps {
  imagePath?: string | null;
  height?: number;
}

export function QuestionImage({ imagePath, height = 160 }: QuestionImageProps) {
  const source = getSignImage(imagePath);
  if (!source) return null;
  return <QuestionImageInner source={source} height={height} />;
}

function QuestionImageInner({ source, height }: { source: any; height: number }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setFullscreen(true)}
        style={[styles.container, { height }]}
      >
        <Image source={source} style={styles.image} resizeMode="contain" />
        <View style={styles.zoomHint}>
          <Text style={styles.zoomHintText}>⊕</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={fullscreen}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setFullscreen(false)}
      >
        <GestureHandlerRootView style={styles.flex}>
          <FullscreenViewer
            source={source}
            onClose={() => setFullscreen(false)}
          />
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

function FullscreenViewer({
  source,
  onClose,
}: {
  source: any;
  onClose: () => void;
}) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const bgOpacity = useSharedValue(0);

  // Enter animation
  useEffect(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 200 });
    bgOpacity.value = withTiming(1, { duration: 200 });
  }, [scale, bgOpacity]);

  const close = useCallback(() => {
    scale.value = withTiming(0.88, { duration: 180 });
    bgOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  }, [onClose, scale, bgOpacity]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        bgOpacity.value = Math.max(0, 1 - e.translationY / 260);
      }
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 600) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 20 });
        bgOpacity.value = withTiming(1, { duration: 150 });
      }
    });

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <View style={styles.flex}>
      {/* Dark background */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, bgStyle]} />

      {/* Tap background to close */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={close}
      />

      {/* Swipeable image */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.imageFullWrapper, imageStyle]}>
          <Image
            source={source}
            style={styles.imageFullscreen}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={close}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Swipe hint */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>Scorri verso il basso per chiudere</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // Thumbnail
  container: {
    backgroundColor: '#141417',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  zoomHintText: {
    fontSize: 14,
    color: colors.textDim,
    fontWeight: '600',
  },
  // Fullscreen
  overlay: {
    backgroundColor: '#000',
  },
  imageFullWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageFullscreen: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
});
