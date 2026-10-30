import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCloudAccess } from '../server/supabase.mjs';
import { createApp } from '../server/app.mjs';
import { openStore } from '../server/store.mjs';

test('a identidade da nuvem é verificada e o JWT do usuário acompanha consultas com RLS', async () => {
  const created = [];
  const access = createCloudAccess({ clientFactory: (_url, _key, options) => {
    created.push(options);
    return { auth: { getUser: async token => token === 'valid.jwt.signature' ? { data: { user: { id: 'verified-user' } }, error: null } : { data: {}, error: { message: 'invalid' } } } };
  } });
  assert.equal(await access.session('forged.jwt.signature'), null);
  const result = await access.session('valid.jwt.signature');
  assert.equal(result.owner, 'verified-user');
  assert.equal(created.at(-1).global.headers.Authorization, 'Bearer valid.jwt.signature');
});
test('API usa a identidade verificada e rejeita JWT forjado, sem confiar no user_id do cliente', async t => {
  const store = await openStore({ filename: ':memory:', databaseUrl: '' });
  const received = [];
  const app = await createApp({ store, cloudAccess: { session: async token => token === 'good.jwt.signature' ? { owner: 'verified-owner', store: { list: async owner => { received.push(owner); return []; } } } : null } });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(() => app.close());
  const url = `http://127.0.0.1:${app.server.address().port}/api/memories`;
  assert.equal((await fetch(url, { headers: { Authorization: 'Bearer forged.jwt.signature' } })).status, 401);
  assert.equal((await fetch(url + '?user_id=someone-else', { headers: { Authorization: 'Bearer good.jwt.signature' } })).status, 200);
  assert.deepEqual(received, ['verified-owner']);
});
