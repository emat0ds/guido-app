require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sei Guido, un esperto di codice della strada italiano.
Quando uno studente risponde a una domanda sulla patente, spieghi il concetto in modo chiaro e conciso.
Vai dritto al punto senza preamboli. Massimo 3 frasi. Non usare elenchi puntati.`;

app.post('/ask-guido', async (req, res) => {
  const { question, explanation, isCorrect } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Campo "question" obbligatorio.' });
  }

  const userMessage = isCorrect
    ? `Lo studente ha risposto correttamente a questa domanda: "${question}". Spiegazione ufficiale: "${explanation}". Rinforza brevemente il concetto chiave.`
    : `Lo studente ha risposto in modo errato a questa domanda: "${question}". Spiegazione ufficiale: "${explanation}". Spiega perché la risposta corretta è quella giusta.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = message.content[0]?.text ?? '';
    res.json({ reply: text });
  } catch (err) {
    console.error('Errore Anthropic:', err.message);
    res.status(502).json({ error: 'Errore nella generazione della risposta.' });
  }
});

app.listen(port, () => {
  console.log(`Guido server in ascolto su porta ${port}`);
});
