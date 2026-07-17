# Architettura di Guido

Una panoramica completa della struttura del progetto.

## Struttura cartelle

```
guido-app/
├── src/
│   ├── app/                          # Schermate (Expo Router)
│   │   ├── _layout.tsx               # Root layout, onboarding check
│   │   ├── (tabs)/                   # Tab navigation
│   │   │   ├── _layout.tsx           # Tab bar config
│   │   │   ├── index.tsx             # Home screen
│   │   │   ├── progressi.tsx         # Progress dashboard
│   │   │   ├── badge.tsx             # Achievements
│   │   │   └── profilo.tsx           # User profile
│   │   ├── onboarding/
│   │   │   └── index.tsx             # Onboarding flow (3 screens)
│   │   ├── lezione/
│   │   │   └── [macroId].tsx         # Lesson screen (dynamic)
│   │   ├── ripasso/
│   │   │   └── index.tsx             # Review queue
│   │   └── feedback/
│   │       └── index.tsx             # Answer feedback
│   │
│   ├── components/                   # Reusable components
│   │   ├── GuidoBubble.tsx           # Guido avatar + text
│   │   ├── ModuleCard.tsx            # Macro-area card
│   │   ├── TheoryCard.tsx            # Theory explanation
│   │   ├── QuestionCard.tsx          # Question container
│   │   ├── AnswerButton.tsx          # Answer button (animated)
│   │   ├── ProgressRing.tsx          # Circular progress
│   │   ├── StreakBar.tsx             # 7-day streak tracker
│   │   ├── AnimatedProgressBar.tsx   # Smooth progress bar
│   │   └── PremiumCard.tsx           # Card with shadow
│   │
│   ├── lib/                          # Business logic
│   │   ├── storage.ts                # AsyncStorage helpers
│   │   ├── progress.ts               # Spaced repetition logic
│   │   ├── questions.ts              # Question filtering/loading
│   │   ├── questionLoader.ts         # JSON data loader
│   │   └── claude.ts                 # Anthropic API client
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useUserProgress.ts        # Global progress state
│   │   ├── useReviewQueue.ts         # Review queue logic
│   │   ├── useOnboarding.ts          # Onboarding state
│   │   ├── useAnimatedScale.ts       # Scale animations
│   │   └── useAnimatedFade.ts        # Fade animations
│   │
│   ├── constants/                    # App constants
│   │   ├── theme.ts                  # Colors, typography, spacing
│   │   └── macros.ts                 # 7 macro-aree definitions
│   │
│   └── app.json                      # Expo config
│
├── data/
│   └── questions_with_explanations.json    # 7,139 questions DB
│
├── docs/                             # Documentation
│   ├── SETUP.md                      # Local dev setup
│   └── ARCHITECTURE.md               # This file
│
└── package.json
```

## Flusso dell'app

### 1. Boot sequence

```
App starts
  ↓
_layout.tsx checks AsyncStorage for onboarding
  ↓
If first time?
  → Show onboarding/index.tsx
  → Save name in AsyncStorage
  → Mark onboarding as complete
  ↓
Else?
  → Load (tabs) directly
```

### 2. Home flow

```
Home (tabs/index.tsx)
  ↓
useUserProgress hook loads:
  • Total progress %
  • Current streak
  • Macro-area stats from storage
  ↓
User taps a macro-area
  → Navigate to lezione/[macroId].tsx
```

### 3. Lesson flow

```
lezione/[macroId].tsx
  ↓
getQuestionsByMacroId loads 10 random questions
  ↓
For each question:
  • Display QuestionCard
  • User answers
  • Update QuestionState in storage
  • Show feedback with GuidoBubble
  ↓
Session complete
  ↓
saveMacroProgress updates totals
  → Navigate back to home
```

### 4. Spaced repetition

```
Question answered
  ↓
updateQuestionState() calculates:
  • timesCorrect++/timesWrong++
  • nextReview timestamp
  • mastered = true if 3 correct
  ↓
saveQuestionState() stores in AsyncStorage
  ↓
isDueForReview() checks if should appear in ripasso
  ↓
ripasso/index.tsx loads due questions
```

## State management

### Global state (hooks)

| Hook | Purpose | Storage |
|------|---------|---------|
| `useUserProgress` | User name, streak, total progress | AsyncStorage + memory cache |
| `useReviewQueue` | Due questions | Computed from AsyncStorage |
| `useOnboarding` | First-time check | AsyncStorage boolean |

### Local state (components)

- `currentIndex`: Lesson position
- `selectedAnswer`: Current answer
- `answered`: Has user answered?

No Redux/Zustand — hooks + AsyncStorage are sufficient.

## Data flow

```
┌─────────────────────┐
│   AsyncStorage      │
│  (persistent)       │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────┐
    │  lib/storage │
    │  read/write  │
    └──────────┬───┘
               │
               ↓
        ┌──────────────────┐
        │  Custom hooks    │
        │ useUserProgress  │
        │ useReviewQueue   │
        └──────────┬───────┘
                   │
                   ↓
            ┌────────────┐
            │ Components │
            │  Display   │
            └────────────┘
```

## Key libraries

| Library | Role | Why |
|---------|------|-----|
| `expo-router` | Navigation | File-based routing, type-safe |
| `react-native-reanimated` | Animations | 60fps smooth animations |
| `@react-native-async-storage` | Storage | Simple, efficient local storage |
| `anthropic` | Claude API | Situational questions |

## Performance considerations

### Load time
- Questions cached in memory after first load
- AsyncStorage queries debounced
- Images lazy-loaded

### Memory
- Keep active questions <500
- Clear cache on app background
- Monitor RAM with Expo Profiler

### Bundle size
- No heavy dependencies
- Tree-shaking enabled
- Web build ~2.5MB

## Testing strategy

### Unit tests (future)
- `progress.ts` spaced repetition math
- `questions.ts` filtering logic

### Component tests (future)
- Render QuestionCard
- Check answer state updates

### Manual testing
- Full lesson flow
- Spaced repetition triggering
- Offline functionality

## Security architecture

```
User Input
    ↓
Validate (no injection)
    ↓
AsyncStorage (local only)
    ↓
API Call to Claude
    ↓
HTTPS + TLS 1.2
    ↓
Response cached locally
```

## Future roadmap

### Phase 1 (v1.0)
- [x] Core learning flow
- [x] Spaced repetition
- [x] Onboarding

### Phase 2 (v1.1)
- [ ] Cloud sync (optional)
- [ ] Situational questions (Claude)
- [ ] Offline mode enhancement

### Phase 3 (v2.0)
- [ ] Community questions
- [ ] Video explanations
- [ ] Groups/competition

---

**Questions?** Check [SETUP.md](SETUP.md) or open an issue.
