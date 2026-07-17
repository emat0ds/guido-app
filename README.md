# Fedal — Impara davvero le regole della strada

Un'app mobile per imparare le regole della strada italiana (patente B) **non per passare il quiz, ma per capire come si guida**.

Fedal è un progetto veloce e divertente, creato per rendere l'apprendimento del codice della strada più engaging.

## Caratteristiche

- **7.139 domande vero/falso** dal database MIT di Edoardo
- **Spaced repetition intelligente** — le domande sbagliate tornano al momento giusto
- **Onboarding interattivo** — ti spiega come funziona l'app
- **Gamification** — streak giornalieri, badge, stelle per macro-area
- **Nessuna registrazione** — tutto funziona offline, i progressi sono locali
- **Design premium** — dark mode, animazioni fluide, UX pulita

## Stack tecnico

- **Framework**: React Native + Expo SDK 57
- **Linguaggio**: TypeScript
- **Navigazione**: Expo Router (file-based)
- **Animazioni**: React Native Reanimated 3
- **Storage locale**: AsyncStorage
- **Build**: Expo EAS Build
- **Target**: iOS e Android

## Installazione

### Requisiti

- Node.js 16+ e npm
- Xcode (per iOS) o Android Studio (per Android)
- Expo Go (app su App Store/Google Play)

### Setup locale

```bash
# 1. Clona il progetto
git clone https://github.com/tuonome/fedal-app.git
cd fedal-app

# 2. Installa dipendenze
npm install

# 3. Avvia dev server
npm start

# 4. Scansiona il QR code con Expo Go
```

Poi nel terminale vedrai il QR code che puoi scansionare con il tuo telefono.

### Esegui nel simulatore

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Architettura

```
fedal-app/
├── src/
│   ├── app/                    # Schermate (Expo Router)
│   │   ├── (tabs)/            # Tab navigation
│   │   ├── lezione/           # Schermata lezione
│   │   ├── ripasso/           # Coda di ripasso
│   │   └── onboarding/        # Flusso onboarding
│   ├── components/            # Componenti riutilizzabili
│   ├── lib/                   # Logica (storage, progressi, API)
│   ├── hooks/                 # React hooks custom
│   └── constants/             # Design system, macro-aree
├── data/                      # Database domande (MIT License Edoardo)
└── docs/                      # Documentazione
```

## Design System

- **Tema**: Dark mode (#0f0f13 sfondo, #edeae4 testo)
- **Accent**: Purple (#5b3fff)
- **Tipografia**: Sistema gerarchico (h1-h3, body, small)
- **Spacing**: 8px base (xs: 4, sm: 8, md: 14, lg: 20, xl: 28)
- **Componenti**: Card, Button, Input, Badge con animazioni

Vedi `src/constants/theme.ts` per dettagli completi.

## Come funziona

1. **Onboarding** — Ti spiega come usare l'app, chiede il tuo nome
2. **Home** — Scegli una macro-area (La strada, Segnali stradali, ecc.)
3. **Lezione** — Leggi spiegazioni brevi, rispondi a domande, vedi il feedback
4. **Ripasso** — Le domande sbagliate tornano per la revisione (spaced repetition)
5. **Progressi** — Dashboard con statistiche per macro-area

## Licenza

**Fedal** è proprietaria. Tutti i diritti riservati.

Il **database domande** è distribuito sotto MIT License — vedi [LICENSE](LICENSE) per dettagli e attribuzioni.

## Privacy

Questa app **non raccoglie dati personali**. Tutto rimane sul tuo dispositivo. Vedi [PRIVACY.md](PRIVACY.md) per dettagli.

## Sicurezza

Per segnalare una vulnerabilità di sicurezza, contatta in privato.

Non aprire issue pubbliche per problemi di sicurezza. Vedi [SECURITY.md](SECURITY.md) per dettagli.

## Ringraziamenti

- **Database domande**: Edoardo (MIT License)
- **Framework**: Expo, React Native
- **Design e sviluppo**: Emanuele Todini

---

**Fatto da Emanuele Todini** | [GitHub](https://github.com/yourusername) | [Fedal](#)
