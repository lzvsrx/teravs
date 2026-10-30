import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ args: ['.', '--user-data-dir=' + resolve('data/smoke-profile')], env });
try {
  const page = await app.firstWindow();
  await page.waitForSelector('#prompt');
  await page.waitForFunction(async () => { try { return (await fetch('http://127.0.0.1:4318/api/health')).ok; } catch { return false; } });
  await page.locator('#prompt').fill('Responda somente com a palavra pronto.');
  await page.locator('#send').click();
  await page.waitForFunction(() => !document.querySelector('#send').disabled, {}, { timeout: 190000 });
  const text = await page.locator('article.assistant p').allTextContents();
  assert.ok(text.length > 0, await page.locator('#status').innerText());
  console.log('Resposta real recebida:', text.at(-1));
  await page.screenshot({ path: 'preview-v02.png' });
} finally { await app.close(); }
