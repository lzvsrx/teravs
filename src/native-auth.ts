import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { cloud } from './cloud';
import { createAuthReturn, type AuthReturnState } from './auth-return';

export const authRedirect = Capacitor.isNativePlatform()
  ? 'teravs://auth/callback'
  : 'https://lzvsrx.github.io/teravs/';

export async function mountNativeAuth(notify: (state: AuthReturnState, message: string) => void) {
  if (!Capacitor.isNativePlatform()) return;
  const receive = createAuthReturn(cloud.auth, notify);
  await App.addListener('appUrlOpen', event => { void receive(event.url); });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await receive(launch.url);
}
