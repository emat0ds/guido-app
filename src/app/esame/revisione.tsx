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
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { GuidoBubble } from '@/components/GuidoBubble';
import { QuestionImage } from '@/components/QuestionImage';
import { getExamSession } from '@/lib/storage';
import type { ExamSession } from '@/lib/exam';
import type { Question } from '@/lib/questions';

function formatGuido(explanation: string | undefined, isCorrect: boolean): string {
  const cleaned = (explanation || '').replace(/^(vero|falso)[.\s,:]+/i, '').trim();
  const prefix = isCorrect ? 'Esatto.' : 'Attenzione.';
  return cleaned ? `${prefix} ${cleaned}` : prefix;
}

export default function EsameRevisione() {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wrong'>('wrong');

  useEffect(() => {
    (async () => {
      const stored = await getExamSession();
      if (stored) setSession(stored as ExamSession);
      setLoading(false);
    })();
  }, []);

  if (loading || !session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  const items = session.questions
    .map((q: Question, i: number) => {
      const userAnswer = session.answers[i];
      const isCorrect = userAnswer !== null && userAnswer === q.answer;
      const isWrong = userAnswer === null || userAnswer !== q.answer;
      return { q, userAnswer, isCorrect, isWrong, index: i };
    })
    .filter((item) => filter === 'all' || item.isWrong);

  const wrongCount = session.questions.filter((q: Question, i: number) => {
    const a = session.answers[i];
    return a === null || a !== q.answer;
  }).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Risultati</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisione</Text>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'wrong' && styles.filterBtnActive]}
          onPress={() => setFilter('wrong')}
        >
          <Text style={[styles.filterBtnText, filter === 'wrong' && styles.filterBtnTextActive]}>
            Sbagliate ({wrongCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
            Tutte ({session.questions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nessun errore. Perfetto.</Text>
          </View>
        )}

        {items.map(({ q, userAnswer, isCorrect, index }) => (
          <View
            key={index}
            style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardWrong]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardNumber}>Dom. {index + 1}</Text>
              <Text style={[styles.cardBadge, isCorrect ? styles.cardBadgeCorrect : styles.cardBadgeWrong]}>
                {isCorrect ? 'Corretta' : 'Sbagliata'}
              </Text>
            </View>

            <Text style={styles.questionText}>{q.question}</Text>

            {q.imagePath && <QuestionImage imagePath={q.imagePath} />}

            <View style={styles.answersRow}>
              <View style={[
                styles.answerTag,
                userAnswer === true
                  ? (isCorrect ? styles.answerTagCorrect : styles.answerTagWrong)
                  : styles.answerTagNeutral,
              ]}>
                <Text style={styles.answerTagText}>
                  VERO {userAnswer === true ? (isCorrect ? '✓' : '✗') : ''}
                </Text>
              </View>
              <View style={[
                styles.answerTag,
                userAnswer === false
                  ? (isCorrect ? styles.answerTagCorrect : styles.answerTagWrong)
                  : styles.answerTagNeutral,
              ]}>
                <Text style={styles.answerTagText}>
                  FALSO {userAnswer === false ? (isCorrect ? '✓' : '✗') : ''}
                </Text>
              </View>
            </View>

            {!isCorrect && (
              <Text style={styles.correctAnswerLabel}>
                Risposta corretta: {q.answer ? 'VERO' : 'FALSO'}
              </Text>
            )}

            {!isCorrect && userAnswer === null && (
              <Text style={styles.unansweredLabel}>Non hai risposto a questa domanda.</Text>
            )}

            {q.explanation && (
              <GuidoBubble
                text={formatGuido(q.explanation, isCorrect)}
                variant={isCorrect ? 'success' : 'error'}
              />
            )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backText: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.purpleDim,
    borderColor: colors.purple,
  },
  filterBtnText: {
    fontSize: 12,
    color: colors.textDim,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: colors.purpleLight,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardCorrect: {
    backgroundColor: colors.successDim,
    borderColor: colors.successBorder,
  },
  cardWrong: {
    backgroundColor: colors.errorDim,
    borderColor: colors.errorBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardBadgeCorrect: {
    color: colors.success,
  },
  cardBadgeWrong: {
    color: colors.error,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  answersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  answerTag: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  answerTagCorrect: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  answerTagWrong: {
    backgroundColor: colors.errorDim,
    borderColor: colors.error,
  },
  answerTagNeutral: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  answerTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  correctAnswerLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  unansweredLabel: {
    fontSize: 12,
    color: colors.error,
    fontStyle: 'italic',
  },
});
