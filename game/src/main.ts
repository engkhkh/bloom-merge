import Phaser from 'phaser';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
// Game font bundled with the app (no internet needed)
import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/latin-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-800.css';
import '@fontsource/baloo-bhaijaan-2/latin-800.css';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { AlbumScene } from './scenes/AlbumScene';
import { EditorScene } from './scenes/EditorScene';
import { GardenScene } from './scenes/GardenScene';

function startGame() {
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#7cc46a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 540,
    height: 900
  },
  scene: [MenuScene, GameScene, AlbumScene, EditorScene, GardenScene]
});
setupBackButton(game);
}

// Android back button: go back to the menu, or close the app from the menu
function setupBackButton(game: Phaser.Game) {
  if (!Capacitor.isNativePlatform()) return;
  App.addListener('backButton', () => {
    const active = game.scene.getScenes(true)[0];
    if (!active || active.scene.key === 'Menu') App.exitApp();
    else active.scene.start('Menu');
  });
}

// Wait (at most 2.5 s) for the game font so text is drawn with it; works offline too
const fontReady = Promise.all([
  document.fonts.load('500 24px "Baloo Bhaijaan 2"', 'Aa ب'),
  document.fonts.load('800 24px "Baloo Bhaijaan 2"', 'Aa ب')
]).catch(() => null);
Promise.race([fontReady, new Promise(r => setTimeout(r, 2500))]).then(startGame);

// Offline support + "Add to Home Screen" (only in production builds)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* not allowed here, ignore */ });
  });
}
