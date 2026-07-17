# Privacy Policy

**Ultimo aggiornamento**: Luglio 2026

## Riassunto breve

Fedal **non raccoglie dati personali**. I tuoi progressi rimangono sul tuo dispositivo. Non usiamo analytics, tracking, o pubblicità.

---

## 1. Cosa raccogliamo

### Dati locali (sul tuo dispositivo)

- **Nome utente**: Solo per personalizzare il saluto
- **Progressi**: Domande risposte, streak, statistiche
- **Sessioni di studio**: Quali domande hai affrontato e quando

Questi dati rimangono **100% locali** e non vengono mai inviati a server.

### Dati inviati a Anthropic (solo se usi domande situazionali)

Se attivi le domande situazionali generate con Claude API:
- La **domanda che stai vedendo** viene inviata a Anthropic
- Ricevi la risposta (scenario aggiuntivo)
- **Anthropic non registra le conversazioni** (puoi verificare nella loro privacy policy)

---

## 2. Come usiamo i dati

- **Personalizzazione**: Il tuo nome appare nella home
- **Apprendimento**: I tuoi progressi guidano quale domanda riproporre
- **Spaced repetition**: Algoritmo locale per ottimizzare il ripasso

**Non usamo i dati per**:
- Pubblicità mirata
- Vendita a terzi
- Analytics o tracking
- Profiling comportamentale

---

## 3. Storage locale (AsyncStorage)

I dati sono memorizzati localmente in formato plain text usando AsyncStorage di React Native.

**Rischio**: Se il telefono viene compromesso, i dati locali potrebbero essere letti.

**Mitigazione**: Se aggiungiamo dati sensibili (login futuro), useremo `expo-secure-store`.

---

## 4. Terze parti

### Anthropic Claude API
- **Cosa condividiamo**: Solo testo delle domande (se attivato)
- **Privacy**: Leggi la loro [Privacy Policy](https://anthropic.com/privacy)
- **Opzionale**: Puoi usare l'app senza attivare questa funzione

### Expo Services
- **Login**: Opzionale, solo per EAS Build
- **Analytics**: Disabilitate di default

---

## 5. Dati di debug

Se abiliti i log di debug durante lo sviluppo, potrebbero includere:
- Stato dell'app
- Domande viste
- Errori tecnici

**Questi log rimangono locali** e non vengono inviati.

---

## 6. Diritti dell'utente

Hai il diritto di:
- **Accedere** ai tuoi dati (apri il file di AsyncStorage)
- **Eliminarli**: Disinstalla l'app o usa il bottone "Cancella progressi"
- **Non raccolta**: L'app non chiede permessi invasivi (fotocamera, posizione, contatti)

---

## 7. Sicurezza

- **HTTPS obbligatorio** per tutte le comunicazioni esterne
- **Nessun hardcoding di credenziali** nel codice
- **Dipendenze monitorate** per vulnerabilità (npm audit)
- **Open source** — il codice è verifiable

---

## 8. GDPR e leggi europee

Fedal è conforme a:
- **GDPR** (non raccogliamo dati personali identificabili)
- **ePrivacy**: No cookie tracking
- **CCPA** (non appplicabile, ma conformi comunque)

---

## 9. Contatti

Per domande sulla privacy:
- **Email**: [la tua email]
- **Issues**: Apri un issue su GitHub (privato se sensibile)

---

## 10. Modifiche a questa policy

Se cambiamo questa policy, aggiorneremo la data in alto e notificheremo l'app.

---

**Fedal è costruito con la privacy al centro, non come pensiero secondario.**
