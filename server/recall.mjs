// Retrieval implemented in the project: rank opt-in memories by query relevance.
// This is adaptive context, not training or modification of neural weights.
const tokens = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().match(/[a-z0-9]{3,}/g) || [];
export function recall(memories, query, maxChars = 6000) {
  const terms = new Set(tokens(query));
  const ranked = memories.map((memory, index) => {
    const words = tokens(memory.content);
    const matches = words.reduce((n, word) => n + (terms.has(word) ? 1 : 0), 0);
    return { memory, score: matches / Math.sqrt(Math.max(1, words.length)) + 0.01 / (index + 1) };
  }).sort((a, b) => b.score - a.score);
  const result = []; let used = 0;
  for (const { memory } of ranked) { if (result.length >= 6) break; const content = memory.content.slice(0, Math.max(0, maxChars - used)); if (!content) break; result.push({ ...memory, content }); used += content.length; }
  return result;
}
