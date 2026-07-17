import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, spacing, typography } from '@/constants/theme';
import { ModuleCard } from '@/components/ModuleCard';
import { ProgressRing } from '@/components/ProgressRing';
import { StreakBar } from '@/components/StreakBar';
import { MACROS } from '@/constants/macros';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useReviewQueue } from '@/hooks/useReviewQueue';

export default function HomeScreen() {
  const router = useRouter();
  const { progress, loading, loadProgress } = useUserProgress();
  const { totalDue: reviewCount } = useReviewQueue();

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const totalProgress = progress?.totalProgress ?? 0;
  const currentStreak = progress?.currentStreak ?? 0;
  const masteredCount = progress?.masteredCount ?? 0;
  const userName = progress?.userName || '';

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

        <Text style={styles.sectionLabel}>MACRO-AREE</Text>

        {MACROS.map((macro) => {
          const macroProgress = progress?.macroProgress[macro.id];
          const correctAnswers = macroProgress?.correctAnswers ?? 0;

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
                  ? (correctAnswers / macro.totalQuestions) * 100
                  : 0
              }
              correctAnswers={correctAnswers}
              totalQuestions={macro.totalQuestions}
              starsCount={starsCount}
              onPress={() => router.push(`/lezione/${macro.id}` as any)}
            />
          );
        })}

        {masteredCount > 0 && (
          <View style={styles.statsBox}>
            <Text style={styles.reviewTitle}>Progresso</Text>
            <Text style={styles.reviewSub}>{masteredCount} domande masterate</Text>
          </View>
        )}
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
    color: '#444444',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '500',
    color: '#edeae4',
    lineHeight: 34,
  },
  tagline: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#13111f',
    borderWidth: 1,
    borderColor: '#2a2a35',
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
    color: '#edeae4',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#444444',
    letterSpacing: 0.8,
    marginTop: 4,
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
