import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Call at app start. studiedToday=true → schedule for tomorrow.
export async function setupDailyReminder(studiedToday: boolean): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const trigger = new Date();
  trigger.setHours(20, 0, 0, 0);

  // If already studied today or it's past 20:00, fire tomorrow
  if (studiedToday || now.getHours() >= 20) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Non perdere il tuo streak! 🔥',
      body: 'Hai ancora tempo per studiare oggi. Anche solo 5 minuti contano!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

// Call when user answers their first question of the day.
// Cancels today's reminder and reschedules for tomorrow.
export async function onStudiedToday(): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Non perdere il tuo streak! 🔥',
      body: 'Hai ancora tempo per studiare oggi. Anche solo 5 minuti contano!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });
}
