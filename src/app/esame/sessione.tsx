import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { AnswerButton } from '@/components/AnswerButton';
import { QuestionImage } from '@/components/QuestionImage';
import { getExamSession, saveExamSession } from '@/lib/storage';
import { incrementExamCount } from '@/lib/iap';
import { EXAM_DURATION_SECONDS, ExamSession } from '@/lib/exam';
import type { Question } from '@/lib/questions';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function EsameSessione() {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SECONDS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<ExamSession | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getExamSession();
      if (!stored || !stored.questions?.length) {
        Alert.alert('Errore', 'Sessione non trovata.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      const s = stored as ExamSession;
      sessionRef.current = s;
      setSession(s);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitInternal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleAnswer = useCallback((answer: boolean) => {
    if (!sessionRef.current) return;

    const updated: ExamSession = {
      ...sessionRef.current,
      answers: sessionRef.current.answers.map((a, i) =>
        i === currentIndex ? answer : a
      ),
    };
    sessionRef.current = updated;
    setSession({ ...updated });
  }, [currentIndex]);

  const handleSubmitInternal = async (timeUp = false) => {
    if (submitting) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const current = sessionRef.current;
    if (!current) return;

    const finished: ExamSession = {
      ...current,
      finishedAt: Date.now(),
    };

    await saveExamSession(finished);
    await incrementExamCount();

    router.replace('/esame/risultato' as any);
  };

  const handleSubmitPress = () => {
    if (!sessionRef.current) return;

    const unanswered = sessionRef.current.answers.filter((a) => a === null).length;

    if (unanswered > 0) {
      Alert.alert(
        'Domande senza risposta',
        `Hai ${unanswered} domande senza risposta. Le domande senza risposta verranno conteggiate come errate. Vuoi consegnare comunque?`,
        [
          { text: 'Continua', style: 'cancel' },
          { text: 'Consegna', style: 'destructive', onPress: () => handleSubmitInternal(false) },
        ]
      );
    } else {
      Alert.alert('Consegna esame', 'Sei sicuro di voler consegnare?', [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Consegna', style: 'destructive', onPress: () => handleSubmitInternal(false) },
      ]);
    }
  };

  const handleAbandon = () => {
    Alert.alert(
      'Abbandona esame',
      'Vuoi davvero abbandonare? Perderai tutti i progressi di questa sessione.',
      [
        { text: 'Continua esame', style: 'cancel' },
        {
          text: 'Abbandona',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          },
        },
      ]
    );
  };

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.loadingText}>Preparazione esame...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const current: Question = session.questions[currentIndex];
  const currentAnswer = session.answers[currentIndex];
  const answeredCount = session.answers.filter((a) => a !== null).length;
  const progress = (currentIndex + 1) / session.questions.length;
  const isUrgent = secondsLeft <= 5 * 60;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAbandon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.abandonText}>← Abbandona</Text>
        </TouchableOpacity>
        <View style={[styles.timerBadge, isUrgent && styles.timerUrgent]}>
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            {formatTime(secondsLeft)}
          </Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressCounter}>
          {currentIndex + 1} / {session.questions.length}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.answeredHint}>
          {answeredCount} di {session.questions.length} risposte date
        </Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>{current.question}</Text>
          {current.imagePath && (
            <QuestionImage imagePath={current.imagePath} />
          )}
        </View>

        <View style={styles.answerRow}>
          <AnswerButton
            label="Vero"
            isSelected={currentAnswer === true}
            disabled={false}
            onPress={() => handleAnswer(true)}
            containerStyle={styles.answerFlex}
          />
          <AnswerButton
            label="Falso"
            isSelected={currentAnswer === false}
            disabled={false}
            onPress={() => handleAnswer(false)}
            containerStyle={styles.answerFlex}
          />
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
              ← Prec.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === session.questions.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentIndex((i) => Math.min(session.questions.length - 1, i + 1))}
            disabled={currentIndex === session.questions.length - 1}
          >
            <Text style={[styles.navButtonText, currentIndex === session.questions.length - 1 && styles.navButtonTextDisabled]}>
              Succ. →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitPress}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Consegna esame</Text>
          )}
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
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  abandonText: {
    fontSize: 14,
    color: colors.textDim,
    fontWeight: '500',
  },
  timerBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  timerUrgent: {
    backgroundColor: colors.errorDim,
    borderColor: colors.error,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  timerTextUrgent: {
    color: colors.error,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.purple,
  },
  progressCounter: {
    fontSize: 12,
    color: colors.textDim,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  answeredHint: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
  },
  questionBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  answerFlex: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: colors.textDim,
  },
  submitButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
