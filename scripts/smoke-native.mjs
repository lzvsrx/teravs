import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ args: ['.', '--user-data-dir=' + resolve('data/smoke-profile')], env });
try {
  const page = await app.firstWindow();
  await page.waitForSelector('#auth-gate');
  await page.waitForFunction(async () => { try { return (await fetch('http://127.0.0.1:4318/api/health')).ok; } catch { return false; } });
  assert.equal(await page.locator('#app').isVisible(), false);
  const status = await page.evaluate(async () => (await fetch('http://127.0.0.1:4318/api/chat', { method: 'POST', headers: { Authorization: 'Bearer ' + 'a'.repeat(64), 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Teste sem login' }] }) })).status);
  assert.equal(status, 401);
  console.log('Tela de login exibida e API bloqueada sem sessão.');
  await page.screenshot({ path: 'preview-auth-native.png' });
} finally { await app.close(); }
