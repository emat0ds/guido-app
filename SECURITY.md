# Sicurezza in Fedal

## Segnalare vulnerabilità

Se scopri una vulnerabilità di sicurezza, **per favore non aprire un issue pubblico**.

Contatta: **[la tua email]**

Includi:
- Descrizione della vulnerabilità
- Come riprodurla
- Impatto potenziale
- Suggerimenti di fix (se hai)

**Risponderemo entro 48 ore**.

---

## Misure di sicurezza

### Locale

- **AsyncStorage**: Dati locali plain text (migrazione futura a secure storage)
- **Nessun hardcoding**: API key salvate in variabili d'ambiente
- **No credentials**: L'app non richiede login

### Comunicazioni

- **HTTPS obbligatorio**: Tutte le chiamate API
- **TLS 1.2+**: Per API esterne
- **No logging sensibile**: I dati non vengono mai loggati

### Dipendenze

- **npm audit** regolare
- **Dependencies monitorate** per CVE
- **Minimal deps**: Solo quello che serve

---

## Best practices

1. **Non condividere API key** nei commit
2. **Usa .env.local** per credenziali
3. **Code review** prima di merciare
4. **Test security** durante sviluppo

---

## Roadmap sicurezza

- [ ] Secure storage per dati sensibili futuri
- [ ] End-to-end encryption per cloud sync (futuro)
- [ ] Audit dipendenze mensile
- [ ] Penetration testing (prima di release major)

