import Anthropic from '@anthropic-ai/sdk';

export interface SituationalQuestion {
  question: string;
  options: Array<{ label: string; text: string }>;
  correct: string;
  explanations: {
    [key: string]: string;
  };
}

let client: Anthropic | null = null;

export function initClaudeClient(apiKey: string) {
  client = new Anthropic({
    apiKey,
    defaultHeaders: {
      'Anthropic-Beta': 'interop-2024-12-20',
    },
  });
}

export async function generateSituationalQuestion(
  macroArea: string,
  previousQuestions: string[] = []
): Promise<SituationalQuestion | null> {
  if (!client) {
    console.error('Claude client not initialized');
    return null;
  }

  const systemPrompt = `Sei Guido, un istruttore di scuola guida italiano esperto e diretto.
Genera una domanda situazionale a risposta multipla (3 opzioni) per un ragazzo di 18 anni
che sta studiando la patente B. La domanda deve:
- Descrivere uno scenario reale di guida in 1-2 frasi
- Avere 3 opzioni (A, B, C) plausibili — non rendere ovvia la risposta sbagliata
- Indicare la risposta corretta
- Spiegare in 2-3 frasi perché le opzioni sbagliate sono sbagliate
- Riguardare l'argomento della macro-area
- Non ripetere domande già generate in questa sessione
Rispondi SOLO con JSON valido: { "question": "...", "options": [{"label": "A", "text": "..."}, ...], "correct": "A", "explanations": {"A": "...", "B": "...", "C": "..."} }`;

  const userPrompt = `Macro-area: ${macroArea}
Domande precedenti in questa sessione: ${previousQuestions.join('; ') || 'nessuna'}
Genera una nuova domanda situazionale.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', text);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      question: parsed.question,
      options: parsed.options || [],
      correct: parsed.correct,
      explanations: parsed.explanations || {},
    };
  } catch (error) {
    console.error('Error generating situational question:', error);
    return null;
  }
}
