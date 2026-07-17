# Come contribuire a Guido

Grazie per l'interesse! Guido è un progetto open source e accogliamo contributi di ogni tipo.

## Tipi di contributi

- **Domande**: Correzioni al database, nuove domande
- **Codice**: Bug fix, nuove feature, refactoring
- **Design**: Miglioramenti UX/UI, animazioni
- **Documentazione**: README, guide, traduzioni
- **Testing**: Segnalazione bug, test case

## Setup locale

```bash
git clone https://github.com/yourusername/guido-app.git
cd guido-app
npm install
npm start
```

Scansiona il QR code con Expo Go per testare.

## Workflow

1. **Fork** il progetto su GitHub
2. **Crea un branch** per la tua feature:
   ```bash
   git checkout -b feature/descrizione-breve
   ```
3. **Fai i tuoi cambiamenti** e testa localmente
4. **Commit** con messaggio chiaro:
   ```bash
   git commit -m "Add: breve descrizione della feature"
   git commit -m "Fix: breve descrizione del fix"
   git commit -m "Docs: breve descrizione"
   ```
5. **Push** al tuo fork:
   ```bash
   git push origin feature/descrizione-breve
   ```
6. **Apri una Pull Request** con:
   - Titolo chiaro
   - Descrizione di cosa cambia e perché
   - Link a issue correlati (se esistono)

## Linee guida

### Codice

- **TypeScript**: Usa type-safe sempre
- **Nomi**: Chiari e descrittivi (no abbreviazioni)
- **Commenti**: Solo per il "perché", non il "cosa"
- **Formattazione**: Segui lo stile esistente

### Commit messages

Usa prefissi chiari:
- `Add:` — nuova feature
- `Fix:` — bug fix
- `Refactor:` — miglioramento codice
- `Docs:` — documentazione
- `Test:` — test
- `Style:` — formatting (no logica)

Esempio:
```
Add: spaced repetition algorithm for review queue

Implements intelligent scheduling of questions based on
accuracy and time since last correct answer.
```

### Domande (database)

Se aggiungi domande:
1. Verifica che siano corrette
2. Aggiungi spiegazione chiara
3. Categorizzale nella giusta macro-area
4. Testa che carichino correttamente

### Pull Request

Prima di aprire:
- [ ] Codice testato localmente
- [ ] TypeScript compila senza errori
- [ ] Nessun console.log di debug
- [ ] Documentazione aggiornata (se necessario)
- [ ] Descrizione chiara della PR

## Aree di aiuto

**Priority Alta:**
- Bug fix (segnala tramite issue)
- Correzioni database domande
- Miglioramenti performance
- Accessibility

**Priority Media:**
- Nuove feature (discuti prima in issue)
- Refactoring
- Documentazione

**Priority Bassa:**
- Perfezionamento UI
- Traduzioni
- Commenti nel codice

## Domande?

- Apri un **issue** per discussioni
- Commenta su **PR** per feedback
- Email per argomenti sensibili

## Code of Conduct

- Sii rispettoso
- Critica il codice, non le persone
- Aiuta gli altri a imparare
- Segnala comportamenti scorretti privatamente

---

**Grazie per contribuire a rendere Guido migliore!** 🚀
