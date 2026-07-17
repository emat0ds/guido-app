import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { GuidoBubble } from '@/components/GuidoBubble';
import { useUserProgress } from '@/hooks/useUserProgress';

export default function ProgressiScreen() {
  const { progress, loading } = useUserProgress();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.h2, { color: colors.textSecondary }]}>
            Caricamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalQuestions = Object.values(progress?.macroProgress ?? {}).reduce(
    (sum, m) => sum + m.totalQuestions,
    0
  );
  const correctAnswers = Object.values(progress?.macroProgress ?? {}).reduce(
    (sum, m) => sum + m.correctAnswers,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[typography.h1, styles.title]}>Tuoi progressi</Text>

        <GuidoBubble text="Analizza come stai andando nelle diverse aree. Concentrati su quelle più deboli." />

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[typography.h2, { color: colors.purple }]}>
              {correctAnswers}
            </Text>
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Domande affrontate
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[typography.h2, { color: colors.success }]}>
              {totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0}
              %
            </Text>
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Accuratezza media
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[typography.h2, { color: colors.purple }]}>
              {progress?.totalStudyDays || 0}
            </Text>
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Giorni di studio
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[typography.h2, { color: colors.success }]}>
              {progress?.masteredCount || 0}
            </Text>
            <Text style={[typography.small, { color: colors.textMuted }]}>
              Masterate
            </Text>
          </View>
        </View>

        <Text style={[typography.label, styles.sectionTitle]}>
          DETTAGLI PER MACRO-AREA
        </Text>

        {Object.entries(progress?.macroProgress ?? {}).map(([macroId, macro]) => (
          <View key={macroId} style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={[typography.h3]}>{macroId.replace('-', ' ')}</Text>
              <Text
                style={[
                  typography.small,
                  { color: colors.purple, fontWeight: '600' },
                ]}
              >
                {macro.correctAnswers} / {macro.totalQuestions}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      macro.totalQuestions > 0
                        ? (macro.correctAnswers / macro.totalQuestions) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  macroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.purple,
  },
});
