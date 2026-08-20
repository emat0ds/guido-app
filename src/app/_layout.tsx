import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { requestNotificationPermissions, setupDailyReminder } from '@/lib/notifications';
import { hasStudiedToday, hasStudiedYesterday, getCurrentStreak, runStatsMigrationIfNeeded } from '@/lib/storage';
import { trackAppOpen } from '@/lib/analytics';
import { MACROS } from '@/constants/macros';
import { restorePurchases } from '@/lib/iap';
import { BadgeProvider } from '@/contexts/BadgeContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

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
        const [studiedToday, studiedYesterday, streak] = await Promise.all([
          hasStudiedToday(),
          hasStudiedYesterday(),
          getCurrentStreak(),
        ]);
        await setupDailyReminder({ studiedToday, studiedYesterday, streak });
      }
    };
    setupNotifications();
    trackAppOpen();
    // Restore purchases silently — syncs premium status for coupon/promo users
    restorePurchases().catch(() => {});
    // Migration one-time: ricalcola contatori da QuestionState reali
    runStatsMigrationIfNeeded(MACROS.map((m) => ({ id: m.id, totalQuestions: m.totalQuestions })));
  }, []);

  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}

export default RootLayout;
