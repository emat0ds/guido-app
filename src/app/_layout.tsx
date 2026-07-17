import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

Sentry.init({
  // Sostituisci con il tuo DSN da sentry.io → Project Settings → Client Keys
  dsn: 'REPLACE_WITH_YOUR_DSN',
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  // Disabilita in sviluppo per non sporcare le statistiche
  enabled: !__DEV__,
});

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { isOnboardingComplete, loading } = useOnboarding();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!isOnboardingComplete ? (
        <Stack.Screen name="onboarding/index" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lezione/[macroId]" />
          <Stack.Screen name="ripasso/index" />
          <Stack.Screen name="feedback/index" />
        </>
      )}
    </Stack>
  );
}

export default Sentry.wrap(RootLayout);
