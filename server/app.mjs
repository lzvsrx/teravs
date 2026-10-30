import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { openStore } from './store.mjs';
import { generate, capabilities } from './engine.mjs';
import { createCloudAccess } from './supabase.mjs';

export async function createApp({ store, cloudAccess, engine = generate, allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:5173,http://localhost:5173,http://localhost,https://localhost,null').split(','), maxConcurrent = 2 } = {}) {
  const cloud = cloudAccess ?? (store ? null : createCloudAccess());
  store ||= await openStore();
  const rates = new Map();
  let active = 0;
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    if (origin && !allowedOrigins.includes(origin)) { res.writeHead(403); res.end(); return; }
    if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const json = (code, value) => { if (!res.destroyed) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); } };
    const route = new URL(req.url, 'http://localhost').pathname;
    if (route === '/api/health' && req.method === 'GET') { json(200, { service: 'Teravs', version: '0.3.1', capabilities, storage: cloud ? 'supabase+local' : store.kind, learning: 'explicit-user-memory' }); return; }
    const token = /^Bearer ([a-z0-9._~-]{1,8192})$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) { json(401, { error: 'Sessão inválida. Reabra o aplicativo.' }); return; }
    let owner, requestStore = store;
    if (/^[a-f0-9]{64}$/i.test(token)) owner = createHash('sha256').update(token).digest('hex');
    else {
      let access;
      try { access = cloud ? await cloud.session(token) : null; } catch { json(503, { error: 'Não foi possível verificar sua conta.' }); return; }
      if (!access) { json(401, { error: 'Sessão expirada ou inválida. Entre novamente.' }); return; }
      owner = access.owner; requestStore = access.store;
    }
    const guest = /^[a-f0-9]{64}$/i.test(token);
    if (cloud && guest && (route.startsWith('/api/memories') || route === '/api/chat')) { json(401, { error: 'Entre na sua conta para usar o Teravs.' }); return; }
    const now = Date.now();
    // Bound both memory consumption and per-session request volume.
    for (const [key, value] of rates) if (now - value.since > 60000) rates.delete(key);
    if (rates.size >= 10000 && !rates.has(owner)) { json(503, { error: 'Serviço ocupado.' }); return; }
    const rate = rates.get(owner) || { count: 0, since: now };
    rates.set(owner, rate);
    if (++rate.count > 40) { json(429, { error: 'Muitos pedidos. Aguarde um minuto.' }); return; }
    async function body() {
      let size = 0; const chunks = [];
      for await (const chunk of req) { size += chunk.length; if (size > 160000) throw Object.assign(new Error('Pedido muito grande.'), { status: 413 }); chunks.push(chunk); }
      try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('JSON inválido.'), { status: 400 }); }
    }
    try {
      if (route === '/api/memories') {
        if (req.method === 'GET') { json(200, { memories: await requestStore.list(owner) }); return; }
        if (req.method === 'DELETE') { await requestStore.clear(owner); json(200, { ok: true }); return; }
        if (req.method === 'POST') {
          const input = await body();
          if (input.consent !== true || typeof input.content !== 'string' || !input.content.trim() || input.content.length > 2000) { json(400, { error: 'Confirme o salvamento de uma memória de até 2.000 caracteres.' }); return; }
          if ((await requestStore.list(owner)).length >= 100) { json(409, { error: 'Limite de 100 memórias. Apague algumas antes de salvar.' }); return; }
          json(201, { id: await requestStore.add(owner, input.content.trim()) }); return;
        }
      }
      if (route.startsWith('/api/memories/') && req.method === 'DELETE') { await requestStore.remove(owner, route.split('/').at(-1)); json(200, { ok: true }); return; }
      if (route === '/api/chat' && req.method === 'POST') {
        const input = await body();
        if (cloud && guest && input.useMemory === true) { json(401, { error: 'Entre na sua conta para usar a memória online.' }); return; }
        if (!Array.isArray(input.messages) || input.messages.length < 1 || input.messages.length > 30 || input.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > 24000) || input.messages.at(-1).role !== 'user' || !capabilities.includes(input.mode || 'chat')) { json(400, { error: 'Conversa ou modo de criação inválido.' }); return; }
        if (input.messages.reduce((n, m) => n + m.content.length, 0) > 48000) { json(413, { error: 'Conversa muito longa. Inicie uma nova conversa.' }); return; }
        if (active >= maxConcurrent) { json(429, { error: 'O Teravs está ocupado. Tente novamente em instantes.' }); return; }
        active++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 180000);
        res.on('close', () => { if (!res.writableEnded) controller.abort(); });
        try {
          const result = await engine({ messages: input.messages.map(({ role, content }) => ({ role, content })), mode: input.mode || 'chat', simple: input.simple === true, memories: input.useMemory === true ? await requestStore.list(owner) : [], signal: controller.signal });
          json(200, result);
        } finally { clearTimeout(timeout); active--; }
        return;
      }
      json(404, { error: 'Recurso não encontrado.' });
    } catch (error) {
      // Avoid returning credentials, upstream responses, database addresses or raw stacks.
      json(error.status || 502, { error: error.name === 'AbortError' ? 'Solicitação interrompida ou tempo limite atingido.' : error.status ? error.message : 'Não foi possível concluir a operação. Verifique o serviço do Teravs e tente novamente.' });
    }
  });
  return { server, close: async () => { await new Promise(resolve => server.close(resolve)); await store.close(); } };
}
