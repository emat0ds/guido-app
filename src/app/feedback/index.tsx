import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { GuidoBubble } from '@/components/GuidoBubble';

export default function FeedbackScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={[typography.h1, styles.resultText]}>
            Risposta corretta!
          </Text>
          <Text
            style={[
              typography.body,
              {
                color: colors.textMuted,
                marginTop: spacing.md,
              },
            ]}
          >
            Il tuo ragionamento è corretto.
          </Text>
        </View>

        <GuidoBubble text="Continua così! Ogni risposta giusta ti avvicina alla patente." />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Vai avanti</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  resultBox: {
    backgroundColor: colors.successDim,
    borderWidth: 2,
    borderColor: colors.successBorder,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  resultText: {
    color: colors.success,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
