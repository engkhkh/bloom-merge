// Where the game is running: native phone app, desktop app, or a web browser
import { Capacitor } from '@capacitor/core';

export const RELEASES_URL = 'https://github.com/engkhkh/bloom-merge/releases/latest';

export const isNative = () => Capacitor.isNativePlatform();
export const isDesktopApp = () => /Electron/i.test(navigator.userAgent);
export const isWeb = () => !isNative() && !isDesktopApp();

// Browsers that support installing web apps (Chrome, Edge, Android) fire this event once
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }>; }
let installEvent: InstallEvent | null = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e as InstallEvent; });

/** Offer to install the web app; if the browser can't, open the downloads page */
export async function getTheApp() {
  if (installEvent) {
    const ev = installEvent;
    installEvent = null;
    try { await ev.prompt(); return; } catch { /* fall through to downloads */ }
  }
  try { window.open(RELEASES_URL, '_blank', 'noopener'); } catch { location.href = RELEASES_URL; }
}
