import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useCallback, useMemo } from 'react';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ModuleCard } from '@/components/ModuleCard';
import { ProgressRing } from '@/components/ProgressRing';
import { StreakBar } from '@/components/StreakBar';
import { DailyGoalCard } from '@/components/DailyGoalCard';
import { MACROS } from '@/constants/macros';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { useDailyGoal } from '@/hooks/useDailyGoal';
import type { TabScreenProps } from './_layout';

export default function HomeScreen({ refreshKey }: TabScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { progress, loading, loadProgress } = useUserProgress();
  const { totalDue: reviewCount } = useReviewQueue();
  const { count: dailyCount, goal: dailyGoal, completed: dailyCompleted, celebrated: dailyCelebrated, markCelebrated } = useDailyGoal(refreshKey);

  useEffect(() => {
    loadProgress();
  }, [refreshKey]);

  const totalProgress = progress?.totalProgress ?? 0;
  const currentStreak = progress?.currentStreak ?? 0;
  const masteredCount = progress?.masteredCount ?? 0;
  const userName = progress?.userName || '';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.claim}>Guido. Ragionando.</Text>
            <StreakBar streak={currentStreak} />
          </View>
          <Text style={styles.greeting}>
            {userName ? `Ciao, ${userName}` : 'Ciao,'}
          </Text>
          <Text style={styles.tagline}>
            Studia un argomento alla volta. Guido ti spiega tutto, poi ti mette alla prova.
          </Text>
        </View>

        <View style={styles.progressSection}>
          <ProgressRing percentage={totalProgress} size={80} />
          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>Progresso totale</Text>
            <Text style={styles.progressNumber}>{totalProgress}%</Text>
          </View>
        </View>

        {reviewCount > 0 && (
          <TouchableOpacity
            style={styles.reviewBox}
            onPress={() => router.push('/ripasso' as any)}
          >
            <Text style={styles.reviewTitle}>Ripassiamo?</Text>
            <Text style={styles.reviewSub}>
              {reviewCount} {reviewCount === 1 ? 'domanda' : 'domande'} da ripassare
            </Text>
            <Text style={styles.reviewCta}>Tocca per iniziare →</Text>
          </TouchableOpacity>
        )}

        <DailyGoalCard
          count={dailyCount}
          goal={dailyGoal}
          completed={dailyCompleted}
          celebrated={dailyCelebrated}
          onCelebrationDone={markCelebrated}
        />

        <TouchableOpacity
          style={styles.randomCard}
          onPress={() => router.push('/lezione/random' as any)}
          activeOpacity={0.75}
        >
          <Text style={styles.randomTitle}>🎲 Pratica libera</Text>
          <Text style={styles.randomSub}>10 domande casuali da tutte le 7.139</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>MACRO-AREE</Text>

        {MACROS.map((macro) => {
          const macroProgress = progress?.macroProgress[macro.id];
          const correctAnswers = macroProgress?.correctAnswers ?? 0;
          const wrongAnswers = macroProgress?.wrongAnswers ?? 0;
          const answeredCount = correctAnswers + wrongAnswers;

          let starsCount = 0;
          if (correctAnswers > 0) {
            const accuracy = (correctAnswers / macro.totalQuestions) * 100;
            if (accuracy >= 90) starsCount = 3;
            else if (accuracy >= 80) starsCount = 2;
            else if (accuracy >= 60) starsCount = 1;
          }

          return (
            <ModuleCard
              key={macro.id}
              title={macro.title}
              color={macro.color}
              progress={
                macro.totalQuestions > 0
                  ? (answeredCount / macro.totalQuestions) * 100
                  : 0
              }
              correctAnswers={correctAnswers}
              answeredCount={answeredCount}
              totalQuestions={macro.totalQuestions}
              starsCount={starsCount}
              onPress={() => router.push(`/lezione/${macro.id}` as any)}
            />
          );
        })}

        {masteredCount > 0 && (
          <View style={styles.statsBox}>
            <Text style={styles.reviewTitle}>Progresso</Text>
            <Text style={styles.reviewSub}>{masteredCount} domande dominate</Text>
          </View>
        )}
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
      paddingHorizontal: 20,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      gap: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      gap: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    claim: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textDim,
      letterSpacing: 0.5,
    },
    greeting: {
      fontSize: 28,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 34,
    },
    tagline: {
      fontSize: 13,
      color: colors.textDim,
      lineHeight: 18,
    },
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: spacing.lg,
    },
    progressText: {
      flex: 1,
      gap: 4,
    },
    progressLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    progressNumber: {
      fontSize: 28,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textDim,
      letterSpacing: 0.8,
      marginTop: 4,
    },
    randomCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: spacing.lg,
      gap: 4,
    },
    randomTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    randomSub: {
      fontSize: 12,
      color: colors.textMuted,
    },
    reviewBox: {
      backgroundColor: colors.purpleDim,
      borderWidth: 1,
      borderColor: colors.purple,
      borderRadius: 14,
      padding: spacing.lg,
      gap: 6,
    },
    reviewTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    reviewSub: {
      fontSize: 12,
      color: colors.textMuted,
    },
    reviewCta: {
      fontSize: 12,
      color: colors.purple,
      marginTop: 2,
    },
    statsBox: {
      backgroundColor: colors.purpleDim,
      borderWidth: 1,
      borderColor: colors.purple,
      borderRadius: 14,
      padding: spacing.lg,
      gap: 6,
    },
  });
}
