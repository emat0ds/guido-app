import { useState } from 'react';
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
import { colors, spacing, typography } from '@/constants/theme';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerButton } from '@/components/AnswerButton';
import { GuidoBubble } from '@/components/GuidoBubble';
import { saveQuestionState, addMasteredQuestion } from '@/lib/storage';
import { updateQuestionState } from '@/lib/progress';
import { useReviewQueue } from '@/hooks/useReviewQueue';

function formatGuido(explanation: string | undefined, isCorrect: boolean): string {
  const cleaned = (explanation || '')
    .replace(/^(vero|falso)[.\s,:]+/i, '')
    .trim();
  const prefix = isCorrect ? 'Esatto.' : 'Attenzione.';
  return cleaned ? `${prefix} ${cleaned}` : prefix;
}

export default function RipassoScreen() {
  const router = useRouter();
  const { reviewQueue, loading, totalDue, refreshQueue } = useReviewQueue();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.lg }]}>
            Caricamento...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (reviewQueue.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={[typography.h1, { color: colors.success, marginBottom: spacing.lg }]}>
            ✓
          </Text>
          <Text style={[typography.h2, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
            Nessun ripasso oggi!
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.xl }]}>
            Tutte le domande sono aggiornate.
          </Text>
          <TouchableOpacity style={styles.nextButton} onPress={() => router.back()}>
            <Text style={styles.nextButtonText}>Torna alla home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = reviewQueue[currentIndex];
  if (!current) return null;

  const isCorrect = selectedAnswer === current.question.answer;

  const handleAnswer = async (answerValue: boolean) => {
    console.log('question.answer:', current.question.answer, typeof current.question.answer, '| selected:', answerValue, typeof answerValue);

    const isAnswerCorrect = answerValue === current.question.answer;
    setSelectedAnswer(answerValue);
    setAnswered(true);

    if (isAnswerCorrect) setCorrectCount((prev) => prev + 1);

    const newState = updateQuestionState(current.state, isAnswerCorrect);
    if (newState.mastered) await addMasteredQuestion(current.question.id);
    await saveQuestionState(current.question.macro_area, current.question.id, newState);
  };

  const handleNext = async () => {
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setCompletedCount((prev) => prev + 1);
    } else {
      setCompletedCount((prev) => prev + 1);
      await refreshQueue();
      router.back();
    }
  };

  const progress = ((completedCount + (answered ? 1 : 0)) / reviewQueue.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Torna</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'right' }]}>
          {completedCount + (answered ? 1 : 0)} / {reviewQueue.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.metaCard}>
          <Text style={[typography.small, { color: colors.textMuted }]}>Categoria</Text>
          <Text style={[typography.h3]}>{current.question.category.replace(/-/g, ' ')}</Text>
          <Text style={[typography.small, {
            color: current.state.timesCorrect > 0 ? colors.success : colors.error,
            marginTop: spacing.sm,
          }]}>
            {current.state.timesCorrect} corretti • {current.state.timesWrong} errori
          </Text>
        </View>

        <QuestionCard question={current.question.question} type="boolean">
          <View style={styles.answerRow}>
            <AnswerButton
              label="Vero"
              isCorrect={answered && current.question.answer === true}
              isWrong={answered && selectedAnswer === true && !isCorrect}
              disabled={answered}
              onPress={() => !answered && handleAnswer(true)}
              containerStyle={styles.answerFlex}
            />
            <AnswerButton
              label="Falso"
              isCorrect={answered && current.question.answer === false}
              isWrong={answered && selectedAnswer === false && !isCorrect}
              disabled={answered}
              onPress={() => !answered && handleAnswer(false)}
              containerStyle={styles.answerFlex}
            />
          </View>
        </QuestionCard>

        {answered && (
          <GuidoBubble
            text={formatGuido(current.question.explanation, isCorrect)}
            variant={isCorrect ? 'success' : 'error'}
          />
        )}

        {answered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === reviewQueue.length - 1
                ? `Completa ripasso (${correctCount}/${reviewQueue.length})`
                : 'Prossima'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { color: colors.purple, fontSize: 14, fontWeight: '500', marginBottom: spacing.md },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: { height: '100%', backgroundColor: colors.purple },
  scrollView: { flex: 1 },
  contentContainer: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  metaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
  },
  answerRow: { flexDirection: 'row', gap: 12, marginTop: spacing.md },
  answerFlex: { flex: 1 },
  nextButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
