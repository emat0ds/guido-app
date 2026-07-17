import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { GuidoBubble } from '@/components/GuidoBubble';

const BADGES = [
  { id: '1', name: 'Prima curva', emoji: '🎯', unlocked: true },
  {
    id: '2',
    name: 'Semaforo verde',
    emoji: '🚦',
    unlocked: true,
  },
  {
    id: '3',
    name: 'Senza graffi',
    emoji: '✨',
    unlocked: false,
  },
  {
    id: '4',
    name: 'Istruttore soddisfatto',
    emoji: '👨‍🏫',
    unlocked: false,
  },
];

export default function BadgeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[typography.h1, styles.title]}>Badge e traguardi</Text>

        <GuidoBubble text="Raccogli badge mentre avanzi. Ogni traguardo è una vittoria!" />

        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: badge.unlocked
                    ? colors.surface
                    : colors.surfaceAlt,
                  borderColor: badge.unlocked
                    ? colors.purple
                    : colors.border,
                  opacity: badge.unlocked ? 1 : 0.5,
                },
              ]}
            >
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={[typography.small, { marginTop: spacing.sm }]}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  title: {
    marginBottom: spacing.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  badgeCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 32,
  },
});
