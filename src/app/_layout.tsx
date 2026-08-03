import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useOnboarding } from '@/hooks/useOnboarding';
import { requestNotificationPermissions, setupDailyReminder } from '@/lib/notifications';
import { hasStudiedToday } from '@/lib/storage';
import { BadgeProvider } from '@/contexts/BadgeContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

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

function ThemedStack() {
  const { colors } = useTheme();
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
    <BadgeProvider>
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
    </BadgeProvider>
  );
}

function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        const studied = await hasStudiedToday();
        await setupDailyReminder(studied);
      }
    };
    setupNotifications();
  }, []);

  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
