import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { getMacroDetailStats, MacroDetailStats } from '@/lib/storage';
import { getRecentDailyStats, DailyStats } from '@/lib/analytics';
import { MACROS } from '@/constants/macros';
import type { TabScreenProps } from './_layout';

const TOTAL_QUESTIONS = 1301;

function calcReadiness(
  totalAnswered: number,
  globalAccuracy: number,
  streak: number,
  masteredCount: number
): number {
  const coverage = Math.min((totalAnswered / TOTAL_QUESTIONS) * 100, 100);
  const mastery = Math.min((masteredCount / TOTAL_QUESTIONS) * 100, 100);
  const consistency = Math.min(streak * 5, 100);
  return Math.round(coverage * 0.35 + globalAccuracy * 0.35 + mastery * 0.2 + consistency * 0.1);
}

function readinessLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Pronto per l'esame", color: '#22C55E' };
  if (score >= 70) return { label: 'Quasi pronto', color: '#F59E0B' };
  if (score >= 50) return { label: 'Buona strada', color: '#F59E0B' };
  return { label: 'Continua a studiare', color: '#EF4444' };
}

export default function ProgressiScreen({ refreshKey }: TabScreenProps) {
  const { colors } = useTheme();
  const { progress, loading, loadProgress } = useUserProgress();
  const { totalDue: reviewCount } = useReviewQueue();
  const [macroStats, setMacroStats] = useState<Record<string, MacroDetailStats>>({});
  const [weekData, setWeekData] = useState<Array<{
    short: string; isToday: boolean;
    questions: number; accuracy: number;
  }>>([]);
  const [weekVsLastWeek, setWeekVsLastWeek] = useState<{ thisWeek: number; lastWeek: number }>({ thisWeek: 0, lastWeek: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    loadDetailedStats();
  }, [refreshKey]);

  const loadDetailedStats = useCallback(async () => {
    setStatsLoading(true);
    const [macroResults, recent14] = await Promise.all([
      Promise.all(MACROS.map((m) => getMacroDetailStats(m.id))),
      getRecentDailyStats(14),
    ]);

    const map: Record<string, MacroDetailStats> = {};
    macroResults.forEach((s) => { map[s.macroId] = s; });
    setMacroStats(map);

    // Ultimi 7 giorni (indice 0 = 6 giorni fa, indice 6 = oggi)
    const days = Object.entries(recent14)
      .map(([dateStr, stats]) => {
        const d = new Date(dateStr);
        const short = ['D', 'L', 'M', 'M', 'G', 'V', 'S'][d.getDay()];
        const isToday = dateStr === new Date().toDateString();
        const acc = stats.questionsAnswered > 0
          ? Math.round((stats.correctCount / stats.questionsAnswered) * 100)
          : 0;
        return { day: dateStr, short, isToday, questions: stats.questionsAnswered, accuracy: acc };
      })
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

    setWeekData(days.slice(-7));

    // Confronto settimane
    const thisWeekTotal = days.slice(-7).reduce((sum, d) => sum + d.questions, 0);
    const lastWeekTotal = days.slice(0, 7).reduce((sum, d) => sum + d.questions, 0);
    setWeekVsLastWeek({ thisWeek: thisWeekTotal, lastWeek: lastWeekTotal });

    setStatsLoading(false);
  }, []);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const totalAnswered = useMemo(
    () => Object.values(macroStats).reduce((sum, s) => sum + s.answeredCount, 0),
    [macroStats]
  );
  const totalCorrect = useMemo(
    () => Object.values(macroStats).reduce((sum, s) => sum + s.correctCount, 0),
    [macroStats]
  );
  const totalRecovery = useMemo(
    () => Object.values(macroStats).reduce((sum, s) => sum + s.recoveryCount, 0),
    [macroStats]
  );
  const globalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const weakestMacro = useMemo(() => {
    const eligible = MACROS.filter((m) => (macroStats[m.id]?.answeredCount ?? 0) >= 10);
    if (eligible.length === 0) return null;
    return eligible.reduce((worst, m) =>
      (macroStats[m.id]?.accuracy ?? 100) < (macroStats[worst.id]?.accuracy ?? 100) ? m : worst
    );
  }, [macroStats]);

  const streak = progress?.currentStreak ?? 0;
  const masteredCount = progress?.masteredCount ?? 0;
  const totalStudyDays = progress?.totalStudyDays ?? 0;
  const totalMinutesWeek = weekData.reduce((sum, d) => {
    // minutesStudied not directly in weekData, but we used questions as proxy
    return sum;
  }, 0);

  const maxQuestions = Math.max(...weekData.map((d) => d.questions), 1);
  const readinessScore = calcReadiness(totalAnswered, globalAccuracy, streak, masteredCount);
  const { label: readinessLabelText, color: readinessColor } = readinessLabel(readinessScore);

  const weekDelta = weekVsLastWeek.thisWeek - weekVsLastWeek.lastWeek;

  if (loading || statsLoading) {
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>I tuoi progressi</Text>

        {/* Prontezza esame */}
        <View style={[styles.readinessCard, { borderColor: readinessColor }]}>
          <View style={styles.readinessRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>PRONTEZZA ESAME</Text>
              <Text style={[styles.readinessLabelText, { color: readinessColor }]}>
                {readinessLabelText}
              </Text>
            </View>
            <Text style={[styles.readinessScore, { color: readinessColor }]}>{readinessScore}%</Text>
          </View>
          <View style={styles.thinBarBg}>
            <View style={[styles.thinBarFill, { width: `${readinessScore}%`, backgroundColor: readinessColor }]} />
          </View>
          <View style={styles.readinessBreakdown}>
            <Text style={styles.breakdownItem}>
              Copertura {Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)}%
            </Text>
            <Text style={styles.breakdownItem}>Accuratezza {globalAccuracy}%</Text>
            <Text style={styles.breakdownItem}>
              Dominate {Math.round((masteredCount / TOTAL_QUESTIONS) * 100)}%
            </Text>
          </View>
        </View>

        {/* Avvisi veloci */}
        {reviewCount > 0 && (
          <View style={[styles.alertCard, { borderColor: colors.purple }]}>
            <Text style={[styles.alertText, { color: colors.purple }]}>
              📚 {reviewCount} {reviewCount === 1 ? 'domanda' : 'domande'} da ripassare oggi
            </Text>
          </View>
        )}

        {/* Stats globali */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>{totalAnswered}</Text>
            <Text style={styles.statLabel}>Domande viste</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{globalAccuracy}%</Text>
            <Text style={styles.statLabel}>Accuratezza</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>{masteredCount}</Text>
            <Text style={styles.statLabel}>Dominate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: totalRecovery > 0 ? '#22C55E' : colors.textSecondary }]}>
              {totalRecovery}
            </Text>
            <Text style={styles.statLabel}>In ripresa ↑</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.textSecondary }]}>{streak}</Text>
            <Text style={styles.statLabel}>Streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.textSecondary }]}>{totalStudyDays}</Text>
            <Text style={styles.statLabel}>Giorni studio</Text>
          </View>
        </View>

        {/* Grafico ultimi 7 giorni */}
        <Text style={styles.sectionTitle}>ULTIMI 7 GIORNI</Text>
        <View style={styles.chartCard}>
          {/* Barre domande */}
          <View style={styles.chartBars}>
            {weekData.map((d, i) => {
              const heightPct = d.questions > 0 ? (d.questions / maxQuestions) : 0;
              return (
                <View key={i} style={styles.chartBarCol}>
                  <Text style={styles.chartBarValue}>{d.questions > 0 ? d.questions : ''}</Text>
                  <View style={styles.chartBarTrack}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: `${Math.max(heightPct * 100, d.questions > 0 ? 6 : 0)}%`,
                          backgroundColor: d.isToday ? colors.purple : colors.border,
                        },
                      ]}
                    />
                  </View>
                  {/* Dot accuratezza */}
                  {d.questions > 0 && (
                    <View style={[
                      styles.accDot,
                      { backgroundColor: d.accuracy >= 80 ? '#22C55E' : d.accuracy >= 60 ? '#F59E0B' : '#EF4444' }
                    ]} />
                  )}
                  <Text style={[styles.chartBarLabel, d.isToday && { color: colors.purple, fontWeight: '600' }]}>
                    {d.short}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartSub}>Domande per giorno · punto = accuratezza</Text>

          {/* Confronto settimane */}
          {weekVsLastWeek.lastWeek > 0 && (
            <View style={[styles.weekCompare, { borderTopColor: colors.border }]}>
              <Text style={styles.weekCompareText}>
                Questa settimana: <Text style={{ fontWeight: '600', color: colors.textSecondary }}>{weekVsLastWeek.thisWeek}</Text> domande
              </Text>
              <Text style={[
                styles.weekCompareDelta,
                { color: weekDelta >= 0 ? '#22C55E' : '#EF4444' }
              ]}>
                {weekDelta >= 0 ? '+' : ''}{weekDelta} vs settimana scorsa
              </Text>
            </View>
          )}
        </View>

        {/* Area da rafforzare */}
        {weakestMacro && (
          <View style={[styles.focusCard, { borderColor: weakestMacro.color }]}>
            <Text style={styles.sectionLabel}>AREA DA RAFFORZARE</Text>
            <Text style={[styles.focusTitle, { color: weakestMacro.color }]}>{weakestMacro.title}</Text>
            <Text style={styles.focusSub}>
              {macroStats[weakestMacro.id]?.accuracy ?? 0}% di accuratezza — concentrati qui
            </Text>
          </View>
        )}

        {/* Dettaglio per macro */}
        <Text style={styles.sectionTitle}>DETTAGLIO PER AREA</Text>
        {MACROS.map((macro) => {
          const s = macroStats[macro.id];
          if (!s) return null;
          const pct = macro.totalQuestions > 0 ? Math.round((s.answeredCount / macro.totalQuestions) * 100) : 0;
          const accColor =
            s.answeredCount === 0 ? colors.textDim
            : s.accuracy >= 80 ? '#22C55E'
            : s.accuracy >= 60 ? '#F59E0B'
            : '#EF4444';

          return (
            <View key={macro.id} style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroColorDot, { backgroundColor: macro.color }]} />
                <Text style={styles.macroTitle}>{macro.title}</Text>
                {s.answeredCount > 0 && (
                  <Text style={[styles.macroAccuracy, { color: accColor }]}>{s.accuracy}%</Text>
                )}
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: macro.color }]} />
              </View>
              <View style={styles.macroMeta}>
                <Text style={styles.macroCount}>{s.answeredCount} / {macro.totalQuestions} viste</Text>
                <View style={styles.macroMetaRight}>
                  {s.recoveryCount > 0 && (
                    <Text style={[styles.macroTag, { color: '#22C55E' }]}>{s.recoveryCount} ↑</Text>
                  )}
                  {s.masteredCount > 0 && (
                    <Text style={[styles.macroTag, { color: colors.success }]}>{s.masteredCount} ★</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Domande più difficili */}
        {(() => {
          const hard = MACROS.flatMap((m) =>
            (macroStats[m.id]?.hardestQuestions ?? []).map((q) => ({
              ...q, macroColor: m.color, macroTitle: m.title,
            }))
          )
            .sort((a, b) => b.timesWrong - a.timesWrong)
            .slice(0, 5);
          if (hard.length === 0) return null;
          return (
            <>
              <Text style={styles.sectionTitle}>DOMANDE PIÙ DIFFICILI</Text>
              {hard.map((q) => (
                <View key={q.id} style={styles.hardCard}>
                  <View style={[styles.macroColorDot, { backgroundColor: q.macroColor, marginTop: 2 }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hardMacro}>{q.macroTitle}</Text>
                    <Text style={styles.hardId}>Domanda #{q.id}</Text>
                  </View>
                  <View style={styles.hardBadge}>
                    <Text style={[styles.hardStat, { color: '#EF4444' }]}>{q.timesWrong}✗</Text>
                    {q.timesCorrect > 0 && (
                      <Text style={[styles.hardStat, { color: '#22C55E' }]}>{q.timesCorrect}✓</Text>
                    )}
                  </View>
                </View>
              ))}
            </>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    scrollView: { flex: 1 },
    contentContainer: { padding: spacing.lg, paddingBottom: 40, gap: 12 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '500', color: colors.textPrimary, lineHeight: 32, marginBottom: 4 },
    sectionTitle: { fontSize: 10, fontWeight: '500', letterSpacing: 0.8, color: colors.textDim, marginTop: 4 },
    sectionLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, color: colors.textDim },

    // Prontezza
    readinessCard: { borderWidth: 1.5, borderRadius: 16, padding: spacing.lg, gap: 10 },
    readinessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    readinessLabelText: { fontSize: 16, fontWeight: '600', marginTop: 2 },
    readinessScore: { fontSize: 36, fontWeight: '700' },
    thinBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    thinBarFill: { height: '100%', borderRadius: 3 },
    readinessBreakdown: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    breakdownItem: { fontSize: 11, color: colors.textMuted },

    // Alert
    alertCard: {
      borderWidth: 1, borderRadius: 12, padding: spacing.md,
    },
    alertText: { fontSize: 13, fontWeight: '500' },

    // Stats grid
    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: {
      flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: spacing.lg, alignItems: 'center', gap: 4,
    },
    statNumber: { fontSize: 24, fontWeight: '600' },
    statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

    // Chart
    chartCard: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: spacing.lg, gap: 8,
    },
    chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
    chartBarCol: { flex: 1, alignItems: 'center', gap: 2 },
    chartBarValue: { fontSize: 9, color: colors.textDim, height: 12 },
    chartBarTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
    chartBarFill: { width: '100%', borderRadius: 3 },
    accDot: { width: 6, height: 6, borderRadius: 3 },
    chartBarLabel: { fontSize: 10, color: colors.textDim },
    chartSub: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
    weekCompare: { borderTopWidth: 1, paddingTop: 8, gap: 2 },
    weekCompareText: { fontSize: 12, color: colors.textMuted },
    weekCompareDelta: { fontSize: 12, fontWeight: '600' },

    // Focus
    focusCard: { borderWidth: 1.5, borderRadius: 14, padding: spacing.lg, gap: 4 },
    focusTitle: { fontSize: 18, fontWeight: '600' },
    focusSub: { fontSize: 12, color: colors.textMuted },

    // Macro
    macroCard: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: spacing.lg, gap: spacing.sm,
    },
    macroHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    macroColorDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    macroTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.textSecondary },
    macroAccuracy: { fontSize: 13, fontWeight: '600' },
    progressBarContainer: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 3 },
    macroMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    macroCount: { fontSize: 11, color: colors.textDim },
    macroMetaRight: { flexDirection: 'row', gap: 8 },
    macroTag: { fontSize: 11, fontWeight: '600' },

    // Hard questions
    hardCard: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: 10, padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    },
    hardMacro: { fontSize: 12, color: colors.textDim },
    hardId: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    hardBadge: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    hardStat: { fontSize: 13, fontWeight: '600' },
  });
}
