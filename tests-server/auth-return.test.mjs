import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthReturn } from '../src/auth-return.ts';

test('retorno nativo aceita apenas o destino exato e nunca usa tokens recebidos no fragmento', async () => {
  let calls = 0; const events = [];
  const receive = createAuthReturn({ exchangeCodeForSession: async () => { calls++; return { error: null, data: { session: {} } }; } }, (state, message) => events.push({ state, message }));
  for (const url of ['https://example.invalid/?code=abc', 'teravs://other/callback?code=abc', 'teravs://auth/other?code=abc', 'teravs://user@auth/callback?code=abc', 'teravs://auth:80/callback?code=abc']) await receive(url);
  assert.equal(events.length, 0);
  await receive('teravs://auth/callback#access_token=untrusted&refresh_token=untrusted');
  assert.equal(calls, 0); assert.equal(events.at(-1).state, 'error');
  assert.doesNotMatch(JSON.stringify(events), /untrusted|access_token|refresh_token/);
  await receive('teravs://auth/callback?code=private-code&sb_flow_id=invalid!');
  assert.equal(calls, 0);
  assert.doesNotMatch(JSON.stringify(events), /private-code/);
});
