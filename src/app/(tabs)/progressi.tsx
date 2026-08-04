import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useMemo } from 'react';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { GuidoBubble } from '@/components/GuidoBubble';
import { useUserProgress } from '@/hooks/useUserProgress';
import { MACROS } from '@/constants/macros';
import type { TabScreenProps } from './_layout';

export default function ProgressiScreen({ refreshKey }: TabScreenProps) {
  const { colors } = useTheme();
  const { progress, loading, loadProgress } = useUserProgress();

  useEffect(() => {
    loadProgress();
  }, [refreshKey]);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 20, fontWeight: '500', color: colors.textSecondary }}>
            Caricamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const correctAnswers = Object.values(progress?.macroProgress ?? {}).reduce(
    (sum, m) => sum + m.correctAnswers,
    0
  );
  const wrongAnswers = progress?.wrongCount ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.title]}>Tuoi progressi</Text>

        <GuidoBubble text="Analizza come stai andando nelle diverse aree. Concentrati su quelle più deboli." />

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>
              {correctAnswers}
            </Text>
            <Text style={styles.statLabel}>Domande affrontate</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>
              {progress?.totalStudyDays || 0}
            </Text>
            <Text style={styles.statLabel}>Giorni di studio</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {progress?.masteredCount || 0}
            </Text>
            <Text style={styles.statLabel}>Dominate</Text>
          </View>
        </View>

        {wrongAnswers > 0 && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Text style={[styles.statNumber, { color: colors.error }]}>
                {wrongAnswers}
              </Text>
              <Text style={styles.statLabel}>Crashate</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>DETTAGLI PER MACRO-AREA</Text>

        {MACROS.map((macro) => {
          const macroData = progress?.macroProgress[macro.id];
          const correct = macroData?.correctAnswers ?? 0;
          const pct =
            macro.totalQuestions > 0
              ? Math.round((correct / macro.totalQuestions) * 100)
              : 0;

          return (
            <View key={macro.id} style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroColorDot, { backgroundColor: macro.color }]} />
                <Text style={styles.macroTitle}>{macro.title}</Text>
                <Text style={[styles.macroPct, { color: macro.color }]}>{pct}%</Text>
              </View>
              <View style={styles.macroCountRow}>
                <Text style={styles.macroCount}>{correct} / {macro.totalQuestions}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${pct}%`,
                      backgroundColor: macro.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: spacing.lg,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.md,
      marginVertical: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.lg,
      alignItems: 'center',
      gap: 4,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '600',
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.8,
      color: colors.textDim,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    macroCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.lg,
      marginVertical: spacing.xs,
      gap: spacing.sm,
    },
    macroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    macroColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      flexShrink: 0,
    },
    macroTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    macroPct: {
      fontSize: 14,
      fontWeight: '600',
    },
    macroCountRow: {
      flexDirection: 'row',
    },
    macroCount: {
      fontSize: 11,
      color: colors.textDim,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
    },
  });
}
