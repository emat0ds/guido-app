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

// ─── Content pools ────────────────────────────────────────────────────────────

const TIPS = [
  { title: 'Forse non lo sai 💡', body: 'Il 40% di chi boccia l\'esame sbaglia proprio sulle precedenze. Hai ripassato gli incroci?' },
  { title: 'Lo sapevi? 🚦', body: 'Con la pioggia in autostrada il limite scende a 110 km/h. Vale la pena ripassarlo.' },
  { title: 'Curiosità da patente 📖', body: 'Il triangolo d\'emergenza va a 50 m in autostrada, 30 m in città. Lo ricordavi?' },
  { title: 'Forse non lo sai 💡', body: 'Le strisce gialle = divieto di sosta per tutti. Le blu = sosta a pagamento. Differenza fondamentale.' },
  { title: 'Dato interessante 📊', body: 'Chi studia 15 minuti al giorno per 2 settimane ha più probabilità di passare di chi studia 3 ore il giorno prima.' },
  { title: 'Lo sapevi? 🚗', body: 'In Italia puoi guidare il motorino dal 14° anno. La patente B si prende a 18, ma il foglio rosa a 17.' },
  { title: 'Forse non lo sai 💡', body: 'La precedenza a destra vale solo se non ci sono altri segnali. In presenza di segnali, valgono quelli.' },
  { title: 'Curiosità da patente 📖', body: 'Il limite in centro abitato è 50 km/h, ma può salire a 70 se segnalato. Lo sapevi già?' },
];

const EVENING_DEFAULT = [
  { title: 'Momento di studio 📚', body: 'Dedicaci 10 minuti adesso. Domani ti ringrazierai.' },
  { title: 'Hai ancora tempo stasera ⏱️', body: '10 minuti di Guido adesso valgono più di un\'ora di ansia il giorno prima dell\'esame.' },
  { title: 'Piccolo sforzo, grande risultato 🎯', body: 'Anche solo 5 domande questa sera mantengono il ritmo.' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getEveningContent(streak: number, studiedYesterday: boolean): { title: string; body: string } {
  if (!studiedYesterday && streak === 0) {
    return {
      title: 'Hai saltato ieri 👀',
      body: 'Ieri non hai studiato. Anche solo 5 domande adesso rimettono tutto in moto.',
    };
  }
  if (streak >= 14) {
    return {
      title: `${streak} giorni consecutivi 🔥`,
      body: 'Sei una macchina. Non fermarti adesso — anche stasera, anche solo 5 minuti.',
    };
  }
  if (streak >= 7) {
    return {
      title: `Una settimana di fila! 🔥`,
      body: `${streak} giorni consecutivi. Stai costruendo qualcosa di solido. Mantieni il ritmo.`,
    };
  }
  if (streak >= 3) {
    return {
      title: `${streak} giorni di fila 🔥`,
      body: 'Ci sei dentro. Continua stasera e domani sarà ancora più facile.',
    };
  }
  return pickRandom(EVENING_DEFAULT);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export interface DailyReminderContext {
  studiedToday: boolean;
  streak: number;
  studiedYesterday: boolean;
}

// Call at app start. Schedules:
// - A morning tip at 9:00 (if not studied yet today)
// - An evening reminder at 20:00 (tomorrow if already studied)
export async function setupDailyReminder(ctx: DailyReminderContext): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const evening = getEveningContent(ctx.streak, ctx.studiedYesterday);

  // ── Evening reminder ──
  const eveningTrigger = new Date();
  eveningTrigger.setHours(20, 0, 0, 0);
  if (ctx.studiedToday || now.getHours() >= 20) {
    eveningTrigger.setDate(eveningTrigger.getDate() + 1);
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: evening.title, body: evening.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: eveningTrigger,
    },
  });

  // ── Morning tip (tomorrow at 9:00) ──
  const tip = pickRandom(TIPS);
  const morningTrigger = new Date();
  morningTrigger.setDate(morningTrigger.getDate() + 1);
  morningTrigger.setHours(9, 0, 0, 0);
  await Notifications.scheduleNotificationAsync({
    content: { title: tip.title, body: tip.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: morningTrigger,
    },
  });
}

// Call when user answers their first question of the day.
export async function onStudiedToday(streak: number): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // Evening reminder for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);

  const evening = getEveningContent(streak, true);
  await Notifications.scheduleNotificationAsync({
    content: { title: evening.title, body: evening.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });

  // Morning tip for tomorrow
  const tip = pickRandom(TIPS);
  const morning = new Date();
  morning.setDate(morning.getDate() + 1);
  morning.setHours(9, 0, 0, 0);
  await Notifications.scheduleNotificationAsync({
    content: { title: tip.title, body: tip.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: morning,
    },
  });
}
