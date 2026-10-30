import { createClient } from '@supabase/supabase-js';
import defaults from '../config/supabase-public.json' with { type: 'json' };

export function createCloudAccess({ url = process.env.SUPABASE_URL || defaults.url, key = process.env.SUPABASE_PUBLISHABLE_KEY || defaults.publishableKey, clientFactory = createClient } = {}) {
  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  const auth = clientFactory(url, key, options);
  return {
    async session(token) {
      // Verify with Supabase Auth. Never trust a locally decoded JWT or user_id from a request body.
      const { data, error } = await auth.auth.getUser(token);
      if (error || !data.user) return null;
      const owner = data.user.id;
      const client = clientFactory(url, key, { ...options, global: { headers: { Authorization: `Bearer ${token}` } } });
      async function checked(query) { const { data, error } = await query; if (error) throw Error('Memória online indisponível.'); return data; }
      return {
        owner,
        store: {
          list: () => checked(client.from('teravs_memories').select('id,content,created_at').eq('user_id', owner).order('created_at', { ascending: false }).limit(100)),
          async add(_owner, content) { return (await checked(client.from('teravs_memories').insert({ user_id: owner, content, consent: true }).select('id').single())).id; },
          remove: (_owner, id) => checked(client.from('teravs_memories').delete().eq('user_id', owner).eq('id', id)),
          clear: () => checked(client.from('teravs_memories').delete().eq('user_id', owner))
        }
      };
    }
  };
}
