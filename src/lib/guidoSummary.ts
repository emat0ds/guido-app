/**
 * Genera il testo che Guido dice all'utente nella schermata Progressi.
 * Tono: istruttore di scuola guida — diretto, incoraggiante, mai robotico.
 * Nessuna chiamata API: tutto calcolato localmente dai dati reali.
 */

const TOTAL_QUESTIONS = 1301;

export interface GuidoSummaryInput {
  globalAccuracy: number;          // 0-100
  totalAnswered: number;           // domande viste almeno una volta
  masteredCount: number;           // domande dominate
  streak: number;                  // giorni consecutivi
  weeklyAvgMinutes: number;        // media minuti/giorno ultimi 7gg
  weeklyAvgQuestions: number;      // media domande/giorno ultimi 7gg
  strongestMacroTitle?: string;    // area con accuratezza più alta
  weakestMacroTitle?: string;      // area con accuratezza più bassa
  readinessScore: number;          // 0-100
  lastExamScore?: number;          // es. 32/40
  lastExamPassed?: boolean;
}

export function generateGuidoSummary(p: GuidoSummaryInput): string {
  const lines: string[] = [];

  // ── Saluto + accuratezza ────────────────────────────────────────────────────
  if (p.totalAnswered === 0) {
    return "Ciao! Inizia una lezione e torna qui — ti dico io come stai andando.";
  }

  if (p.globalAccuracy >= 85) {
    lines.push(`Ottimo lavoro. Stai rispondendo correttamente a ${p.globalAccuracy}% delle domande — un livello davvero buono.`);
  } else if (p.globalAccuracy >= 70) {
    lines.push(`Stai andando bene: ${p.globalAccuracy}% di risposte giuste. C'è ancora margine, ma sei sulla strada giusta.`);
  } else if (p.globalAccuracy >= 55) {
    lines.push(`${p.globalAccuracy}% di risposte corrette: non male, ma ti aspetto più su. Ci arriviamo.`);
  } else {
    lines.push(`Al momento sei al ${p.globalAccuracy}% di risposte corrette. È normale all'inizio — l'importante è continuare.`);
  }

  // ── Aree forte / debole ─────────────────────────────────────────────────────
  if (p.strongestMacroTitle && p.weakestMacroTitle && p.strongestMacroTitle !== p.weakestMacroTitle) {
    lines.push(`Sei più a tuo agio con ${p.strongestMacroTitle}, mentre ${p.weakestMacroTitle} ti dà ancora un po' di filo da torcere — concentrati lì.`);
  } else if (p.weakestMacroTitle) {
    lines.push(`L'area su cui lavorare di più è ${p.weakestMacroTitle} — non saltarla.`);
  }

  // ── Ritmo di studio ─────────────────────────────────────────────────────────
  if (p.weeklyAvgMinutes >= 20) {
    const minStr = Math.round(p.weeklyAvgMinutes);
    lines.push(`Nell'ultima settimana hai studiato circa ${minStr} minuti al giorno — un ritmo solido.`);
  } else if (p.weeklyAvgMinutes >= 5) {
    const minStr = Math.round(p.weeklyAvgMinutes);
    lines.push(`Studi circa ${minStr} minuti al giorno nell'ultima settimana. Non male, ma puoi fare di più.`);
  } else if (p.weeklyAvgQuestions > 0) {
    lines.push(`Stai studiando, ma poco. Anche solo 15 minuti al giorno fanno la differenza.`);
  }

  // ── Esame simulato ──────────────────────────────────────────────────────────
  if (p.lastExamScore !== undefined) {
    if (p.lastExamPassed) {
      lines.push(`Nell'ultimo simulato hai preso ${p.lastExamScore}/40 — promosso. Continua così.`);
    } else {
      lines.push(`Nell'ultimo simulato hai preso ${p.lastExamScore}/40 — non ancora sufficiente, ma ci sei vicino.`);
    }
  }

  // ── Stima tempo all'esame ───────────────────────────────────────────────────
  const weeksEstimate = estimateWeeksToExam(p);
  if (p.readinessScore >= 85) {
    lines.push(`Sei pronto. Puoi andare a prenotare l'esame.`);
  } else if (weeksEstimate !== null) {
    if (weeksEstimate <= 1) {
      lines.push(`Con questo ritmo, in una settimana circa dovresti essere pronto per l'esame.`);
    } else if (weeksEstimate <= 4) {
      lines.push(`Continua così e, secondo i miei conti, in circa ${weeksEstimate} settimane sarai pronto per l'esame.`);
    } else {
      lines.push(`Hai ancora del lavoro davanti — stimo circa ${weeksEstimate} settimane a questo ritmo. Aumenta le sessioni giornaliere e ci arriviamo prima.`);
    }
  }

  return lines.join(" ");
}

function estimateWeeksToExam(p: GuidoSummaryInput): number | null {
  if (p.weeklyAvgQuestions <= 0) return null;

  const questionsLeft = TOTAL_QUESTIONS - p.totalAnswered;
  if (questionsLeft <= 0) return 1; // già visto tutto, manca solo accuratezza

  // Quanti giorni per coprire le domande mancanti
  const daysTocover = questionsLeft / p.weeklyAvgQuestions;

  // Se l'accuratezza è bassa, ci vuole più tempo per le revisioni
  const accuracyMultiplier = p.globalAccuracy < 70 ? 1.6 : p.globalAccuracy < 80 ? 1.2 : 1.0;

  const estimatedDays = Math.ceil(daysTocover * accuracyMultiplier);
  return Math.max(1, Math.ceil(estimatedDays / 7));
}
