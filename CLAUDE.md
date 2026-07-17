# Guido — CLAUDE.md

## Cos'è Guido

Guido è un'app mobile per imparare le regole della strada in vista dell'esame della patente B italiana. Il posizionamento è preciso: **non un'app per passare il quiz, ma un'app per capire come si guida**.

Il personaggio è Guido — un istruttore di scuola guida virtuale, diretto e un po' burbero ma affidabile. Il claim è: **Guido. Ragionando.**

---

## Stack tecnico

- **Framework**: React Native con Expo (SDK 51+)
- **Navigazione**: Expo Router (file-based routing)
- **Storage locale**: AsyncStorage per progressi utente
- **Animazioni**: React Native Reanimated 3
- **AI**: Anthropic Claude API (claude-haiku-4-5-20251001) per domande situazionali generate
- **Build**: Expo EAS Build (no Xcode locale)
- **Target**: iOS e Android

### Struttura cartelle

```
/app
  /(tabs)
    index.tsx          # Home screen
    progressi.tsx      # Dashboard progressi
    badge.tsx          # Badge e gamification
    profilo.tsx        # Profilo utente
  /lezione
    [macroId].tsx      # Schermata lezione (teoria + quiz)
  /feedback
    index.tsx          # Schermata feedback risposta
/components
  GuidoBubble.tsx      # Avatar G + bubble testo di Guido
  ModuleCard.tsx       # Card macro-area (home)
  TheoryCard.tsx       # Card teoria (lezione)
  QuestionCard.tsx     # Card domanda vero/falso e multipla
  AnswerButton.tsx     # Bottone risposta
  ProgressRing.tsx     # Cerchio progresso SVG
  StreakBar.tsx        # Barra giorni consecutivi
/data
  questions_with_explanations.json   # Database 7139 domande
/lib
  progress.ts          # Logica progressi e spaced repetition
  questions.ts         # Utility per filtrare/selezionare domande
  claude.ts            # Chiamate API Claude per domande situazionali
/constants
  theme.ts             # Colori, tipografia, spacing
  macros.ts            # Definizione 7 macro-aree
```

---

## Design System

### Filosofia visiva
Dark mode come default. Tipografia grande e ariosa. Una schermata = un concetto. Elementi grafici geometrici (SVG stilizzati), non icone decorative o emoji. Tutto deve sembrare premium e giovane, lontano dall'estetica ministeriale.

### Palette colori

```typescript
// constants/theme.ts
export const colors = {
  // Backgrounds
  bg:          '#0f0f13',   // sfondo principale
  surface:     '#13111f',   // card attiva / superficie elevata
  surfaceAlt:  '#141417',   // card neutra
  surfaceDone: '#141a14',   // card completata
  border:      '#1e1e28',   // bordi sottili

  // Brand
  purple:      '#5b3fff',   // accent primario
  purpleLight: '#a89fff',   // accent leggero / testo colorato
  purpleDim:   '#1e1a3a',   // sfondo accent

  // Stati
  success:     '#4caf50',   // completato / risposta corretta
  successDim:  '#141a14',   // sfondo success
  successBorder: '#1e2e1e',
  error:       '#e74c3c',   // sbagliato
  errorDim:    '#1a1414',   // sfondo error
  errorBorder: '#2e1e1e',

  // Testo
  textPrimary:   '#edeae4', // titoli
  textSecondary: '#ddd8d0', // corpo
  textMuted:     '#888888', // secondario
  textDim:       '#555555', // hint / label
  textDisabled:  '#333333', // bloccato
}
```

### Tipografia

```typescript
export const typography = {
  // Font: System default (SF Pro su iOS, Roboto su Android)
  h1: { fontSize: 26, fontWeight: '500', color: colors.textPrimary, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '500', color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '500', color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textSecondary, lineHeight: 22 },
  small: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 0.8, color: colors.textDim },
  question: { fontSize: 15, fontWeight: '500', color: colors.textPrimary, lineHeight: 24 },
}
```

### Spacing e border radius

```typescript
export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 }
export const radius = { sm: 8, md: 12, lg: 14, full: 999 }
```

---

## Macro-aree

```typescript
// constants/macros.ts
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
]
```

---

## Flusso di apprendimento

### Struttura di una lezione

Ogni macro-area è divisa in sessioni. Una sessione segue questo schema fisso:

```
[TheoryCard] → [TheoryCard] → [QuestionCard] → [QuestionCard]
→ [TheoryCard] → [QuestionCard] → [Ripasso domande precedenti]
```

Regola: mai più di 2 card teoria consecutive prima di una domanda. Mai più di 3 domande consecutive senza una card teoria.

### Tipi di domande

1. **Vero/Falso** (database MIT) — 2 bottoni, risposta immediata
2. **Multipla situazionale** (generata da Claude API) — 3 opzioni A/B/C con scenario reale. Disponibile solo dopo aver completato la teoria della macro-area corrente.

### Feedback risposta

**Risposta corretta:**
- Bottone diventa verde con animazione leggera (scale 1.02)
- Guido commenta brevemente con rinforzo positivo
- Avanza automaticamente dopo 1.5 secondi

**Risposta sbagliata:**
- Bottone sbagliato diventa rosso, quello corretto verde
- Box feedback rosso: spiega cosa è sbagliato nella risposta data
- Guido bubble: commenta con la sua voce (field `explanation` dal database)
- L'utente deve premere "Vai avanti" (non avanza automaticamente)
- La domanda viene aggiunta alla coda di ripasso

### Spaced repetition (lib/progress.ts)

Ogni domanda ha uno stato per utente:
```typescript
type QuestionState = {
  id: number
  timesCorrect: number
  timesWrong: number
  lastSeen: number       // timestamp
  nextReview: number     // timestamp calcolato
  mastered: boolean      // true se corretta 3 volte di fila
}
```

Calcolo `nextReview`:
- 0 errori, 1 risposta corretta → ripassa tra 1 giorno
- 0 errori, 2 risposte corrette → ripassa tra 3 giorni
- 0 errori, 3+ risposte corrette → mastered, esce dalla rotazione
- Ogni errore → ripassa nella sessione stessa, poi tra 1 giorno

---

## Componente GuidoBubble

Il personaggio di Guido è presente in tutta l'app come avatar + bubble. Non è un'illustrazione — è una "G" tipografica.

```tsx
// components/GuidoBubble.tsx
// Avatar: cerchio 32x32, bg #1e1a3a, border 1px #3d2fff33
// Lettera G: fontSize 13, fontWeight 500, color #7c6fff
// Bubble: bg #1a1826, border-radius 12, top-left-radius 4
// Testo: fontSize 12, color #888, lineHeight 20
// Parti enfatizzate: color #a89fff (purpleLight)
```

**Tono di Guido nei testi:**
- Diretto, mai scortese
- Usa analogie semplici ("pensa alla corsia come al corridoio di un treno")
- Non dice mai "La risposta corretta è..." — va dritto alla spiegazione
- Quando corregge un errore comune dice "Questo è uno degli errori più comuni"
- Mai accademico, mai ministeriale

---

## Gamification

### Stelle per macro-area
- ⭐ = completata con 60-79% corretto
- ⭐⭐ = completata con 80-89% corretto
- ⭐⭐⭐ = completata con 90%+ corretto

### Streak
- Barra di 7 giorni nella home
- Ogni giorno con almeno una sessione completata conta
- Colore accent (#5b3fff) per i giorni fatti, muted per i futuri

### Sblocco progressivo
Le macro-aree si sbloccano in ordine. Una macro-area si sblocca quando la precedente raggiunge almeno ⭐ (60%).

### Badge (esempi)
- "Prima curva" — completa la prima sessione
- "Semaforo verde" — completa Segnali stradali
- "Senza graffi" — completa una sessione senza errori
- "Istruttore soddisfatto" — raggiungi ⭐⭐⭐ su tutte le macro-aree

---

## Domande situazionali (Claude API)

Disponibili dopo aver completato la teoria di una macro-area. Vengono generate on-demand e cachate in AsyncStorage.

### Prompt sistema per generazione

```
Sei Guido, un istruttore di scuola guida italiano esperto e diretto.
Genera una domanda situazionale a risposta multipla (3 opzioni) per un ragazzo di 18 anni 
che sta studiando la patente B. La domanda deve:
- Descrivere uno scenario reale di guida in 1-2 frasi
- Avere 3 opzioni (A, B, C) plausibili — non rendere ovvia la risposta sbagliata
- Indicare la risposta corretta
- Spiegare in 2-3 frasi perché le opzioni sbagliate sono sbagliate
- Riguardare l'argomento: [MACRO_AREA]
- Non ripetere domande già fatte in questa sessione: [DOMANDE_PRECEDENTI]
Rispondi SOLO con JSON: { question, options: [{label, text}], correct, explanations: {A, B, C} }
```

---

## Schermate principali

### Home (tabs/index.tsx)

- Header: "Guido. Ragionando." (label piccolo) + saluto personalizzato (h1)
- Top-right: ProgressRing con percentuale completamento totale
- Sotto saluto: StreakBar (7 giorni)
- Lista ModuleCard per ogni macro-area
- In fondo: box "Ripassiamo?" con count domande in coda

### Lezione ([macroId].tsx)

- Barra progresso in alto (step corrente / totale sessione)
- Alterna TheoryCard e QuestionCard secondo lo schema
- GuidoBubble dopo ogni teoria e dopo ogni feedback

### Progressi (tabs/progressi.tsx)

- Una card per macro-area con stelle, percentuale, domande masterate
- Grafico semplice degli ultimi 7 giorni di attività

### Profilo (tabs/profilo.tsx)

- Nome utente
- Stats: giorni totali, domande masterate, errori corretti
- Impostazioni: notifiche ripasso giornaliero

---

## Note importanti

- Il database `questions_with_explanations.json` va copiato in `/data/`. È read-only a runtime.
- Le immagini dei segnali sono in `/assets/img_sign/` (PNG dal repository originale).
- Non usare `expo-av` o moduli nativi pesanti — tenere il bundle leggero.
- Tutto il testo dell'app è in italiano.
- Nessuna registrazione obbligatoria — l'app funziona offline, i progressi sono locali.
