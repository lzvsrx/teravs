import { createClient } from '@supabase/supabase-js';
import defaults from '../config/supabase-public.json';
import { Capacitor } from '@capacitor/core';

// These are deliberately public client credentials, never an administrative key.
export const cloud = createClient(import.meta.env.VITE_SUPABASE_URL || defaults.url, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || defaults.publishableKey, {
  auth: { storageKey: 'teravs.auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: !Capacitor.isNativePlatform(), flowType: Capacitor.isNativePlatform() ? 'pkce' : 'implicit' }
});
export async function cloudToken() { const { data, error } = await cloud.auth.getSession(); if (error) throw Error('Não foi possível verificar sua conta. Entre novamente.'); return data.session?.access_token; }
export async function cloudMemory(path: string, init: RequestInit = {}) {
  const { data: { session } } = await cloud.auth.getSession();
  if (!session) throw Error('Entre na sua conta Teravs para acessar a memória online.');
  let result;
  if (init.method === 'POST') {
    const input = JSON.parse(String(init.body));
    if (!input.consent || typeof input.content !== 'string' || !input.content.trim() || input.content.length > 2000) throw Error('Autorize o salvamento de uma memória de até 2.000 caracteres.');
    result = await cloud.from('teravs_memories').insert({ user_id: session.user.id, content: input.content.trim(), consent: true }).select('id').single();
  } else if (init.method === 'DELETE') {
    let query = cloud.from('teravs_memories').delete().eq('user_id', session.user.id);
    if (path !== '/memories') query = query.eq('id', path.split('/').at(-1)!);
    result = await query;
  } else {
    result = await cloud.from('teravs_memories').select('id,content,created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(100);
  }
  if (result.error) {
    if (['PGRST205', '42P01'].includes(result.error.code)) throw Error('A memória online está em preparação. A tabela precisa ser criada no Supabase.');
    throw Error('Não foi possível acessar a memória online. Verifique sua conta e tente novamente.');
  }
  return init.method === 'POST' ? result.data : init.method === 'DELETE' ? { ok: true } : { memories: result.data || [] };
}
