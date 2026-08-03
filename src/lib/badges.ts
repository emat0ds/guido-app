export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const ALL_BADGES: BadgeDef[] = [
  {
    id: 'prima-curva',
    name: 'Prima curva',
    emoji: '🎯',
    description: 'Hai completato la tua prima sessione',
  },
  {
    id: 'in-forma',
    name: 'In forma!',
    emoji: '💪',
    description: '5 risposte giuste di fila — stai carburando',
  },
  {
    id: 'ottimo',
    name: 'Ottimo!',
    emoji: '🌟',
    description: '10 risposte giuste di fila — roba seria',
  },
  {
    id: 'inarrestabile',
    name: 'Inarrestabile!',
    emoji: '🚀',
    description: '20 risposte giuste di fila — non ci credo',
  },
  {
    id: 'pronto-esame',
    name: "Pronto per l'esame!",
    emoji: '🎓',
    description: 'Hai completato un esame simulato',
  },
  {
    id: 'semaforo-verde',
    name: 'Semaforo verde',
    emoji: '🚦',
    description: 'Hai completato i Segnali stradali',
  },
  {
    id: 'senza-graffi',
    name: 'Senza graffi',
    emoji: '✨',
    description: 'Sessione completata senza un solo errore',
  },
  {
    id: 'istruttore-soddisfatto',
    name: 'Istruttore soddisfatto',
    emoji: '👨‍🏫',
    description: '⭐⭐⭐ su tutte le macro-aree — sei pronto',
  },
];

// Returns the badge to unlock if the consecutive count hits a threshold.
export function getBadgeForConsecutive(count: number): BadgeDef | null {
  if (count === 20) return ALL_BADGES.find((b) => b.id === 'inarrestabile') ?? null;
  if (count === 10) return ALL_BADGES.find((b) => b.id === 'ottimo') ?? null;
  if (count === 5) return ALL_BADGES.find((b) => b.id === 'in-forma') ?? null;
  return null;
}

export function getBadgeById(id: string): BadgeDef | null {
  return ALL_BADGES.find((b) => b.id === id) ?? null;
}
