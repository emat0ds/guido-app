import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { QuestionCard } from '@/components/QuestionCard';
import { AnswerButton } from '@/components/AnswerButton';
import { GuidoBubble } from '@/components/GuidoBubble';
import { QuestionImage } from '@/components/QuestionImage';
import { getQuestionsByMacroId, getAllQuestions, getRandomQuestions, Question } from '@/lib/questions';
import {
  getQuestionState,
  saveQuestionState,
  addMasteredQuestion,
  incrementStreak,
  recordStudyDate,
  updateConsecutiveCorrect,
  unlockBadge,
  incrementDailyGoal,
  recalculateMacroProgress,
} from '@/lib/storage';
import { onStudiedToday } from '@/lib/notifications';
import { trackSessionEnd, trackQuestionAnswered } from '@/lib/analytics';
import { isPremium, getGuidoRequests, consumeGuidoRequest, purchaseGuidoRequests, purchasePremium, restorePurchases, fetchProductPrice } from '@/lib/iap';
import { getBadgeForConsecutive, getBadgeById } from '@/lib/badges';
import { useBadge } from '@/contexts/BadgeContext';
import { updateQuestionState } from '@/lib/progress';
import { MACROS } from '@/constants/macros';

const SESSION_SIZE = 10;
const GUIDO_API_URL = 'https://guido-app-production.up.railway.app';
const REPORT_EMAIL = 'ematods@gmail.com';

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

export default function LezioneScreen() {
  const { macroId } = useLocalSearchParams();
  const router = useRouter();
  const { showBadgeUnlock } = useBadge();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, boolean>>({});
  const studyTracked = useRef(false);
  const sessionStartRef = useRef<number | null>(null);
  const sessionAnsweredRef = useRef(0);
  const sessionCorrectRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [guidoText, setGuidoText] = useState<string | null>(null);
  const [loadingGuido, setLoadingGuido] = useState(false);
  const [guidoRequests, setGuidoRequests] = useState<number>(0);
  const [hasPremium, setHasPremium] = useState<boolean>(false);
  const [showGuidoModal, setShowGuidoModal] = useState<'upsell_premium' | 'upsell_refill' | null>(null);
  const [purchasingGuido, setPurchasingGuido] = useState(false);

  useEffect(() => {
    loadSessionQuestions();
  }, [macroId]);

  useEffect(() => {
    (async () => {
      const [premium, requests] = await Promise.all([isPremium(), getGuidoRequests()]);
      setHasPremium(premium);
      setGuidoRequests(requests);
    })();
  }, []);

  const loadSessionQuestions = async () => {
    try {
      const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
      if (!macroIdStr) return;
      const pool = macroIdStr === 'random'
        ? await getAllQuestions()
        : await getQuestionsByMacroId(macroIdStr);
      const shuffled = getRandomQuestions(pool, SESSION_SIZE);
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

    // Track study session on first answer of the day
    if (!studyTracked.current) {
      studyTracked.current = true;
      sessionStartRef.current = Date.now();
      const newStreak = await incrementStreak();
      await recordStudyDate();
      await onStudiedToday(newStreak);
    }

    // Session counters (for analytics on exit/completion)
    sessionAnsweredRef.current += 1;

    const isCorrect = answerValue === current.answer;
    setSelectedAnswer(answerValue);
    setAnswered(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 350);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      sessionCorrectRef.current += 1;
    }

    // Analytics: per-question accuracy tracking
    await trackQuestionAnswered(current.id, isCorrect);

    // Daily goal: count every answered question
    await incrementDailyGoal();

    setSessionAnswers((prev) => ({ ...prev, [current.id]: isCorrect }));

    const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
    // In modalità random, salva lo stato sotto la macro reale della domanda
    const effectiveMacroId = macroIdStr === 'random'
      ? (MACROS.find((m) => m.categories.some((c) =>
          c.toLowerCase() === (current.category ?? '').toLowerCase()
        ))?.id ?? macroIdStr)
      : macroIdStr;

    const currentState = await getQuestionState(effectiveMacroId, current.id);
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
    await saveQuestionState(effectiveMacroId, current.id, newState);

    // Ricalcola MacroProgress dai QuestionState reali (domande uniche, non cumulative)
    const macroForProgress = MACROS.find((m) => m.id === effectiveMacroId);
    if (macroForProgress) {
      await recalculateMacroProgress(effectiveMacroId, macroForProgress.totalQuestions);
    }

    // Badge: prima curva (first answer ever — unlockBadge is idempotent)
    const primaIsNew = await unlockBadge('prima-curva');
    if (primaIsNew) {
      const primaBadge = getBadgeById('prima-curva');
      if (primaBadge) showBadgeUnlock(primaBadge);
    }

    // Badge: consecutive correct answers (only checked if no higher-priority popup just shown)
    const consecutive = await updateConsecutiveCorrect(isCorrect);
    const consecutiveBadge = getBadgeForConsecutive(consecutive);
    if (consecutiveBadge) {
      const isNew = await unlockBadge(consecutiveBadge.id);
      if (isNew) showBadgeUnlock(consecutiveBadge);
    }
  };

  const askGuido = async () => {
    if (!current || loadingGuido) return;

    // Gate: no premium → upsell premium
    if (!hasPremium) {
      setShowGuidoModal('upsell_premium');
      return;
    }

    // Gate: no requests left → upsell refill
    if (guidoRequests <= 0) {
      setShowGuidoModal('upsell_refill');
      return;
    }

    setLoadingGuido(true);
    const consumed = await consumeGuidoRequest();
    if (!consumed) {
      setShowGuidoModal('upsell_refill');
      setLoadingGuido(false);
      return;
    }
    setGuidoRequests((prev) => prev - 1);

    try {
      const res = await fetch(`${GUIDO_API_URL}/ask-guido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: current.question,
          explanation: current.explanation,
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

  const handleBuyPremium = async () => {
    setPurchasingGuido(true);
    const result = await purchasePremium();
    setPurchasingGuido(false);
    if (result.success) {
      setHasPremium(true);
      setGuidoRequests(50);
      setShowGuidoModal(null);
    }
  };

  const handleRestorePurchases = async () => {
    setPurchasingGuido(true);
    const result = await restorePurchases();
    setPurchasingGuido(false);
    if (result.hasPremium) {
      setHasPremium(true);
      const requests = await getGuidoRequests();
      setGuidoRequests(requests);
      setShowGuidoModal(null);
    }
  };

  const handleBuyRefill = async () => {
    setPurchasingGuido(true);
    const result = await purchaseGuidoRequests();
    setPurchasingGuido(false);
    if (result.success) {
      setGuidoRequests((prev) => prev + 200);
      setShowGuidoModal(null);
    }
  };

  const flushSessionAnalytics = async (macroIdStr: string) => {
    if (sessionStartRef.current !== null && sessionAnsweredRef.current > 0) {
      const durationMs = Date.now() - sessionStartRef.current;
      await trackSessionEnd(macroIdStr, sessionAnsweredRef.current, sessionCorrectRef.current, durationMs);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setGuidoText(null);
    } else {
      const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;

      // Il MacroProgress viene già aggiornato ad ogni risposta in handleAnswer.
      // In modalità random, ricalcola tutte le macro toccate in questa sessione.
      if (macroIdStr === 'random') {
        const touchedMacroIds = [...new Set(questions.map((q) =>
          MACROS.find((m) => m.categories.some((c) =>
            c.toLowerCase() === (q.category ?? '').toLowerCase()
          ))?.id
        ).filter(Boolean))] as string[];
        await Promise.all(touchedMacroIds.map((mid) => {
          const m = MACROS.find((x) => x.id === mid);
          return m ? recalculateMacroProgress(mid, m.totalQuestions) : Promise.resolve();
        }));
      } else {
        const macro = MACROS.find((m) => m.id === macroIdStr);
        if (macro) await recalculateMacroProgress(macroIdStr, macro.totalQuestions);
      }

      await flushSessionAnalytics(macroIdStr);
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
        <TouchableOpacity onPress={async () => {
          const macroIdStr = Array.isArray(macroId) ? macroId[0] : macroId;
          await flushSessionAnalytics(macroIdStr);
          router.back();
        }}>
          <Text style={styles.backButton}>← Indietro</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[typography.small, { color: colors.textMuted, textAlign: 'right' }]}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      {/* Guido upsell modals */}
      <Modal visible={showGuidoModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {showGuidoModal === 'upsell_premium' ? (
              <>
                <Text style={styles.modalTitle}>✨ Chiedi a Guido</Text>
                <Text style={styles.modalBody}>
                  Ottieni spiegazioni personalizzate dall'AI per ogni domanda.{'\n\n'}
                  Con <Text style={{ fontWeight: '700' }}>Guido Premium</Text> hai:{'\n'}
                  • Esami illimitati{'\n'}
                  • 50 domande a Guido incluse
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleBuyPremium}
                  disabled={purchasingGuido}
                >
                  {purchasingGuido ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Acquista Premium — €1,99</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRestorePurchases} disabled={purchasingGuido}>
                  <Text style={styles.modalCancel}>
                    {purchasingGuido ? 'Verifica in corso…' : 'Ho già acquistato → Ripristina'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowGuidoModal(null)}>
                  <Text style={[styles.modalCancel, { opacity: 0.5 }]}>Non ora</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>💬 Richieste esaurite</Text>
                <Text style={styles.modalBody}>
                  Hai usato tutte le tue domande a Guido.{'\n\n'}
                  Ricarica <Text style={{ fontWeight: '700' }}>200 domande</Text> per continuare a ricevere spiegazioni AI.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleBuyRefill}
                  disabled={purchasingGuido}
                >
                  {purchasingGuido ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>Ricarica 200 domande — €2,99</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowGuidoModal(null)}>
                  <Text style={styles.modalCancel}>Non ora</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
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
              <>
                <GuidoBubble
                  text={guidoText || formatGuido(current.explanation, isCorrect)}
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
                      <Text style={styles.guidoButtonText}>
                        💬 Chiedi a Guido{hasPremium ? ` (${guidoRequests})` : ' ✨'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => Linking.openURL(buildReportUrl(current.id, current.question, current.explanation))}
                >
                  <Text style={styles.reportLink}>Segnala un problema</Text>
                </TouchableOpacity>
              </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
