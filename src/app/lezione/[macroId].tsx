import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerButton } from '@/components/AnswerButton';
import { GuidoBubble } from '@/components/GuidoBubble';
import { QuestionImage } from '@/components/QuestionImage';
import { getQuestionsByMacroId, getRandomQuestions, Question } from '@/lib/questions';
import {
  getQuestionState,
  saveQuestionState,
  saveMacroProgress,
  getMacroProgress,
  addMasteredQuestion,
} from '@/lib/storage';
import { updateQuestionState } from '@/lib/progress';
import { MACROS } from '@/constants/macros';

const SESSION_SIZE = 10;

function formatGuido(explanation: string | undefined, isCorrect: boolean): string {
  const cleaned = (explanation || '')
    .replace(/^(vero|falso)[.\s,:]+/i, '')
    .trim();
  const prefix = isCorrect ? 'Esatto.' : 'Attenzione.';
  return cleaned ? `${prefix} ${cleaned}` : prefix;
}

export default function LezioneScreen() {
  const { macroId } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadSessionQuestions();
  }, [macroId]);

  const loadSessionQuestions = async () => {
    try {
      const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
      if (!macroIdStr) return;
      const allQuestions = await getQuestionsByMacroId(macroIdStr);
      const shuffled = getRandomQuestions(allQuestions, SESSION_SIZE);
      setQuestions(shuffled);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const current = questions[currentIndex];

  const handleAnswer = async (answerValue: boolean) => {
    if (!current) return;

    console.log('question.answer:', current.answer, typeof current.answer, '| selected:', answerValue, typeof answerValue);

    const isCorrect = answerValue === current.answer;
    setSelectedAnswer(answerValue);
    setAnswered(true);

    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setSessionAnswers((prev) => ({ ...prev, [current.id]: isCorrect }));

    const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
    const currentState = await getQuestionState(macroIdStr, current.id);
    const newState = updateQuestionState(
      currentState || {
        id: current.id,
        timesCorrect: 0,
        timesWrong: 0,
        lastSeen: 0,
        nextReview: 0,
        mastered: false,
      },
      isCorrect
    );

    if (newState.mastered) await addMasteredQuestion(current.id);
    await saveQuestionState(macroIdStr, current.id, newState);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
      const macro = MACROS.find((m) => m.id === macroIdStr);

      if (macro) {
        const existingProgress = await getMacroProgress(macroIdStr);
        await saveMacroProgress(macroIdStr, {
          macroId: macroIdStr,
          totalQuestions: macro.totalQuestions,
          correctAnswers: (existingProgress?.correctAnswers || 0) + correctCount,
          masteredCount:
            (existingProgress?.masteredCount || 0) +
            Object.values(sessionAnswers).filter((v) => v).length,
          lastUpdated: Date.now(),
        });
      }

      router.back();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.lg }]}>
            Caricamento domande...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={[typography.h2, { color: colors.textSecondary }]}>
            Nessuna domanda disponibile
          </Text>
          <TouchableOpacity
            style={[styles.nextButton, { marginTop: spacing.xl }]}
            onPress={() => router.back()}
          >
            <Text style={styles.nextButtonText}>Torna indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCorrect = selectedAnswer === current?.answer;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Indietro</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'right' }]}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {current && (
          <>
            <QuestionCard question={current.question} type="boolean">
              {current.imagePath && <QuestionImage imagePath={current.imagePath} />}
              <View style={styles.answerRow}>
                <AnswerButton
                  label="Vero"
                  isCorrect={answered && current.answer === true}
                  isWrong={answered && selectedAnswer === true && !isCorrect}
                  disabled={answered}
                  onPress={() => !answered && handleAnswer(true)}
                  containerStyle={styles.answerFlex}
                />
                <AnswerButton
                  label="Falso"
                  isCorrect={answered && current.answer === false}
                  isWrong={answered && selectedAnswer === false && !isCorrect}
                  disabled={answered}
                  onPress={() => !answered && handleAnswer(false)}
                  containerStyle={styles.answerFlex}
                />
              </View>
            </QuestionCard>

            {answered && (
              <GuidoBubble
                text={formatGuido(current.explanation, isCorrect)}
                variant={isCorrect ? 'success' : 'error'}
              />
            )}
          </>
        )}

        {answered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === questions.length - 1
                ? `Completa lezione (${correctCount}/${questions.length})`
                : 'Vai avanti'}
            </Text>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.purple,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.purple,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: spacing.md,
  },
  answerFlex: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
