# Setup di sviluppo locale

Guida completa per configurare l'ambiente di sviluppo di Guido.

## Prerequisiti

- **Node.js 16+** — [Download](https://nodejs.org)
- **npm 8+** — Installato con Node
- **Git** — [Download](https://git-scm.com)
- **Expo Go** — [iOS](https://apps.apple.com/app/expo-go/id982107779) o [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Per iOS (Mac)

- **Xcode 13+** (opzionale, per emulatore)
- **macOS 12+**

### Per Android

- **Android Studio** (opzionale, per emulatore)
- **JDK 11+**

## 1. Clona il progetto

```bash
git clone https://github.com/yourusername/guido-app.git
cd guido-app
```

## 2. Installa dipendenze

```bash
npm install
```

Se ci sono errori, prova:
```bash
npm clean-install
rm -rf node_modules package-lock.json
npm install
```

## 3. Avvia il dev server

```bash
npm start
```

Vedrai il QR code nel terminale.

## 4. Apri su device

### Con Expo Go (consigliato)

1. Apri **Expo Go** sul tuo telefono
2. **Scansiona il QR code** nel terminale
3. L'app si aprirà automaticamente

### Con simulatore iOS (Mac)

```bash
npm run ios
```

Apre il Simulatore iOS automaticamente.

### Con emulatore Android

```bash
npm run android
```

Apre l'Android Emulator automaticamente.

## 5. Test rapido

Una volta aperta l'app:

1. Vedi l'**onboarding** (primo avvio)
2. Inserisci il tuo nome
3. Vedi la **home** con macro-aree
4. Prova una **lezione**
5. Vedi il **ripasso**

## Sviluppo

### Hot reload

Salva un file — **l'app si aggiorna automaticamente** (fast refresh).

### Debug

Apri il menu Expo Go:
- **iOS**: Scuoti il device
- **Android**: Premi il tasto menu due volte

Menu utili:
- **Show logs**: Vedi console.log
- **Reload**: Riavvia manualmente
- **Restart bundler**: Se buggy

### Console logs

```javascript
console.log('Debug:', variable)
console.warn('Warning:', message)
console.error('Error:', error)
```

Visibili nel **menu Debug** dell'app o nel terminale.

## Variabili d'ambiente

Se aggiungi Claude API:

1. Crea `.env.local`:
```
EXPO_PUBLIC_CLAUDE_API_KEY=sk-...
```

2. Accedi nell'app:
```javascript
const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY
```

**⚠️ Non pushare .env.local su Git!** È già in `.gitignore`.

## Build locale

### EAS Build (consigliato)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
```

Scarica il `.ipa` e caricalo su TestFlight.

### Build web (testing)

```bash
npm run web
```

Apre http://localhost:8081 nel browser (utile per debug UI).

## Troubleshooting

### "Metro bundler not responding"

```bash
# Kill il processo
lsof -ti:8081 | xargs kill -9

# Riavvia
npm start
```

### "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "React version mismatch"

```bash
npm ls react
npm install react@latest
```

### "AsyncStorage error"

Questo è normale in web durante lo sviluppo. Funziona su device reale.

## Testing

### TypeScript

```bash
npx tsc --noEmit
```

Verifica gli errori di tipo senza compilare.

### Linter

```bash
npm run lint
```

Controlla stile e potenziali bug.

## Performance

### Profiling

In Expo Go > Menu > Profiler, visualizza:
- FPS
- Memoria usata
- Rendering time

Ideale: 60 FPS, <100MB RAM.

## Deployment

Per lanciare su App Store/Play Store:

```bash
eas build --platform ios
eas submit --platform ios
```

Vedi [README.md](../README.md) per dettagli completi.

---

**Problemi?** Apri un [issue](https://github.com/yourusername/guido-app/issues)
