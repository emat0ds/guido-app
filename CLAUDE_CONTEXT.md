# Contesto progetto Guido Quiz — da leggere ad ogni sessione

## ISTRUZIONI PER CLAUDE
- **Leggi questo file all'inizio di ogni sessione, sempre.**
- **Aggiorna questo file alla fine di ogni sessione, sempre.**
- Non chiedere cose già scritte qui.

---

## Cos'è Guido Quiz
App iOS (e presto Android) per prepararsi all'esame della patente B in Italia.
- Nome app: **Guido Quiz**
- Bundle ID: `com.t0ds.guidoapp`
- Repo: `github.com/emat0ds/guido-app`
- Stack: React Native / Expo SDK 57, Expo Router
- Owner: Emanuele Todini (`t0ds`)
- Versione in app.json: **2.0.0** (buildNumber 40, versionCode 2) — aggiornata il 1 set 2026
- Ultima build EAS iOS: fatta il 1 settembre 2026, ma era ancora **1.5.2** (buildNumber 39) perché è stata avviata prima del bump di versione. Per pubblicare come 2.0 serve una nuova build.

## Personaggio AI: Guido
L'assistente AI si chiama **Guido** — tono da istruttore di scuola guida, non da robot.
Target utenti: ragazzi 17-20 anni. Tono: diretto, positivo, né vecchio né finto giovane.
Nelle spiegazioni usare **linguaggio giovane** (istruzione esplicita dell'utente).
AI sottostante: Claude (Anthropic).

## Features principali
**Già in produzione (1.x):**
- Quiz ufficiali illimitati con spiegazioni
- Esame simulato (40 domande, 30 minuti)
- Guido AI: risponde a domande sul CdS
- Prezzi: gratis / 1,99€ (esami illimitati + 50 AI) / 2,99€ (200 AI)

**Novità della 2.0 (già implementate, da rilasciare):**
- Statistiche avanzate: contatori corretti, punti forti/deboli
- Punteggio di prontezza esame aggiornato ogni giorno
- Grafico 7 giorni con accuratezza, confronto settimane
- Guido commenta i progressi (come istruttore, non come AI)
- Modalità pratica libera: domande casuali da tutte le aree
- `guidoSummary.ts` — logica commenti Guido

## File chiave
- `data/questions_with_explanations.json` — dataset domande (5700+ ID)
- `assets/img_sign/` — immagini segnali e diagrammi incroci (solo fino a ~972.png)
- `src/lib/imageMap.ts` — mappa statica require() per le immagini
- `src/components/QuestionImage.tsx` — componente immagine (usa getSignImage)
- `app.json` — config Expo
- `eas.json` — profili build EAS

## Workflow bug fixing
- L'utente manda screenshot di bug → registro silenziosamente
- Quando dice "procedi" o "vai" → applico tutto in batch
- Poi commit + push (il push lo fa sempre l'utente dal suo terminale)
- `rm -f .git/HEAD.lock` prima del commit se necessario (il sandbox non riesce a farlo)

## Comandi build
```bash
# iOS build
eas build --platform ios --profile production
# Submit a TestFlight
eas submit --platform ios --latest
# Android build
eas build --platform android --profile production
```

## Testi lancio 2.0
Bozze pronte in `/Users/EmaTods/Developer/guido_launch_2.0.md`
- App Store description + release notes 2.0 già scritte e approvate

## Watermark rimossi (PATENTATI.IT) — lista completa
383, 384, 385, 386, 595, 604, 607, 608, 614, 615, 617, 618, 620, 631, 632, 633, 636, 637, 638, 640, 643, 646, 647, 648, 651, 652, 654, 661, 669, 676, 705.png

## Spiegazioni/domande corrette (ID) — lista completa
14, 342, 531, 545, 600, 724, 894, 1062, 1091, 1334, 1347, 1348, 1454, 1682, 1920, 1940,
2200, 2221, 2247, 2258, 2383, 2442, 2453, 2465, 2490, 2506, 2507, 2613, 2647, 2652, 2724,
2752, 2772, 2812, 2836, 2876, 2990, 3082, 3287, 3330, 3432, 3522, 3570, 3580, 3628, 3647,
3674, 3689, 3695, 3696, 3704, 3712, 3755, 3777, 3783, 3843, 3853, 3876, 3911, 4209, 4276,
4282, 4284, 4424, 4741, 4743, 4760, 4797, 4815, 4818, 4849, 4902, 4913, 5044, 5054, 5383,
5548, 5782, 5957, 6213, 6954, 6957
- ID 2258: answer corretto da true a false
- ID 1091: img corretta a /img_sign/34.png
- ID 4209: domanda capitalizzata ("Il valore della distanza...")
- 31 domande capitalizzate (iniziavano minuscolo)

## Note tecniche ricorrenti
- Watermark removal: whiten lum<250 su bottom 25% full width (soglia 250, non 245)
- Le immagini JSON usano il campo `img` (non `image`) — es. `'/img_sign/383.png'`
- Il sandbox non può eliminare .git/HEAD.lock → l'utente lo fa dal terminale
- SSH push dal sandbox sempre fallisce → push sempre dal terminale utente
- PDF ufficiale MIT quiz: `data/domande-AB_italiano_23_04_2025.pdf`
- Neopatentati (aggiornato): 75 kW/t e 105 kW max (non più 55 kW/t e 70 kW)
- Filobus ≠ Tram: filobus NON ha precedenza assoluta (solo tram su rotaie, art. 145 CdS)
