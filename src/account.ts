import type { Session } from '@supabase/supabase-js';
import { cloud } from './cloud';
import './account.css';
import { t } from './i18n';
import { authRedirect, mountNativeAuth } from './native-auth';

const REDIRECT = authRedirect;
const callback = new URLSearchParams(location.hash.slice(1));
const callbackError = callback.get('error_code') || new URLSearchParams(location.search).get('error_code') || callback.get('error');
const pendingKey = 'teravs.pending-email';
export function mountAccount(onSession: (session: Session | null) => void, onAuthenticated: () => void = () => {}) {
  const app = document.querySelector<HTMLElement>('#app')!;
  const gate = document.createElement('main'); gate.id = 'auth-gate';
  gate.innerHTML = `<div class="auth-layout"><section class="auth-story"><a class="brand" href="#">✦ teravs</a><div class="elo" role="img" aria-label="Elo, companheiro do Teravs"><span>••</span></div><span class="eyebrow">INTELIGÊNCIA QUE INCLUI</span><h1>Seu próximo passo<br>começa aqui.</h1><p>Um espaço para aprender, criar e trabalhar.<br>Com suas preferências e no seu ritmo.</p><ul><li>Textos, código e ilustrações vetoriais</li><li>Memórias que você escolhe salvar</li><li>Acessibilidade para diferentes necessidades</li></ul><small>O Teravs pode errar. Confira informações importantes.</small></section><section class="auth-card" aria-labelledby="auth-title"><span class="eyebrow">BEM-VINDO AO TERAVS</span><h2 id="auth-title">Entre na sua conta.</h2><p id="auth-description">Use seu e-mail e senha para acessar a IA.</p><p id="account-status" role="status">Verificando sua sessão…</p>
  <form id="account-form" data-auth-view="login"><label for="account-email">E-mail</label><input id="account-email" type="email" autocomplete="email" required maxlength="254" placeholder="voce@exemplo.com"><label for="account-password">Senha</label><input id="account-password" type="password" autocomplete="current-password" required maxlength="128"><button id="account-login" class="primary" type="submit">Entrar</button><button type="button" data-auth-go="recovery" class="auth-link">Esqueci minha senha</button><p class="auth-switch">Primeira vez por aqui? <button id="show-signup" type="button" data-auth-go="signup" class="auth-link">Criar conta</button></p></form>
  <form id="signup-form" data-auth-view="signup" hidden><label for="signup-name">Seu nome</label><input id="signup-name" autocomplete="name" required minlength="2" maxlength="100" placeholder="Como podemos chamar você?"><label for="signup-email">E-mail</label><input id="signup-email" type="email" autocomplete="email" required maxlength="254"><label for="signup-password">Crie uma senha</label><input id="signup-password" type="password" autocomplete="new-password" required minlength="8" maxlength="128" aria-describedby="password-help"><small id="password-help">Use pelo menos 8 caracteres.</small><label for="signup-confirm">Confirme a senha</label><input id="signup-confirm" type="password" autocomplete="new-password" required minlength="8" maxlength="128"><button id="account-signup" class="primary" type="submit">Criar minha conta</button><p class="auth-switch">Já tem uma conta? <button type="button" data-auth-go="login" class="auth-link">Entrar</button></p><small>O cadastro não ativa a memória. Você escolhe o que o Teravs pode guardar depois de entrar.</small></form>
  <form id="recovery-form" data-auth-view="recovery" hidden><label for="recovery-email">E-mail da sua conta</label><input id="recovery-email" type="email" autocomplete="email" required maxlength="254"><button class="primary" type="submit">Enviar link de recuperação</button><button type="button" data-auth-go="login" class="auth-link">Voltar para o login</button></form>
  <div data-auth-view="verify" hidden><p>Abra o link do e-mail neste aparelho. No Android, ele pode abrir o Teravs para concluir a confirmação. Se confirmou no navegador, volte e entre com sua senha.</p><p id="confirmation-address" translate="no" dir="auto"></p><button id="resend-confirmation">Reenviar confirmação</button><button id="confirmation-login" type="button" class="primary">Já confirmei: entrar com minha senha</button><button type="button" data-auth-go="signup" class="auth-link">Corrigir e-mail do cadastro</button></div>
  <form id="password-form" data-auth-view="password" hidden><label for="new-password">Nova senha</label><input id="new-password" type="password" autocomplete="new-password" required minlength="8" maxlength="128"><label for="new-password-confirm">Confirme a nova senha</label><input id="new-password-confirm" type="password" autocomplete="new-password" required minlength="8" maxlength="128"><button class="primary" type="submit">Salvar nova senha</button></form>
  </section></div>`;
  document.body.prepend(gate);
  const el = <T extends HTMLElement>(s: string) => gate.querySelector<T>(s)!;
  let session: Session | null = null, recovery = false, working = false, confirmationEmail = '';
  let setupPassword = callback.get('type') === 'magiclink';
  try { confirmationEmail = localStorage.getItem(pendingKey) || sessionStorage.getItem(pendingKey) || ''; } catch { /* Storage can be disabled. */ }
  function pending(email: string) {
    confirmationEmail = email;
    for (const storage of ['localStorage', 'sessionStorage'] as const) try {
      if (email) window[storage].setItem(pendingKey, email); else window[storage].removeItem(pendingKey);
    } catch { /* Keep this flow available without storage. */ }
  }
  function failure(error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'over_request_rate_limit') return 'Aguarde alguns minutos antes de pedir outro e-mail.';
    if ((error as { status?: number })?.status === 429 || code === 'over_email_send_rate_limit') return 'O limite de envio de e-mails foi atingido. Tente novamente mais tarde. Se já confirmou seu e-mail, entre com sua senha.';
    if (code === 'email_address_not_authorized') return 'O serviço de e-mail ainda não permite enviar para este endereço. O administrador precisa configurar o envio no Supabase.';
    if (code === 'email_provider_disabled' || code === 'signup_disabled') return 'O cadastro por e-mail está indisponível no serviço. Tente novamente mais tarde.';
    if (code === 'weak_password') return 'Escolha uma senha mais forte, com letras, números e símbolos.';
    return 'Não foi possível concluir. Verifique os dados e sua conexão e tente novamente.';
  }
  function lock(locked: boolean) { app.hidden = locked; app.inert = locked; gate.hidden = !locked; }
  function note(text: string) { el('#account-status').textContent = text; }
  function view(name: string) {
    const titles: Record<string, [string, string]> = { login: ['Entre na sua conta.', 'Use seu e-mail e senha para acessar a IA.'], signup: ['Crie sua conta.', 'Seu espaço para novas possibilidades.'], recovery: ['Vamos recuperar seu acesso.', 'Enviaremos as instruções para seu e-mail.'], verify: ['Confira seu e-mail.', 'Confirme o e-mail ou entre se já confirmou.'], password: ['Escolha uma nova senha.', 'Atualize sua senha para voltar ao Teravs.'] };
    gate.querySelectorAll<HTMLElement>('[data-auth-view]').forEach(e => e.hidden = e.dataset.authView !== name);
    el('#auth-title').textContent = titles[name][0]; el('#auth-description').textContent = titles[name][1];
    note(''); gate.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(e => { e.value = ''; e.setCustomValidity(''); });
    el('#confirmation-address').textContent = confirmationEmail;
    if (name === 'signup' && confirmationEmail) el<HTMLInputElement>('#signup-email').value = confirmationEmail;
  }
  async function run(action: () => Promise<void>) {
    if (working) return; working = true; gate.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.disabled = true);
    try { await action(); } catch (error) { note(failure(error)); }
    finally { working = false; gate.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.disabled = false); }
  }
  function match(first: string, second: string) { const field = el<HTMLInputElement>(second); field.setCustomValidity(el<HTMLInputElement>(first).value === field.value ? '' : t('As senhas precisam ser iguais.')); return field.reportValidity(); }
  gate.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(input => input.oninput = () => { gate.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(e => e.setCustomValidity('')); });
  gate.querySelectorAll<HTMLElement>('[data-auth-go]').forEach(button => button.onclick = () => view(button.dataset.authGo!));
  el<HTMLFormElement>('#account-form').onsubmit = event => { event.preventDefault(); void run(async () => {
    note('Entrando…'); const { error } = await cloud.auth.signInWithPassword({ email: el<HTMLInputElement>('#account-email').value.trim(), password: el<HTMLInputElement>('#account-password').value });
    if (error?.code === 'email_not_confirmed') { pending(el<HTMLInputElement>('#account-email').value.trim()); view('verify'); note('Confirme seu e-mail antes de entrar. Você pode reenviar a confirmação abaixo.'); return; }
    if (error) { note('Confira seu e-mail, senha e a confirmação do cadastro.'); return; }
    el<HTMLInputElement>('#account-password').value = '';
  }); };
  el<HTMLFormElement>('#signup-form').onsubmit = event => { event.preventDefault(); if (!match('#signup-password', '#signup-confirm')) return; void run(async () => {
    note('Criando sua conta…'); confirmationEmail = el<HTMLInputElement>('#signup-email').value.trim();
    const { data, error } = await cloud.auth.signUp({ email: confirmationEmail, password: el<HTMLInputElement>('#signup-password').value, options: { emailRedirectTo: REDIRECT, data: { display_name: el<HTMLInputElement>('#signup-name').value.trim() } } });
    if (error) throw error; if (!data.session) { pending(confirmationEmail); view('verify'); note('Confira seu e-mail. Se sua conta já estiver confirmada, entre com sua senha; cadastrar novamente não envia outra confirmação.'); }
    el<HTMLInputElement>('#signup-password').value = ''; el<HTMLInputElement>('#signup-confirm').value = '';
  }); };
  el<HTMLFormElement>('#recovery-form').onsubmit = event => { event.preventDefault(); void run(async () => {
    const { error } = await cloud.auth.resetPasswordForEmail(el<HTMLInputElement>('#recovery-email').value.trim(), { redirectTo: REDIRECT });
    if (error) throw error; note('Se o e-mail estiver cadastrado, você receberá as instruções para recuperar sua senha.');
  }); };
  el<HTMLFormElement>('#password-form').onsubmit = event => { event.preventDefault(); if (!match('#new-password', '#new-password-confirm')) return; void run(async () => {
    const { error } = await cloud.auth.updateUser({ password: el<HTMLInputElement>('#new-password').value }); if (error) throw error;
    recovery = false; el<HTMLInputElement>('#new-password').value = ''; el<HTMLInputElement>('#new-password-confirm').value = ''; lock(!session); if (session) onAuthenticated();
  }); };
  el('#resend-confirmation').onclick = () => void run(async () => { if (!confirmationEmail) { view('login'); note('Informe seu e-mail e senha para retomar a confirmação.'); return; } const { error } = await cloud.auth.resend({ type: 'signup', email: confirmationEmail, options: { emailRedirectTo: REDIRECT } }); if (error) throw error; note('Se o cadastro estiver pendente, enviaremos uma nova confirmação. Confira também o spam.'); });
  el('#confirmation-login').onclick = () => { view('login'); el<HTMLInputElement>('#account-email').value = confirmationEmail; el<HTMLInputElement>('#account-password').focus(); };
  const account = document.createElement('section'); account.id = 'account'; account.className = 'tab'; account.hidden = true;
  account.innerHTML = '<span class="eyebrow">SUA CONTA TERAVS</span><h1>Bom ter você aqui.</h1><p id="profile-email"></p><p>Suas memórias online pertencem à sua conta. Você controla o salvamento e a exclusão em Minha memória.</p><button id="account-logout">Sair da conta</button><p id="profile-status" role="status"></p>';
  app.querySelector('main')!.append(account);
  const button = document.createElement('button'); button.dataset.tab = 'account'; button.textContent = '◎ Minha conta'; button.onclick = () => { app.querySelectorAll<HTMLElement>('.tab').forEach(e => e.hidden = e.id !== 'account'); app.querySelectorAll<HTMLElement>('nav button').forEach(e => e.classList.toggle('active', e === button)); }; app.querySelector('nav')!.append(button);
  account.querySelector<HTMLElement>('#account-logout')!.onclick = async () => { const { error } = await cloud.auth.signOut({ scope: 'local' }); if (error) account.querySelector('#profile-status')!.textContent = 'Não foi possível sair. Tente novamente.'; };
  lock(true);
  cloud.auth.onAuthStateChange((event, next) => {
    session = next;
    if (event === 'PASSWORD_RECOVERY' || (next && setupPassword)) { setupPassword = false; recovery = true; view('password'); }
    else if (!next) { recovery = false; view(confirmationEmail ? 'verify' : 'login'); }
    onSession(next);
    account.querySelector('#profile-email')!.textContent = next?.user.email || '';
    if (next) { pending(''); gate.querySelectorAll<HTMLInputElement>('input[type=password]').forEach(e => e.value = ''); }
    lock(!next || recovery);
    if (next && !recovery && event === 'SIGNED_IN') onAuthenticated();
    if (!next) note(callbackError ? 'O link de confirmação ou recuperação expirou ou não é válido. Solicite um novo link.': confirmationEmail ? 'Confira seu e-mail para confirmar o cadastro. Se precisar, reenvie a confirmação.' : 'Entre ou crie sua conta para usar o Teravs.');
    if (callbackError) history.replaceState(null, '', location.pathname);
  });
  void mountNativeAuth((state, message) => {
    if (state === 'error' && !session) { recovery = false; view('login'); el<HTMLInputElement>('#account-email').value = confirmationEmail; }
    note(message); account.querySelector('#profile-status')!.textContent = message;
  }).catch(() => note('Não foi possível receber o link de confirmação. Tente entrar com sua senha depois de confirmar o e-mail.'));
}
