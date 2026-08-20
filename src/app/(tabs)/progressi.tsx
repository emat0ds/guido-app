import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { getMacroDetailStats, MacroDetailStats } from '@/lib/storage';
import { MACROS } from '@/constants/macros';
import type { TabScreenProps } from './_layout';

export default function ProgressiScreen({ refreshKey }: TabScreenProps) {
  const { colors } = useTheme();
  const { progress, loading, loadProgress } = useUserProgress();
  const [macroStats, setMacroStats] = useState<Record<string, MacroDetailStats>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    loadDetailedStats();
  }, [refreshKey]);

  const loadDetailedStats = useCallback(async () => {
    setStatsLoading(true);
    const results = await Promise.all(MACROS.map((m) => getMacroDetailStats(m.id)));
    const map: Record<string, MacroDetailStats> = {};
    results.forEach((s) => { map[s.macroId] = s; });
    setMacroStats(map);
    setStatsLoading(false);
  }, []);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Totali aggregati
  const totalAnswered = useMemo(
    () => Object.values(macroStats).reduce((sum, s) => sum + s.answeredCount, 0),
    [macroStats]
  );
  const totalCorrect = useMemo(
    () => Object.values(macroStats).reduce((sum, s) => sum + s.correctCount, 0),
    [macroStats]
  );
  const globalAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Macro più debole (min accuracy tra quelle con almeno 10 domande viste)
  const weakestMacro = useMemo(() => {
    const eligible = MACROS.filter((m) => (macroStats[m.id]?.answeredCount ?? 0) >= 10);
    if (eligible.length === 0) return null;
    return eligible.reduce((worst, m) =>
      (macroStats[m.id]?.accuracy ?? 100) < (macroStats[worst.id]?.accuracy ?? 100) ? m : worst
    );
  }, [macroStats]);

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

        {/* Card: focus area */}
        {weakestMacro && (
          <View style={[styles.focusCard, { borderColor: weakestMacro.color }]}>
            <Text style={styles.focusLabel}>AREA DA RAFFORZARE</Text>
            <Text style={[styles.focusTitle, { color: weakestMacro.color }]}>
              {weakestMacro.title}
            </Text>
            <Text style={styles.focusSub}>
              {macroStats[weakestMacro.id]?.accuracy ?? 0}% di accuratezza — continua a esercitarti
            </Text>
          </View>
        )}

        {/* Statistiche globali */}
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
            <Text style={[styles.statNumber, { color: colors.purple }]}>
              {progress?.masteredCount || 0}
            </Text>
            <Text style={styles.statLabel}>Dominate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.textSecondary }]}>
              {progress?.totalStudyDays || 0}
            </Text>
            <Text style={styles.statLabel}>Giorni di studio</Text>
          </View>
        </View>

        {/* Dettaglio per macro */}
        <Text style={styles.sectionTitle}>DETTAGLIO PER AREA</Text>

        {MACROS.map((macro) => {
          const s = macroStats[macro.id];
          if (!s) return null;
          const pct = macro.totalQuestions > 0
            ? Math.round((s.answeredCount / macro.totalQuestions) * 100)
            : 0;

          // Colore accuratezza
          const accColor =
            s.answeredCount === 0 ? colors.textDim
            : s.accuracy >= 80 ? colors.success
            : s.accuracy >= 60 ? '#F59E0B'
            : colors.error;

          return (
            <View key={macro.id} style={styles.macroCard}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroColorDot, { backgroundColor: macro.color }]} />
                <Text style={styles.macroTitle}>{macro.title}</Text>
                {s.answeredCount > 0 && (
                  <Text style={[styles.macroAccuracy, { color: accColor }]}>
                    {s.accuracy}% ✓
                  </Text>
                )}
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: macro.color }]} />
              </View>

              <View style={styles.macroMeta}>
                <Text style={styles.macroCount}>
                  {s.answeredCount} / {macro.totalQuestions} viste
                </Text>
                {s.masteredCount > 0 && (
                  <Text style={[styles.macroDominate, { color: colors.success }]}>
                    {s.masteredCount} dominate
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Domande più difficili */}
        {(() => {
          const hard = MACROS.flatMap((m) =>
            (macroStats[m.id]?.hardestQuestions ?? []).map((q) => ({ ...q, macroColor: m.color, macroTitle: m.title }))
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
                    <Text style={[styles.hardWrong, { color: colors.error }]}>
                      {q.timesWrong}✗
                    </Text>
                    {q.timesCorrect > 0 && (
                      <Text style={[styles.hardCorrect, { color: colors.success }]}>
                        {q.timesCorrect}✓
                      </Text>
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
    title: {
      fontSize: 26,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: 4,
    },
    focusCard: {
      borderWidth: 1.5,
      borderRadius: 14,
      padding: spacing.lg,
      gap: 4,
    },
    focusLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.8,
      color: colors.textDim,
    },
    focusTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    focusSub: {
      fontSize: 12,
      color: colors.textMuted,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.lg,
      alignItems: 'center',
      gap: 4,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '600',
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.8,
      color: colors.textDim,
      marginTop: 8,
    },
    macroCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    macroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    macroColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      flexShrink: 0,
    },
    macroTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    macroAccuracy: {
      fontSize: 13,
      fontWeight: '600',
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
    },
    macroMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    macroCount: {
      fontSize: 11,
      color: colors.textDim,
    },
    macroDominate: {
      fontSize: 11,
      fontWeight: '500',
    },
    hardCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    hardMacro: {
      fontSize: 12,
      color: colors.textDim,
    },
    hardId: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    hardBadge: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    hardWrong: {
      fontSize: 13,
      fontWeight: '600',
    },
    hardCorrect: {
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
