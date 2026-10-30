// Supabase's SDK owns the PKCE verifier and the authenticated session.
export type AuthReturnState = 'processing' | 'success' | 'error';
type AuthExchange = {
  exchangeCodeForSession(code: string, options?: { flowId: string }): Promise<{ error: unknown; data?: { session?: unknown } }>;
};
export function createAuthReturn(auth: AuthExchange, notify: (state: AuthReturnState, message: string) => void) {
  const seen = new Set<string>();
  let queue = Promise.resolve();
  return (raw: string): Promise<void> => {
    let url: URL;
    try { url = new URL(raw); } catch { return Promise.resolve(); }
    if (url.protocol !== 'teravs:' || url.hostname !== 'auth' || url.pathname !== '/callback' || url.port || url.username || url.password) return Promise.resolve();
    if (seen.has(raw)) return queue;
    if (seen.size >= 32) seen.delete(seen.values().next().value!);
    seen.add(raw);
    queue = queue.then(async () => {
      const code = url.searchParams.get('code');
      const flowId = url.searchParams.get('sb_flow_id');
      const fragment = new URLSearchParams(url.hash.slice(1));
      if (url.searchParams.has('error') || fragment.has('error') || fragment.has('error_code') || !code || code.length > 2048 || /\s/.test(code) || (flowId !== null && !/^[a-zA-Z0-9_-]{8,64}$/.test(flowId))) {
        notify('error', 'O link de confirmação ou recuperação expirou ou não é válido. Solicite um novo link.');
        return;
      }
      notify('processing', 'Confirmando seu e-mail no aplicativo…');
      try {
        const result = await auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
        if (result.error || !result.data?.session) throw Error('Exchange failed');
        notify('success', 'Link confirmado neste aplicativo.');
      } catch {
        notify('error', 'Não foi possível concluir pelo link. Use o aplicativo onde pediu a confirmação ou entre com sua senha após confirmar o e-mail.');
      }
    });
    return queue;
  };
}
