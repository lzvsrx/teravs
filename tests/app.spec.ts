import { test, expect, type Page } from '@playwright/test';
async function openApp(page:Page){
 const uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
 await page.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({json:{access_token:jwt,refresh_token:'fake-refresh',expires_in:3600,token_type:'bearer',user:{id:uid,email:'app@example.invalid',aud:'authenticated',role:'authenticated'}}}));
 await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
 await expect(page.locator('#auth-gate .project-credits')).toContainText('Luiz Otavio Valenzi Sousa');
 await page.locator('#account-email').fill('app@example.invalid');await page.locator('#account-password').fill('testing-password');await page.locator('#account-login').click();
 await expect(page.locator('#auth-gate')).toBeHidden();
}
test('conversa sem configuração de IA, persistência e acessibilidade', async ({ page }) => {
  await openApp(page);
  await expect(page.getByText('Conectar IA')).toHaveCount(0);
  await page.route('**/api/chat', route => route.fulfill({ json: { content: 'Olá! Vamos organizar seu dia.', sources: [], mode: 'chat' } }));
  await page.locator('#prompt').fill('Me ajude'); await page.locator('#send').click();
  await expect(page.getByText('Olá! Vamos organizar seu dia.')).toBeVisible();
  await page.reload(); await expect(page.getByText('Olá! Vamos organizar seu dia.')).toBeVisible();
  await page.locator('[data-tab="access"]').click(); await page.getByLabel('Texto ampliado').check();
  await expect(page.locator('body')).toHaveClass(/large/);
});
test('memória exige permissão e exclusão remove o registro', async ({ page }) => {
  const uid='11111111-1111-4111-8111-111111111111';
  const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
  await page.route('**/auth/v1/token?grant_type=password',route=>route.fulfill({json:{access_token:jwt,refresh_token:'fake-refresh',expires_in:3600,token_type:'bearer',user:{id:uid,email:'teste@example.invalid',aud:'authenticated',role:'authenticated'}}}));
  await page.route('**/auth/v1/logout*',route=>route.fulfill({json:{}}));
  let saved: { id: string; content: string }[] = [];
  await page.route('**/rest/v1/teravs_memories*', async route => {
    const request = route.request();
    if (request.method() === 'POST') { saved.push({ id: '1', content: request.postDataJSON().content }); await route.fulfill({ status: 201, json: { id: '1' } }); }
    else if (request.method() === 'DELETE') { saved = []; await route.fulfill({ json: { ok: true } }); }
    else await route.fulfill({ json: saved });
  });
  await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.locator('#account-email').fill('teste@example.invalid');await page.locator('#account-password').fill('testing-password');await page.locator('#account-login').click();
  await expect(page.locator('#auth-gate')).toBeHidden();
  await page.locator('[data-tab="memory"]').click();
  await page.locator('#memory-content').fill('Prefiro frases curtas.'); await page.locator('#save-memory').click();
  await expect(page.locator('#memory-status')).toContainText('Ative a permissão'); expect(saved.length).toBe(0);
  await page.locator('#remember').check(); await page.locator('#save-memory').click();
  await expect(page.locator('#memory-list')).toContainText('Prefiro frases curtas.');
  page.on('dialog', dialog => dialog.accept()); await page.locator('#delete-memory').click();
  await expect(page.locator('#memory-status')).toContainText('Nenhuma memória');
  await page.route('**/api/chat',route=>route.fulfill({json:{content:'Resposta privada desta conta.',sources:[]}}));
  await page.locator('[data-tab="chat"]').click();await page.locator('#prompt').fill('Pergunta privada');await page.locator('#send').click();
  await expect(page.getByText('Resposta privada desta conta.')).toBeVisible();
  await page.locator('[data-tab="account"]').click();await page.locator('#account-logout').click();
  await expect(page.locator('#account-form')).toBeVisible();await expect(page.locator('#memory-list')).toBeEmpty();
  await expect(page.locator('#messages')).toBeEmpty();
});
test('cadastro solicita confirmação por e-mail sem gravar a senha',async({page})=>{
  await page.route('**/auth/v1/signup*',route=>route.fulfill({json:{id:'33333333-3333-4333-8333-333333333333',email:'novo@example.invalid',identities:[],aud:'authenticated',created_at:new Date().toISOString()}}));
  await page.goto('/');
  await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.locator('#show-signup').click();await page.locator('#signup-name').fill('Pessoa de teste');await page.locator('#signup-email').fill('novo@example.invalid');await page.locator('#signup-password').fill('senha-de-teste');await page.locator('#signup-confirm').fill('senha-de-teste');await page.locator('#account-signup').click();
  await expect(page.locator('#account-status')).toContainText('Confira seu e-mail');await expect(page.locator('#signup-password')).toHaveValue('');
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('senha-de-teste');
  await page.evaluate(()=>sessionStorage.clear());await page.reload();
  await expect(page.locator('[data-auth-view="verify"]')).toBeVisible();
  await page.route('**/auth/v1/resend*', route => route.fulfill({status:429,json:{code:'over_email_send_rate_limit',msg:'rate limit'}}));
  await page.locator('#resend-confirmation').click();
  await expect(page.locator('#account-status')).toContainText('limite de envio de e-mails');
  await expect(page.locator('#confirmation-address')).toHaveText('novo@example.invalid');
  await page.locator('#confirmation-login').click();
  await expect(page.locator('#account-email')).toHaveValue('novo@example.invalid');
  await expect(page.locator('#account-password')).toHaveValue('');
});

test('link expirado informa o problema, limpa a URL e mantém a IA bloqueada',async({page})=>{
  await page.goto('/#error=access_denied&error_code=otp_expired&error_description=Email+link+expired');
  await expect(page.locator('#account-status')).toContainText('expirou');
  await expect(page.locator('#app')).toBeHidden();
  expect(new URL(page.url()).hash).toBe('');
  await page.locator('[data-auth-go="recovery"]').click();
  await expect(page.locator('#recovery-form')).toBeVisible();
});
test('SVG gerado é exibido como imagem sanitizada, sem script ou recursos externos', async ({ page }) => {
  await openApp(page);
  await page.route('**/api/chat', route => route.fulfill({ json: { content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><script>alert(1)</script><foreignObject>bad</foreignObject><rect width="100" height="100" fill="teal" onclick="alert(1)"/><image href="https://evil.invalid/a.png"/></svg>', sources: [] } }));
  await page.locator('#mode').selectOption('image'); await page.locator('#prompt').fill('Um quadrado turquesa'); await page.locator('#send').click();
  await expect(page.locator('img.generated-image')).toBeVisible();
  const xml = decodeURIComponent((await page.locator('img.generated-image').getAttribute('src'))!.split(',')[1]);
  expect(xml).not.toMatch(/script|foreignObject|onclick|evil\.invalid/);
});
test('erro de serviço aparece sem inventar resposta', async ({ page }) => {
  await openApp(page); await page.route('**/api/chat', route => route.fulfill({ status: 502, json: { error: 'Motor indisponível.' } }));
  await page.locator('#prompt').fill('Olá'); await page.locator('#send').click();
  await expect(page.locator('#status')).toContainText('Motor indisponível'); await expect(page.locator('article.assistant')).toHaveCount(0);
});
test('layout móvel e preparação por profissão', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await openApp(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('[data-tab="work"]').click(); await page.getByLabel('Profissão e objetivo').fill('Mecânico — orçamento');
  await page.getByRole('button', { name: 'Preparar conversa' }).click(); await expect(page.locator('#prompt')).toHaveValue(/Mecânico/);
});
test('login inválido mantém a IA bloqueada e cadastro rejeita senhas diferentes',async({page})=>{
 await page.route('**/auth/v1/token*',route=>route.fulfill({status:400,json:{error_code:'invalid_credentials',msg:'Invalid login credentials'}}));
 await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
 await expect(page.locator('#app')).toBeHidden();await expect(page.locator('#app')).toHaveAttribute('inert','');
 await page.locator('#account-email').fill('teste@example.invalid');await page.locator('#account-password').fill('wrong-password');await page.locator('#account-login').click();
 await expect(page.locator('#account-status')).toContainText('Confira seu e-mail, senha');await expect(page.locator('#app')).toBeHidden();
 await page.locator('#show-signup').click();await page.locator('#signup-name').fill('Pessoa teste');await page.locator('#signup-email').fill('novo@example.invalid');await page.locator('#signup-password').fill('password-one');await page.locator('#signup-confirm').fill('password-two');await page.locator('#account-signup').click();
 expect(await page.locator('#signup-confirm').evaluate((e:HTMLInputElement)=>e.validationMessage)).toContain('As senhas precisam ser iguais');
});
test('recuperação de senha informa o envio sem revelar existência da conta',async({page})=>{
 await page.route('**/auth/v1/recover*',route=>route.fulfill({json:{}}));
 await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.locator('[data-auth-go="recovery"]').click();await page.locator('#recovery-email').fill('pessoa@example.invalid');await page.locator('#recovery-form button[type=submit]').click();
 await expect(page.locator('#account-status')).toContainText('Se o e-mail estiver cadastrado');await expect(page.locator('#app')).toBeHidden();
});
test('link de recuperação abre nova senha e só libera a IA após salvar',async({page})=>{
 const uid='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
 let updated=false;
 await page.route('**/auth/v1/user*',route=>{if(route.request().method()==='PUT')updated=true;return route.fulfill({json:{id:uid,email:'recovery@example.invalid',aud:'authenticated',role:'authenticated'}})});
 await page.goto('/#access_token='+jwt+'&refresh_token=fake-refresh&expires_in=3600&token_type=bearer&type=recovery');
 await expect(page.locator('#password-form')).toBeVisible();await expect(page.locator('#app')).toBeHidden();
 await page.locator('#new-password').fill('nova-senha-teste');await page.locator('#new-password-confirm').fill('nova-senha-teste');await page.locator('#password-form button').click();
 await expect(page.locator('#app')).toBeVisible();expect(updated).toBeTruthy();
  await expect(page.locator('#chat')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('view')).toBe('chat');
});

test('confirmação no site abre a página principal sem manter tokens na URL',async({page})=>{
 const uid='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
 const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
 await page.route('**/auth/v1/user*',route=>route.fulfill({json:{id:uid,email:'confirmed@example.invalid',aud:'authenticated',role:'authenticated'}}));
 await page.goto('/?view=chat#access_token='+jwt+'&refresh_token=fake-refresh&expires_in=3600&token_type=bearer&type=signup');
 await expect(page.locator('#auth-gate')).toBeHidden();await expect(page.locator('#chat')).toBeVisible();
 expect(new URL(page.url()).searchParams.get('view')).toBe('chat');expect(new URL(page.url()).hash).toBe('');
});
