import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { buildExamSession } from '@/lib/exam';
import { saveExamSession } from '@/lib/storage';
import {
  isPremium,
  getExamCount,
  purchasePremium,
  restorePurchases,
} from '@/lib/iap';

export default function EsameScreen() {
  const router = useRouter();
  const [premium, setPremiumState] = useState(false);
  const [examCount, setExamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [starting, setStarting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [p, c] = await Promise.all([isPremium(), getExamCount()]);
        if (active) {
          setPremiumState(p);
          setExamCount(c);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const canStartFree = examCount === 0;
  const canStart = premium || canStartFree;

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const questions = await buildExamSession();
      await saveExamSession({
        questions,
        answers: new Array(questions.length).fill(null),
        startedAt: Date.now(),
      });
      router.push('/esame/sessione' as any);
    } catch (e) {
      Alert.alert('Errore', 'Impossibile caricare le domande. Riprova.');
    } finally {
      setStarting(false);
    }
  };

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await purchasePremium();
      if (result.success) {
        setPremiumState(true);
        Alert.alert('Acquisto completato', 'Hai sbloccato gli esami simulati illimitati.');
      } else if (result.error) {
        Alert.alert('Acquisto non riuscito', result.error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.hasPremium) {
        setPremiumState(true);
        Alert.alert('Ripristino completato', 'Il tuo accesso premium è stato ripristinato.');
      } else if (result.success) {
        Alert.alert('Nessun acquisto trovato', 'Non abbiamo trovato acquisti precedenti associati al tuo account.');
      } else {
        Alert.alert('Errore', result.error || 'Errore nel ripristino degli acquisti.');
      }
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Esame Simulato</Text>
        <Text style={styles.subtitle}>
          Allenati come se fossi alla motorizzazione.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>40</Text>
            <Text style={styles.statLabel}>domande</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>30'</Text>
            <Text style={styles.statLabel}>minuti</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>errori max</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Come funziona</Text>
          <Text style={styles.infoItem}>• Le domande coprono tutte le macro-aree</Text>
          <Text style={styles.infoItem}>• Non vedi il feedback durante l'esame</Text>
          <Text style={styles.infoItem}>• Devi rispondere entro 30 minuti</Text>
          <Text style={styles.infoItem}>• Con 4 o meno errori: PROMOSSO</Text>
          <Text style={styles.infoItem}>• Dopo puoi rivedere tutto con Guido</Text>
        </View>

        {canStart ? (
          <TouchableOpacity
            style={[styles.primaryButton, starting && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {canStartFree && !premium ? 'Inizia esame gratuito' : 'Inizia esame'}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.paywallBox}>
            <Text style={styles.paywallTitle}>Sblocca esami illimitati</Text>
            <Text style={styles.paywallBody}>
              Hai già usato il tuo esame gratuito. Per continuare ad allenarti, acquista l'accesso illimitato.
            </Text>
            <Text style={styles.paywallNote}>Una tantum — nessun abbonamento</Text>

            <TouchableOpacity
              style={[styles.primaryButton, purchasing && styles.buttonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Acquista — €3,49</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={restoring}
            >
              <Text style={styles.restoreButtonText}>
                {restoring ? 'Ripristino in corso...' : 'Ripristina acquisti'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {canStartFree && !premium && (
          <Text style={styles.freeNote}>
            Il primo esame è gratuito. Dal secondo in poi è richiesto l'acquisto.
          </Text>
        )}

        {premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium — esami illimitati</Text>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    gap: 6,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  paywallBox: {
    backgroundColor: colors.purpleDim,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  paywallTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paywallBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  paywallNote: {
    fontSize: 11,
    color: colors.purpleLight,
    fontWeight: '500',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  restoreButtonText: {
    fontSize: 13,
    color: colors.textDim,
    textDecorationLine: 'underline',
  },
  freeNote: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
  premiumBadge: {
    alignSelf: 'center',
    backgroundColor: colors.purpleDim,
    borderWidth: 1,
    borderColor: colors.purple,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  premiumBadgeText: {
    fontSize: 11,
    color: colors.purpleLight,
    fontWeight: '500',
  },
});
