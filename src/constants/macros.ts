import { colors } from './theme';

export const MACROS = [
  {
    id: 'la-strada',
    title: 'La strada',
    color: colors.success,
    totalQuestions: 1301,
    categories: [
      'definizioni-generali-doveri-strada',
      'norme-di-circolazione',
      'limiti-di-velocita',
      'distanza-di-sicurezza',
    ],
  },
  {
    id: 'segnali-stradali',
    title: 'Segnali stradali',
    color: colors.purple,
    totalQuestions: 2462,
    categories: [
      'segnali-pericolo',
      'segnali-divieto',
      'segnali-obbligo',
      'segnali-precedenza',
      'segnali-indicazione',
    ],
  },
  {
    id: 'segnaletica-avanzata',
    title: 'Segnaletica avanzata',
    color: '#f59e0b',
    totalQuestions: 957,
    categories: [
      'segnaletica-orizzontale-ostacoli',
      'semafori-vigili',
      'segnali-complementari-cantiere',
      'pannelli-integrativi',
    ],
  },
  {
    id: 'manovre',
    title: 'Manovre',
    color: '#06b6d4',
    totalQuestions: 1094,
    categories: [
      'precedenza-incroci',
      'sorpasso',
      'fermata-sosta-arresto',
      'norme-varie-autostrade-pannelli',
    ],
  },
  {
    id: 'il-veicolo',
    title: 'Il veicolo',
    color: '#f97316',
    totalQuestions: 596,
    categories: [
      'elementi-veicolo-manutenzione-comportamenti',
      'luci-dispositivi-acustici',
      'cinture-casco-sicurezza',
    ],
  },
  {
    id: 'documenti-responsabilita',
    title: 'Documenti e responsabilità',
    color: '#ec4899',
    totalQuestions: 485,
    categories: [
      'patente-punti-documenti',
      'responsabilita-civile-penale-e-assicurazione',
      'incidenti-stradali-comportamenti',
    ],
  },
  {
    id: 'salute-ambiente',
    title: 'Salute e ambiente',
    color: '#10b981',
    totalQuestions: 244,
    categories: [
      'alcool-droga-primo-soccorso',
      'consumi-ambiente-inquinamento',
    ],
  },
];
