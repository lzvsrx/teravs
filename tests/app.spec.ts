import { test, expect } from '@playwright/test';
test('conversa sem configuração de IA, persistência e acessibilidade', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Conectar IA')).toHaveCount(0);
  await page.route('**/api/chat', route => route.fulfill({ json: { content: 'Olá! Vamos organizar seu dia.', sources: [], mode: 'chat' } }));
  await page.locator('#prompt').fill('Me ajude'); await page.locator('#send').click();
  await expect(page.getByText('Olá! Vamos organizar seu dia.')).toBeVisible();
  await page.reload(); await expect(page.getByText('Olá! Vamos organizar seu dia.')).toBeVisible();
  await page.locator('[data-tab="access"]').click(); await page.getByLabel('Texto ampliado').check();
  await expect(page.locator('body')).toHaveClass(/large/);
});
test('memória exige permissão e exclusão remove o registro', async ({ page }) => {
  let saved: { id: string; content: string }[] = [];
  await page.route('**/api/memories', async route => {
    const request = route.request();
    if (request.method() === 'POST') { saved.push({ id: '1', content: request.postDataJSON().content }); await route.fulfill({ status: 201, json: { id: '1' } }); }
    else if (request.method() === 'DELETE') { saved = []; await route.fulfill({ json: { ok: true } }); }
    else await route.fulfill({ json: { memories: saved } });
  });
  await page.goto('/'); await page.locator('[data-tab="memory"]').click();
  await page.locator('#memory-content').fill('Prefiro frases curtas.'); await page.locator('#save-memory').click();
  await expect(page.locator('#memory-status')).toContainText('Ative a permissão'); expect(saved.length).toBe(0);
  await page.locator('#remember').check(); await page.locator('#save-memory').click();
  await expect(page.locator('#memory-list')).toContainText('Prefiro frases curtas.');
  page.on('dialog', dialog => dialog.accept()); await page.locator('#delete-memory').click();
  await expect(page.locator('#memory-status')).toContainText('Nenhuma memória');
});
test('SVG gerado é exibido como imagem sanitizada, sem script ou recursos externos', async ({ page }) => {
  await page.goto('/');
  await page.route('**/api/chat', route => route.fulfill({ json: { content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><script>alert(1)</script><foreignObject>bad</foreignObject><rect width="100" height="100" fill="teal" onclick="alert(1)"/><image href="https://evil.invalid/a.png"/></svg>', sources: [] } }));
  await page.locator('#mode').selectOption('image'); await page.locator('#prompt').fill('Um quadrado turquesa'); await page.locator('#send').click();
  await expect(page.locator('img.generated-image')).toBeVisible();
  const xml = decodeURIComponent((await page.locator('img.generated-image').getAttribute('src'))!.split(',')[1]);
  expect(xml).not.toMatch(/script|foreignObject|onclick|evil\.invalid/);
});
test('erro de serviço aparece sem inventar resposta', async ({ page }) => {
  await page.goto('/'); await page.route('**/api/chat', route => route.fulfill({ status: 502, json: { error: 'Motor indisponível.' } }));
  await page.locator('#prompt').fill('Olá'); await page.locator('#send').click();
  await expect(page.locator('#status')).toContainText('Motor indisponível'); await expect(page.locator('article.assistant')).toHaveCount(0);
});
test('layout móvel e preparação por profissão', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('[data-tab="work"]').click(); await page.getByLabel('Profissão e objetivo').fill('Mecânico — orçamento');
  await page.getByRole('button', { name: 'Preparar conversa' }).click(); await expect(page.locator('#prompt')).toHaveValue(/Mecânico/);
});
