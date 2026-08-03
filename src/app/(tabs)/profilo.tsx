import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { clearAllProgress } from '@/lib/storage';

const CHECKLIST_KEY = 'patente_checklist';

const CHECKLIST_ITEMS = [
  'Visita medica presso la ASL o un medico abilitato',
  'Iscrizione in autoscuola',
  'Esame teorico (questo è Guido!)',
  'Esame di guida in autostrada (foglio rosa)',
  'Esame pratico in Motorizzazione',
];

export default function ProfiloScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { progress, loading, loadProgress } = useUserProgress();
  const [checklist, setChecklist] = useState<boolean[]>(
    Array(CHECKLIST_ITEMS.length).fill(false)
  );

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_KEY).then((data) => {
      if (data) setChecklist(JSON.parse(data));
    });
  }, []);

  const toggleItem = useCallback(async (index: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleResetProgress = async () => {
    await clearAllProgress();
    await loadProgress();
  };

  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (loading) {
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

  const correctAnswers = Object.values(progress?.macroProgress ?? {}).reduce(
    (sum, m) => sum + m.correctAnswers,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Profilo</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {progress?.userName ? progress.userName[0].toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={{ fontSize: 20, fontWeight: '500', color: colors.textPrimary }}>
              {progress?.userName || 'Studente'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: spacing.xs }}>
              Studente da {progress?.totalStudyDays || 0} giorni
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>STATISTICHE</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Domande risolte</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.purple }}>
              {correctAnswers}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Domande dominate</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.success }}>
              {progress?.masteredCount || 0}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Crashate</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.error }}>
              {progress?.wrongCount || 0}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>COME SI PRENDE LA PATENTE</Text>

        <View style={styles.checklistCard}>
          {CHECKLIST_ITEMS.map((item, index) => {
            const done = checklist[index];
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.checklistRow,
                  index < CHECKLIST_ITEMS.length - 1 && styles.checklistRowBorder,
                ]}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.checkMark, done && styles.checkMarkDone]}>
                  {done ? '✓' : '◻'}
                </Text>
                <Text style={[styles.checklistText, done && styles.checklistTextDone]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.autoscuolaButton}
          onPress={() => Linking.openURL('https://www.ilportaledellautomobilista.it')}
          activeOpacity={0.8}
        >
          <Text style={styles.autoscuolaButtonText}>Trova un'autoscuola vicino a te →</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>IMPOSTAZIONI</Text>

        <View style={styles.settingRow}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>
            Tema scuro
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.purple }}
            thumbColor={isDark ? colors.purpleLight : colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { borderColor: colors.errorBorder }]}
          onPress={handleResetProgress}
        >
          <Text style={{ fontSize: 14, color: colors.error, lineHeight: 22 }}>
            Cancella progressi
          </Text>
          <Text style={{ color: colors.error }}>×</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '500',
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: spacing.lg,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: colors.purpleDim,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.purpleLight,
    },
    profileInfo: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: '500',
      letterSpacing: 0.8,
      color: colors.textDim,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    statsCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    statLabel: {
      fontSize: 14,
      lineHeight: 22,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    checklistCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    checklistRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    checklistRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    checkMark: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 22,
      width: 18,
    },
    checkMarkDone: {
      color: colors.success,
    },
    checklistText: {
      flex: 1,
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 22,
    },
    checklistTextDone: {
      color: colors.success,
    },
    autoscuolaButton: {
      backgroundColor: colors.purpleDim,
      borderWidth: 1,
      borderColor: colors.purple,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.md,
    },
    autoscuolaButtonText: {
      color: colors.purpleLight,
      fontSize: 14,
      fontWeight: '500',
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginVertical: spacing.xs,
    },
  });
}
