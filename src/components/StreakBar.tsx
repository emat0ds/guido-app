import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface StreakBarProps {
  streak: number;
}

export function StreakBar({ streak }: StreakBarProps) {
  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
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
