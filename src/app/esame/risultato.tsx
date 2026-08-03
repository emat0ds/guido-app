import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { getExamSession, unlockBadge } from '@/lib/storage';
import { computeExamResult, EXAM_MAX_ERRORS, ExamSession } from '@/lib/exam';
import type { Question } from '@/lib/questions';
import { getBadgeById } from '@/lib/badges';
import { useBadge } from '@/contexts/BadgeContext';

export default function EsameRisultato() {
  const router = useRouter();
  const { showBadgeUnlock } = useBadge();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const badgeChecked = useRef(false);

  useEffect(() => {
    (async () => {
      const stored = await getExamSession();
      if (stored) setSession(stored as ExamSession);

      // Badge: pronto per l'esame (first completed exam)
      if (!badgeChecked.current) {
        badgeChecked.current = true;
        const isNew = await unlockBadge('pronto-esame');
        if (isNew) {
          const badge = getBadgeById('pronto-esame');
          if (badge) {
            // Small delay so the results screen renders first
            setTimeout(() => showBadgeUnlock(badge), 800);
          }
        }
      }

      setLoading(false);
    })();
  }, [showBadgeUnlock]);

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  const result = computeExamResult(session);
  const wrongIndexes: number[] = [];
  session.questions.forEach((q: Question, i: number) => {
    const a = session.answers[i];
    if (a === null || a !== q.answer) wrongIndexes.push(i);
  });

  const timeSpentSeconds = session.finishedAt && session.startedAt
    ? Math.round((session.finishedAt - session.startedAt) / 1000)
    : 0;
  const timeMin = Math.floor(timeSpentSeconds / 60);
  const timeSec = timeSpentSeconds % 60;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.verdictBox, result.passed ? styles.verdictPassed : styles.verdictFailed]}>
          <Text style={[styles.verdictText, result.passed ? styles.verdictTextPassed : styles.verdictTextFailed]}>
            {result.passed ? 'PROMOSSO' : 'BOCCIATO'}
          </Text>
          <Text style={[styles.scoreText, result.passed ? styles.scoreTextPassed : styles.scoreTextFailed]}>
            {result.correct}
            <Text style={styles.scoreOf}> / {session.questions.length}</Text>
          </Text>
          <Text style={[styles.scoreLabel, result.passed ? { color: colors.success } : { color: colors.error }]}>
            risposte corrette
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{result.errors}</Text>
            <Text style={styles.statLabel}>errori</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{EXAM_MAX_ERRORS}</Text>
            <Text style={styles.statLabel}>max consentiti</Text>
          </View>
          {timeSpentSeconds > 0 && (
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{timeMin}:{String(timeSec).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>tempo</Text>
            </View>
          )}
        </View>

        {wrongIndexes.length > 0 && (
          <View style={styles.errorsBox}>
            <Text style={styles.errorsTitle}>
              {wrongIndexes.length} {wrongIndexes.length === 1 ? 'domanda sbagliata' : 'domande sbagliate'}
            </Text>
            {wrongIndexes.slice(0, 5).map((idx) => {
              const q: Question = session.questions[idx];
              return (
                <View key={idx} style={styles.errorItem}>
                  <Text style={styles.errorItemNumber}>Dom. {idx + 1}</Text>
                  <Text style={styles.errorItemText} numberOfLines={2}>
                    {q.question}
                  </Text>
                </View>
              );
            })}
            {wrongIndexes.length > 5 && (
              <Text style={styles.moreErrors}>
                + altre {wrongIndexes.length - 5} domande
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => router.push('/esame/revisione' as any)}
        >
          <Text style={styles.reviewButtonText}>Rivedi con Guido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/esame' as any)}
        >
          <Text style={styles.secondaryButtonText}>Torna all'esame simulato</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  verdictBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  verdictPassed: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  verdictFailed: {
    backgroundColor: colors.errorDim,
    borderColor: colors.error,
  },
  verdictText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  verdictTextPassed: {
    color: colors.success,
  },
  verdictTextFailed: {
    color: colors.error,
  },
  scoreText: {
    fontSize: 52,
    fontWeight: '600',
    lineHeight: 60,
  },
  scoreOf: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.textMuted,
  },
  scoreTextPassed: {
    color: colors.success,
  },
  scoreTextFailed: {
    color: colors.error,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  errorsBox: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 4,
  },
  errorItem: {
    gap: 2,
  },
  errorItemNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  errorItemText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  moreErrors: {
    fontSize: 11,
    color: colors.textDim,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reviewButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
