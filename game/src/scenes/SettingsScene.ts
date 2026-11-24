import Phaser from 'phaser';
import { drawBackground, button, ts } from '../art';
import { t, isRTL, toggleLang } from '../i18n';
import { load, save, resetProgress, SaveData } from '../save';
import { toggleMusic, toggleSound, buzz, Sfx } from '../audio';

type Key = 'sound' | 'music' | 'vibrate' | 'reduceMotion' | 'markers';

export class SettingsScene extends Phaser.Scene {
  private confirmReset = false;

  constructor() { super('Settings'); }

  create() {
    const s = t();
    const w = this.scale.width;
    this.confirmReset = false;
    drawBackground(this);

    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('Menu'));
    this.add.text(w / 2, 80, s.settingsTitle, ts(46, '#ffffff', { fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 9 })).setOrigin(0.5);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.92); panel.fillRoundedRect(24, 128, w - 48, 520, 26);

    // Each row: label, short help, and an ON/OFF switch
    const rows: { key: Key; label: string; help: string; on: (d: SaveData) => boolean; toggle: () => void }[] = [
      { key: 'sound', label: s.setSound, help: s.setSoundHelp, on: d => d.sound !== false, toggle: () => { toggleSound(); } },
      { key: 'music', label: s.setMusic, help: s.setMusicHelp, on: d => d.music !== false, toggle: () => { toggleMusic(); } },
      { key: 'vibrate', label: s.setVibrate, help: s.setVibrateHelp, on: d => d.vibrate !== false,
        toggle: () => { const d = load(); d.vibrate = d.vibrate === false; save(d); buzz(30); } },
      { key: 'reduceMotion', label: s.setMotion, help: s.setMotionHelp, on: d => !!d.reduceMotion,
        toggle: () => { const d = load(); d.reduceMotion = !d.reduceMotion; save(d); } },
      { key: 'markers', label: s.setMarkers, help: s.setMarkersHelp, on: d => !!d.markers,
        toggle: () => { const d = load(); d.markers = !d.markers; save(d); } }
    ];

    rows.forEach((r, i) => {
      const y = 170 + i * 92;
      const tx = isRTL() ? w - 48 : 48;
      const org = isRTL() ? 1 : 0;
      this.add.text(tx, y, r.label, ts(24, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(org, 0);
      this.add.text(tx, y + 36, r.help, ts(16, '#5f6f5b', { wordWrap: { width: w - 230 } })).setOrigin(org, 0);
      const sx = isRTL() ? 96 : w - 96;
      const sw = this.add.container(sx, y + 28);
      const draw = () => {
        sw.removeAll(true);
        const on = r.on(load());
        const g = this.add.graphics();
        g.fillStyle(on ? 0x4e8a46 : 0xb8c2b4, 1); g.fillRoundedRect(-38, -20, 76, 40, 20);
        g.fillStyle(0xffffff, 1); g.fillCircle(on ? 18 : -18, 0, 16);
        sw.add(g);
      };
      draw();
      sw.setSize(90, 50).setInteractive({ useHandCursor: true });
      sw.on('pointerup', () => { r.toggle(); Sfx.pick(); draw(); });
    });

    // Language
    button(this, w / 2, 700, `🌐 ${s.lang}`, () => { toggleLang(); this.scene.restart(); }, 340, 0x3f7fbf);

    // Reset progress: needs a second tap within 4 seconds
    const reset = button(this, w / 2, 780, s.resetProgress, () => {
      if (!this.confirmReset) {
        this.confirmReset = true;
        reset.text.setText(s.resetConfirm);
        Sfx.bad();
        this.time.delayedCall(4000, () => { if (this.scene.isActive()) { this.confirmReset = false; reset.text.setText(s.resetProgress); } });
        return;
      }
      resetProgress();
      this.scene.start('Menu');
    }, 340, 0xc0392b);
    this.add.text(w / 2, 838, s.resetHelp, ts(16, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 4 })).setOrigin(0.5);
  }
}
