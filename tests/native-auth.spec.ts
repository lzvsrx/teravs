import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';

async function nativeBridge(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as any).androidBridge = {};
    (window as any).Capacitor = {
      PluginHeaders: [{ name: 'App', methods: [{name:'addListener',rtype:'callback'},{name:'getLaunchUrl',rtype:'promise'},{name:'removeListener',rtype:'promise'}] }],
      nativeCallback: (_plugin: string, _method: string, _options: unknown, callback: unknown) => { (window as any).nativeAuthCallback = callback; return 'test-listener'; },
      nativePromise: async (_plugin: string, method: string) => method === 'getLaunchUrl' ? { url: sessionStorage.getItem('test.launch') || undefined } : {}
    };
  });
}
const uid = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
function authResponse() {
  const jwt=['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'test'].join('.');
  return {access_token:jwt,refresh_token:'fake-refresh',expires_in:3600,token_type:'bearer',user:{id:uid,email:'native@example.invalid',email_confirmed_at:new Date().toISOString(),aud:'authenticated',role:'authenticated'}};
}
for (const launch of ['hot','cold','recovery']) test(`Android PKCE: confirmação ${launch} conclui no aplicativo`,async({page})=>{
  await nativeBridge(page);
  let redirect='',challenge='',exchanges=0;
  const saveRequest = (request: import('@playwright/test').Request) => { redirect=new URL(request.url()).searchParams.get('redirect_to')!; challenge=request.postDataJSON().code_challenge; };
  await page.route('**/auth/v1/signup*',route=>{saveRequest(route.request());return route.fulfill({json:{id:uid,email:'native@example.invalid',identities:[],aud:'authenticated',created_at:new Date().toISOString()}})});
  await page.route('**/auth/v1/recover*',route=>{saveRequest(route.request());return route.fulfill({json:{}})});
  await page.route('**/auth/v1/token?grant_type=pkce',route=>{
    const body=route.request().postDataJSON();exchanges++;
    expect(body.auth_code).toBe('test-authorization-code');
    expect(createHash('sha256').update(body.code_verifier).digest('base64url')).toBe(challenge);
    return route.fulfill({json:authResponse()});
  });
  await page.goto('/'); await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  if(launch==='recovery'){
    await page.locator('[data-auth-go=recovery]').click();await page.locator('#recovery-email').fill('native@example.invalid');await page.locator('#recovery-form button[type=submit]').click();
    await expect(page.locator('#account-status')).toContainText('Se o e-mail estiver cadastrado');
  } else {
    await page.locator('#show-signup').click();await page.locator('#signup-name').fill('Teste nativo');await page.locator('#signup-email').fill('native@example.invalid');await page.locator('#signup-password').fill('senha-de-teste');await page.locator('#signup-confirm').fill('senha-de-teste');await page.locator('#account-signup').click();
    await expect(page.locator('#account-status')).toContainText('Confira seu e-mail');
  }
  expect(new URL(redirect).origin).toBe('null');
  expect(new URL(redirect).host).toBe('auth');
  expect(new URL(redirect).pathname).toBe('/callback');
  expect(new URL(redirect).searchParams.get('view')).toBe('chat');
  const callback=new URL(redirect);callback.searchParams.set('code','test-authorization-code');
  if(launch==='cold'){
    await page.evaluate(url=>sessionStorage.setItem('test.launch',url),callback.href);await page.reload();
  }else await page.evaluate(url=>(window as any).nativeAuthCallback({url}),callback.href);
  if(launch==='recovery'){
    await expect(page.locator('#password-form')).toBeVisible();await expect(page.locator('#app')).toBeHidden();
    await page.route('**/auth/v1/user*',route=>route.fulfill({json:authResponse().user}));
    await page.locator('#new-password').fill('nova-senha-teste');await page.locator('#new-password-confirm').fill('nova-senha-teste');await page.locator('#password-form button').click();
  }
  await expect(page.locator('#auth-gate')).toBeHidden();expect(exchanges).toBe(1);
  await expect(page.locator('#chat')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('view')).toBe('chat');
  if(launch==='hot'){
    await page.evaluate(url=>(window as any).nativeAuthCallback({url}),callback.href);
    await expect(page.locator('#profile-status')).toHaveText('Link confirmado neste aplicativo.');expect(exchanges).toBe(1);
  }
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('senha-de-teste');
  expect(await page.evaluate(()=>localStorage.getItem('teravs.pending-email'))).toBeNull();
});

test('Android rejeita link sem verificador local e não libera a IA',async({page})=>{
  await nativeBridge(page);let exchanges=0;
  await page.route('**/auth/v1/token?grant_type=pkce',route=>{exchanges++;return route.abort()});
  await page.goto('/');await expect(page.locator('#account-status')).toContainText('Entre ou crie');
  await page.evaluate(()=>(window as any).nativeAuthCallback({url:'teravs://auth/callback?code=code-without-local-verifier&sb_flow_id=missing_verifier'}));
  await expect(page.locator('#account-status')).toContainText('Use o aplicativo onde pediu');
  await expect(page.locator('#app')).toBeHidden();expect(exchanges).toBe(0);
});
