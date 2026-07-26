import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

Sentry.init({
  dsn: 'https://88d9b9464c4af9bc728bf5d7eb119dce@o4511750197870592.ingest.de.sentry.io/4511750229852240',
  sendDefaultPii: true,
  enableLogs: true,
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
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
