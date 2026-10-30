import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const source: string[] = JSON.parse(fs.readFileSync('src/locales/source.json', 'utf8'));
const languages = { en: 'en', es: 'es', fr: 'fr', ar: 'ar', 'zh-Hans': 'zh' };
test('catálogos cobrem toda a interface e preservam parâmetros', () => {
  expect(new Set(source).size).toBe(source.length);
  for (const file of Object.values(languages)) {
    const catalog: string[] = JSON.parse(fs.readFileSync(`src/locales/${file}.json`, 'utf8'));
    expect(catalog).toHaveLength(source.length);
    catalog.forEach((text, i) => {
      expect(text.trim(), `${file}: ${source[i]}`).not.toBe('');
      expect(text.match(/\{\w+\}/g) || []).toEqual(source[i].match(/\{\w+\}/g) || []);
    });
  }
});

test('troca todos os textos e atributos estáticos, volta ao português e preserva o formulário', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.locator('#account-email').fill('pessoa@example.invalid');
  await page.locator('#account-password').fill('senha-nao-traduzir');
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const entries: { node: Node; text: string }[] = []; let node;
    while ((node = walker.nextNode())) if (node.parentElement && !node.parentElement.closest('script,style,[translate=no],#language-status')) entries.push({ node, text: node.textContent!.trim() });
    (window as any).translationNodes = entries;
    (window as any).translationAttributes = Array.from(document.querySelectorAll('[placeholder],[aria-label],[data-prompt]')).flatMap(node => ['placeholder','aria-label','data-prompt'].flatMap(name => node.hasAttribute(name) ? [{node,name,text:node.getAttribute(name)}] : []));
  });
  await page.locator('#language-panel summary').click();
  for (const [code, file] of Object.entries(languages)) {
    await page.locator('#language-select').selectOption(code);
    await page.locator('#language-apply').click();
    await expect(page.locator('html')).toHaveAttribute('lang', code);
    const catalog: string[] = JSON.parse(fs.readFileSync(`src/locales/${file}.json`, 'utf8'));
    const failures = await page.evaluate(({ source, catalog }) => (window as any).translationNodes.flatMap(({ node, text }: { node: Node; text: string }) => {
      const i = source.indexOf(text);
      return i >= 0 && node.textContent!.trim() !== catalog[i].trim() ? [{ original: text, actual: node.textContent, expected: catalog[i] }] : [];
    }), { source, catalog });
    expect(failures).toEqual([]);
    expect(await page.evaluate(({source,catalog}) => (window as any).translationAttributes.flatMap(({node,name,text}: {node: Element;name: string;text: string}) => {
      const i=source.indexOf(text); return i>=0 && node.getAttribute(name)!==catalog[i] ? [{text,actual:node.getAttribute(name),expected:catalog[i]}] : [];
    }), {source,catalog})).toEqual([]);
    await expect(page.locator('#account-email')).toHaveValue('pessoa@example.invalid');
    await expect(page.locator('#account-password')).toHaveValue('senha-nao-traduzir');
    await expect(page.locator('html')).toHaveAttribute('dir', code === 'ar' ? 'rtl' : 'ltr');
  }
  await page.locator('#language-select').selectOption('pt-BR'); await page.locator('#language-apply').click();
  await expect(page.locator('#auth-title')).toHaveText('Entre na sua conta.');
  await expect(page.locator('#prompt')).toHaveAttribute('placeholder', 'O que vamos fazer hoje?');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('tradução no dispositivo recebe apenas o catálogo público, aplica tudo e reutiliza o cache', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).translationCalls = [];
    Object.defineProperty(globalThis,'Translator',{configurable:true,value:{
      availability: async () => 'available',
      create: async () => ({ translate: async (text: string) => { (window as any).translationCalls.push(text); return '日本語 '+text; }, destroy() {} })
    }});
  });
  await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.locator('#account-email').fill('privado@example.invalid');await page.locator('#account-password').fill('senha-pessoal');
  await page.locator('#language-panel summary').click();await page.locator('#language-select').selectOption('ja');await page.locator('#language-apply').click();
  await expect(page.locator('html')).toHaveAttribute('lang','ja');
  expect(await page.evaluate(()=>(window as any).translationCalls)).toEqual(source);
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','ja');
  await expect(page.locator('#auth-title')).toHaveText('日本語 Entre na sua conta.');
  expect(await page.evaluate(()=>(window as any).translationCalls)).toEqual([]);
  await page.locator('#language-panel summary').click();
  await page.evaluate(()=>Object.defineProperty(globalThis,'Translator',{configurable:true,value:{availability:async()=>'available',create:async()=>({translate:async()=>{throw Error('Failed')},destroy(){}})}}));
  await page.locator('#language-select').selectOption('de');await page.locator('#language-apply').click();
  await expect(page.locator('#language-status')).toContainText('Não foi possível traduzir');
  await expect(page.locator('html')).toHaveAttribute('lang','ja');
});

test('idioma do aparelho, persistência e falha de tradução sem suporte', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'fr-FR', viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); await page.goto('/');
  await expect(page.locator('#auth-title')).toHaveText('Connectez-vous à votre compte.');
  await page.locator('#language-panel summary').click();
  await page.locator('#language-select').selectOption('ar'); await page.locator('#language-apply').click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.locator('#language-panel summary').click();
  await page.evaluate(() => Object.defineProperty(globalThis, 'Translator', { value: undefined, configurable: true }));
  await page.locator('#language-select').selectOption('ja'); await page.locator('#language-apply').click();
  await expect(page.locator('#language-status')).toContainText('غير متاحة');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await context.close();
});

test('mensagens dinâmicas, memória e conversas pessoais permanecem separadas da tradução', async ({ page }) => {
  await page.route('**/auth/v1/token*', route => route.fulfill({ status: 400, json: { error_code: 'email_not_confirmed', msg: 'Email not confirmed' } }));
  await page.goto('/'); await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.locator('#language-panel summary').click();
  await page.locator('#language-select').selectOption('en'); await page.locator('#language-apply').click();
  await page.locator('#language-panel summary').click();
  await page.locator('#account-email').fill('pessoa@example.invalid');await page.locator('#account-password').fill('test-password');await page.locator('#account-login').click();
  await expect(page.locator('#account-status')).toContainText('Confirm your email');
  await expect(page.locator('#auth-title')).toHaveText('Check your email.');
  await page.evaluate(() => {
    const privateContent = 'Conversa. Educação. Você';
    const message = document.createElement('article'); const text = document.createElement('p'); text.textContent = privateContent; message.append(text); document.querySelector('#messages')!.append(message);
    const memory = message.cloneNode(true); document.querySelector('#memory-list')!.append(memory);
  });
  await page.locator('#language-panel summary').click();await page.locator('#language-select').selectOption('es');await page.locator('#language-apply').click();
  await expect(page.locator('#messages article p')).toHaveText('Conversa. Educação. Você');
  await expect(page.locator('#memory-list article p')).toHaveText('Conversa. Educação. Você');
});
