import { useEffect, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { spacing, radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { GuidoBubble } from '@/components/GuidoBubble';
import { ALL_BADGES, BadgeDef } from '@/lib/badges';
import { getUnlockedBadges } from '@/lib/storage';
import type { TabScreenProps } from './_layout';

export default function BadgeScreen({ refreshKey }: TabScreenProps) {
  const { colors } = useTheme();
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    const ids = await getUnlockedBadges();
    setUnlockedIds(ids);
  }, []);

  useEffect(() => {
    load();
  }, [refreshKey]);

  const unlocked = ALL_BADGES.filter((b) => unlockedIds.includes(b.id));
  const locked = ALL_BADGES.filter((b) => !unlockedIds.includes(b.id));

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Badge e traguardi</Text>

        <GuidoBubble text="Raccogli badge mentre avanzi. Ogni traguardo è una vittoria!" />

        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SBLOCCATI</Text>
            <View style={styles.badgesGrid}>
              {unlocked.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} unlocked colors={colors} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>DA SBLOCCARE</Text>
        <View style={styles.badgesGrid}>
          {locked.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} unlocked={false} colors={colors} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BadgeCard({
  badge,
  unlocked,
  colors,
}: {
  badge: BadgeDef;
  unlocked: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View
      style={[
        badgeCardStyles.badgeCard,
        {
          backgroundColor: unlocked ? colors.surface : colors.surfaceAlt,
          borderColor: unlocked ? colors.purple : colors.border,
          opacity: unlocked ? 1 : 0.45,
        },
      ]}
    >
      <Text style={badgeCardStyles.badgeEmoji}>{badge.emoji}</Text>
      <Text style={[badgeCardStyles.badgeName, { color: colors.textSecondary }]}>{badge.name}</Text>
      <Text style={[badgeCardStyles.badgeDesc, { color: colors.textDim }]}>{badge.description}</Text>
    </View>
  );
}

const badgeCardStyles = StyleSheet.create({
  badgeCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
  },
});

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    title: {
      fontSize: 26,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 32,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1,
      color: colors.textDim,
      marginBottom: -spacing.sm,
    },
    badgesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
  });
}
