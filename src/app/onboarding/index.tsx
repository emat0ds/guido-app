import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';
import { saveUserName, getUserName } from '@/lib/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const [currentScreen, setCurrentScreen] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getUserName().then((saved) => {
      if (saved) setUserName(saved);
    });
  }, []);

  const handleNext = async () => {
    if (currentScreen === 1) {
      if (!userName.trim()) return;
      await saveUserName(userName.trim());
    }

    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      await completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {currentScreen === 0 && <WelcomeScreen onNext={handleNext} />}
      {currentScreen === 1 && (
        <NameScreen
          userName={userName}
          onUserNameChange={setUserName}
          onNext={handleNext}
        />
      )}
      {currentScreen === 2 && <HowItWorksScreen onNext={handleNext} />}
    </SafeAreaView>
  );
}

// ─── Screen 1: Benvenuto ─────────────────────────────────────────────────────

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.claim}>Guido. Ragionando.</Text>

      <View style={styles.centerBlock}>
        <Text style={styles.heroTitle}>
          Impara davvero le regole della strada.
        </Text>
        <Text style={styles.heroSub}>
          Non per passare il quiz. Per capire come si guida.
        </Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>Iniziamo</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 2: Nome ──────────────────────────────────────────────────────────

function NameScreen({
  userName,
  onUserNameChange,
  onNext,
}: {
  userName: string;
  onUserNameChange: (v: string) => void;
  onNext: () => void;
}) {
  const canAdvance = userName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.centerBlock}>
        <Text style={styles.nameTitle}>Come ti chiamo?</Text>
        <TextInput
          style={styles.input}
          placeholder="Il tuo nome"
          placeholderTextColor="#444"
          value={userName}
          onChangeText={onUserNameChange}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={canAdvance ? onNext : undefined}
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, !canAdvance && styles.btnDisabled]}
        onPress={onNext}
        disabled={!canAdvance}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>Avanti</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// ─── Screen 3: Come funziona ─────────────────────────────────────────────────

const CARDS = [
  {
    title: 'Prima Guido spiega',
    text: 'Ogni argomento inizia con una spiegazione breve. Niente muri di testo.',
  },
  {
    title: 'Poi metti alla prova',
    text: 'Domande vero/falso. Sbagli? Guido ti spiega perché — non ti dice solo che hai sbagliato.',
  },
  {
    title: 'Poi ripassi',
    text: 'Le domande che hai sbagliato tornano. Finché non le sai davvero.',
  },
];

function HowItWorksScreen({ onNext }: { onNext: () => void }) {
  const [index, setIndex] = useState(0);
  const isLast = index === CARDS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onNext();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.centerBlock}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{CARDS[index].title}</Text>
          <Text style={styles.cardText}>{CARDS[index].text}</Text>
        </View>

        <View style={styles.dots}>
          {CARDS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{isLast ? 'Cominciamo' : 'Avanti'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },

  // Screen 1
  claim: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
    marginTop: 8,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#edeae4',
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 15,
    color: '#555',
    marginTop: 12,
    lineHeight: 22,
  },

  // Screen 2
  nameTitle: {
    fontSize: 26,
    fontWeight: '500',
    color: '#edeae4',
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#13111f',
    borderWidth: 1,
    borderColor: '#2a2a35',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#edeae4',
  },

  // Screen 3
  card: {
    backgroundColor: '#13111f',
    borderLeftWidth: 3,
    borderLeftColor: '#5b3fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#a89fff',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e1e28',
  },
  dotActive: {
    backgroundColor: '#5b3fff',
    width: 18,
  },

  // Button
  btn: {
    backgroundColor: '#5b3fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
