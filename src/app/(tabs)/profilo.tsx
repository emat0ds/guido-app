import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, radius } from '@/constants/theme';
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={[typography.h2, { color: colors.textSecondary }]}>
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
  const errors = correctAnswers > 0 ? Math.floor(correctAnswers * 0.15) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[typography.h1, styles.title]}>Profilo</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {progress?.userName ? progress.userName[0].toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={typography.h2}>{progress?.userName || 'Studente'}</Text>
            <Text style={[typography.small, { color: colors.textMuted, marginTop: spacing.xs }]}>
              Studente da {progress?.totalStudyDays || 0} giorni
            </Text>
          </View>
        </View>

        <Text style={[typography.label, styles.sectionTitle]}>STATISTICHE</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Domande risolte
            </Text>
            <Text style={[typography.h3, { color: colors.purple, fontWeight: '600' }]}>
              {correctAnswers}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Domande masterate
            </Text>
            <Text style={[typography.h3, { color: colors.success, fontWeight: '600' }]}>
              {progress?.masteredCount || 0}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Errori corretti
            </Text>
            <Text style={[typography.h3, { color: colors.error, fontWeight: '600' }]}>
              {errors}
            </Text>
          </View>
        </View>

        <Text style={[typography.label, styles.sectionTitle]}>
          COME SI PRENDE LA PATENTE
        </Text>

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
          onPress={() =>
            Linking.openURL('https://www.ilportaledellautomobilista.it')
          }
          activeOpacity={0.8}
        >
          <Text style={styles.autoscuolaButtonText}>
            Trova un'autoscuola vicino a te →
          </Text>
        </TouchableOpacity>

        <Text style={[typography.label, styles.sectionTitle]}>IMPOSTAZIONI</Text>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={typography.body}>Notifiche giornaliere</Text>
          <Text style={{ color: colors.purple }}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow}>
          <Text style={typography.body}>Tema scuro</Text>
          <Text style={{ color: colors.purple }}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderColor: colors.errorBorder }]}
          onPress={handleResetProgress}
        >
          <Text style={[typography.body, { color: colors.error }]}>
            Cancella progressi
          </Text>
          <Text style={{ color: colors.error }}>×</Text>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  checklistCard: {
    backgroundColor: '#13111f',
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
    color: '#888888',
    lineHeight: 22,
    width: 18,
  },
  checkMarkDone: {
    color: '#3d7a3d',
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#888888',
    lineHeight: 22,
  },
  checklistTextDone: {
    color: '#3d7a3d',
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
