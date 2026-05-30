import express from 'express';
import cors from 'cors';
import ollama from 'ollama';
import { rankBusinessPaths } from '../src/utils/ranking.js';

const app = express();
const PORT = process.env.PORT || 5050;
const MODEL = process.env.OLLAMA_MODEL || 'llama3:8b';
app.use(cors()); app.use(express.json({ limit: '1mb' }));

async function askOllama(prompt) {
  const response = await ollama.chat({ model: MODEL, messages: [{ role: 'user', content: prompt }], options: { temperature: 0.4 } });
  return response.message?.content || '';
}
const safe = (obj) => JSON.stringify(obj, null, 2).slice(0, 8000);

app.post('/recommend', async (req, res) => {
  const recommendations = rankBusinessPaths(req.body.answers || {}, 5);
  let explanation = 'Ranked locally from the 180-path YoungFounder database. Ollama can personalize this when available.';
  try { explanation = await askOllama(`Explain these teen business matches without inventing new businesses. Answers: ${safe(req.body.answers)} Matches: ${safe(recommendations.map(({title,matchPercent,reasons})=>({title,matchPercent,reasons})))}`); } catch {}
  res.json({ recommendations, explanation });
});

app.post('/chat', async (req, res) => {
  const { message, context = {} } = req.body;
  const locked = context.lockedPath ? `The locked path is ${context.lockedPath.title}. Do not suggest a different business unless the user asks to switch.` : 'No path is locked yet; encourage the quiz.';
  const fallback = context.lockedPath ? `For ${context.lockedPath.title}, your next move is: ${context.lockedPath.firstSteps?.[0] || 'contact one potential customer'}. Keep it safe, specific, and measurable.` : 'Take the quiz, compare the top matches, and lock one path before building.';
  try { const reply = await askOllama(`You are YoungFounder AI, a safety-first teen founder coach. ${locked}\nUse this context: ${safe(context)}\nUser: ${message}\nGive practical, concise, path-specific advice.`); res.json({ reply }); } catch { res.json({ reply: fallback, fallback: true }); }
});

app.post('/generate', async (req, res) => {
  const { tool, context = {} } = req.body;
  const fallback = `${tool} for ${context.lockedPath?.title || 'your business'}\n- Customer: ${context.lockedPath?.targetCustomers?.[0] || 'a specific safe customer group'}\n- Offer: ${context.lockedPath?.firstOffer || 'a small starter offer'}\n- Action: contact 10 warm prospects, deliver one great result, collect feedback.\n- Safety: get parent approval before meetings, payments, or public posts.`;
  try { const output = await askOllama(`Create a ${tool} for a teen founder. Stay focused on the locked path and do not invent a different business. Context: ${safe(context)}`); res.json({ output }); } catch { res.json({ output: fallback, fallback: true }); }
});

app.get('/health', (_, res) => res.json({ ok: true, model: MODEL }));
app.listen(PORT, () => console.log(`YoungFounder AI server running on http://localhost:${PORT}`));
