import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerButton } from '@/components/AnswerButton';
import { GuidoBubble } from '@/components/GuidoBubble';
import { QuestionImage } from '@/components/QuestionImage';
import { saveQuestionState, addMasteredQuestion, recordStudyDate } from '@/lib/storage';
import { updateQuestionState } from '@/lib/progress';
import { useReviewQueue } from '@/hooks/useReviewQueue';

const REPORT_EMAIL = 'ematods@gmail.com';
const GUIDO_API_URL = 'https://guido-app-production.up.railway.app';

function buildReportUrl(id: number, question: string, explanation: string | undefined): string {
  const subject = encodeURIComponent(`Segnalazione domanda ${id}`);
  const body = encodeURIComponent(`Domanda: ${question}\nSpiegazione: ${explanation || ''}\nProblema: `);
  return `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`;
}

function formatGuido(explanation: string | undefined, isCorrect: boolean): string {
  const cleaned = (explanation || '')
    .replace(/^(vero|falso|esatto|corretto|attenzione|sbagliato)[.\s,:!]+/i, '')
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
  const [guidoText, setGuidoText] = useState<string | null>(null);
  const [loadingGuido, setLoadingGuido] = useState(false);

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

    await recordStudyDate();

    const isAnswerCorrect = answerValue === current.question.answer;
    setSelectedAnswer(answerValue);
    setAnswered(true);

    if (isAnswerCorrect) setCorrectCount((prev) => prev + 1);

    const newState = updateQuestionState(current.state, isAnswerCorrect);
    if (newState.mastered) await addMasteredQuestion(current.question.id);
    await saveQuestionState(current.question.macro_area, current.question.id, newState);
  };

  const askGuido = async () => {
    if (!current || loadingGuido) return;
    setLoadingGuido(true);
    try {
      const res = await fetch(`${GUIDO_API_URL}/ask-guido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question.question,
          explanation: current.question.explanation,
          isCorrect,
        }),
      });
      const data = await res.json();
      setGuidoText(data.response);
    } catch {
      setGuidoText('Non riesco a rispondere in questo momento. Riprova più tardi.');
    } finally {
      setLoadingGuido(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setGuidoText(null);
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
          {current.question.imagePath && <QuestionImage imagePath={current.question.imagePath} />}
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
          <>
            <GuidoBubble
              text={guidoText || formatGuido(current.question.explanation, isCorrect)}
              variant={isCorrect ? 'success' : 'error'}
            />
            {!guidoText && (
              <TouchableOpacity
                style={styles.guidoButton}
                onPress={askGuido}
                disabled={loadingGuido}
              >
                {loadingGuido ? (
                  <ActivityIndicator size="small" color="#7c6fff" />
                ) : (
                  <Text style={styles.guidoButtonText}>💬 Chiedi a Guido</Text>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL(buildReportUrl(current.question.id, current.question.question, current.question.explanation))}
            >
              <Text style={styles.reportLink}>Segnala un problema</Text>
            </TouchableOpacity>
          </>
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
  guidoButton: {
    borderWidth: 1,
    borderColor: '#3d2fff44',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: -spacing.sm,
  },
  guidoButtonText: {
    fontSize: 12,
    color: '#7c6fff',
    fontWeight: '500',
  },
  reportLink: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: -spacing.sm,
  },
});
