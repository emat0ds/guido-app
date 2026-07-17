import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface ProgressRingProps {
  percentage: number;
  size?: number;
}

export function ProgressRing({ percentage, size = 80 }: ProgressRingProps) {
  const filled = Math.min(Math.max(percentage, 0), 100);
  const deg = (filled / 100) * 360;
  const halfSize = size / 2;
  const ringThickness = size * 0.13;
  const innerSize = size - ringThickness * 2;

  // Right arc covers 0°–180° of progress
  const rightRotation = Math.min(deg, 180) - 180;
  // Left arc covers 180°–360° of progress
  const leftRotation = Math.max(deg - 180, 0);

  return (
    <View style={{ width: size, height: size }}>
      {/* Gray track */}
      <View style={{
        position: 'absolute',
        width: size, height: size, borderRadius: halfSize,
        backgroundColor: '#2a2a35',
      }} />

      {/* Right half arc (0%–50%) */}
      <View style={{
        position: 'absolute', left: halfSize, top: 0,
        width: halfSize, height: size,
        overflow: 'hidden',
      }}>
        <View style={{
          position: 'absolute', left: -halfSize, top: 0,
          width: size, height: size,
          transform: [{ rotate: `${rightRotation}deg` }],
        }}>
          <View style={{
            position: 'absolute',
            left: halfSize, top: 0,
            width: halfSize, height: size,
            backgroundColor: colors.purple,
          }} />
        </View>
      </View>

      {/* Left half arc (50%–100%) */}
      {deg > 180 && (
        <View style={{
          position: 'absolute', left: 0, top: 0,
          width: halfSize, height: size,
          overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', left: 0, top: 0,
            width: size, height: size,
            transform: [{ rotate: `${leftRotation}deg` }],
          }}>
            <View style={{
              position: 'absolute',
              left: halfSize, top: 0,
              width: halfSize, height: size,
              backgroundColor: colors.purple,
            }} />
          </View>
        </View>
      )}

      {/* Donut hole */}
      <View style={{
        position: 'absolute',
        left: ringThickness, top: ringThickness,
        width: innerSize, height: innerSize,
        borderRadius: innerSize / 2,
        backgroundColor: colors.surface,
      }} />

      {/* Center text */}
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.pct}>{Math.round(filled)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
