import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface StreakBarProps {
  streak: number;
}

export function StreakBar({ streak }: StreakBarProps) {
  return (
    <View style={styles.container}>
      {streak > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            🔥 {streak} {streak === 1 ? 'giorno' : 'giorni'}
          </Text>
        </View>
      )}
      <View style={styles.dots}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index < streak ? colors.purple : colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    backgroundColor: colors.purpleDim,
    borderWidth: 1,
    borderColor: '#3d2fff33',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.purpleLight,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
