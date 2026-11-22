import Phaser from 'phaser';
import { LEVELS } from '../levels';
import { ITEMS } from '../objects/MergeLogic';
import { load, save } from '../save';
import { drawBackground, button, ts } from '../art';
import { startMusic, toggleMusic, toggleSound } from '../audio';
import { t, toggleLang, isRTL } from '../i18n';
import { unlockedIds } from '../album';
import { season, cyclePreview, SEASON_ICON } from '../season';
import { dailyStatus } from '../daily';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const data = load();
    const s = t();
    const w = this.scale.width;
    drawBackground(this);

    // Language switch (top corner)
    const lang = this.add.text(20, 16, `🌐 ${s.lang}`, ts(22, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5, rtl: false }))
      .setInteractive({ useHandCursor: true });
    lang.on('pointerup', () => { toggleLang(); this.scene.restart(); });

    // Season badge (tap to preview the other seasons)
    const sn = season();
    const badge = this.add.text(w - 16, 16, `${SEASON_ICON[sn]} ${s.seasons[sn]}`, ts(20, '#ffffff', {
      stroke: '#2f5d2a', strokeThickness: 5, rtl: false
    })).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    badge.on('pointerup', () => { cyclePreview(); this.scene.restart(); });

    // Title with bounce
    const title = this.add.text(w / 2, 82, s.title, ts(58, '#ffffff', {
      fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 10
    })).setOrigin(0.5);
    this.tweens.add({ targets: title, y: 92, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(w / 2, 152, ITEMS.join(' → '), { fontSize: '26px', color: '#2f5d2a', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 4 }).setOrigin(0.5);

    // Level buttons: 5 columns x 2 rows
    const cols = 5, cell = 92;
    LEVELS.forEach((lvl, i) => {
      const x = w / 2 + ((i % cols) - (cols - 1) / 2) * cell;
      const y = 240 + Math.floor(i / cols) * 106;
      const locked = lvl.id > data.unlocked;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.2); g.fillCircle(x, y + 5, 36);
      g.fillStyle(locked ? 0xa7b8a2 : 0xfff3c4, 1); g.fillCircle(x, y, 36);
      g.lineStyle(5, locked ? 0x7d8f79 : 0xe0a526, 1); g.strokeCircle(x, y, 36);
      this.add.text(x, y, locked ? '🔒' : String(lvl.id), ts(locked ? 26 : 32, '#5a3b22', { fontStyle: 'bold', rtl: false })).setOrigin(0.5);
      const stars = data.stars[lvl.id] ?? 0;
      this.add.text(x, y + 48, stars ? '⭐'.repeat(stars) : '', { fontSize: '15px' }).setOrigin(0.5);
      if (!locked) {
        const hit = this.add.circle(x, y, 40, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        hit.on('pointerup', () => { startMusic(); this.scene.start('Game', { levelId: lvl.id }); });
      }
    });

    // Play (continue) button
    const next = Math.min(data.unlocked, LEVELS.length);
    button(this, w / 2, 470, s.play(next), () => {
      startMusic();
      this.scene.start('Game', { levelId: next });
    }, 340, 0xe0762b);

    // Daily Challenge
    const ds = dailyStatus();
    button(this, w / 2, 542, ds.done ? s.dailyDone(ds.best) : s.daily, () => {
      startMusic();
      this.scene.start('Game', { levelId: 0, daily: true });
    }, 340, 0x8e5bd6);
    if (ds.streak > 0) {
      this.add.text(w / 2, 583, s.streak(ds.streak), ts(19, '#ffffff', { stroke: '#5a3b22', strokeThickness: 4 })).setOrigin(0.5);
    }

    // Family Garden + Album
    const fx = isRTL() ? 1 : -1;
    button(this, w / 2 + fx * 88, 638, s.family, () => this.chooseFamily(), 164, 0xd6457a);
    const found = unlockedIds().length;
    button(this, w / 2 - fx * 88, 638, s.album, () => this.scene.start('Album'), 164, 0xc98a1c);
    this.add.text(w / 2 - fx * 88 + 70, 614, String(found), ts(16, '#ffffff', { fontStyle: 'bold', backgroundColor: '#d63b3b', padding: { x: 7, y: 1 } }))
      .setOrigin(0.5).setVisible(found > 0);

    // Settings
    const kid = button(this, w / 2, 712, s.kidMode(data.kidMode), () => {
      const d = load(); d.kidMode = !d.kidMode; save(d);
      kid.text.setText(s.kidMode(d.kidMode));
    }, 340);

    const snd = button(this, w / 2 - 88, 786, data.sound === false ? s.soundOff : s.sound, () => {
      snd.text.setText(toggleSound() ? s.sound : s.soundOff);
    }, 164, 0x3f7fbf);
    const mus = button(this, w / 2 + 88, 786, data.music === false ? s.musicOff : s.music, () => {
      mus.text.setText(toggleMusic() ? s.music : s.musicOff);
    }, 164, 0x3f7fbf);

    this.add.text(w / 2, 852, s.kidHint, ts(17, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 4 })).setOrigin(0.5);
  }

  /** Pop-up to pick 2, 3 or 4 players for Family Garden */
  private chooseFamily() {
    const s = t();
    const w = this.scale.width;
    const h = this.scale.height;
    const layer: Phaser.GameObjects.GameObject[] = [];
    layer.push(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45).setDepth(20).setInteractive());
    const card = this.add.graphics().setDepth(21);
    card.fillStyle(0xfff7d6, 1); card.fillRoundedRect(w / 2 - 210, h / 2 - 170, 420, 340, 30);
    card.lineStyle(6, 0xd6457a, 1); card.strokeRoundedRect(w / 2 - 210, h / 2 - 170, 420, 340, 30);
    layer.push(card);
    layer.push(this.add.text(w / 2, h / 2 - 125, s.familyTitle, ts(32, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(22));
    layer.push(this.add.text(w / 2, h / 2 - 80, s.howMany, ts(22, '#5a3b22')).setOrigin(0.5).setDepth(22));
    [2, 3, 4].forEach((n, k) => {
      const b = button(this, w / 2 + (k - 1) * 125, h / 2, s.players(n), () => {
        startMusic();
        this.scene.start('Game', { levelId: -1, family: n });
      }, 110, 0xd6457a);
      b.container.setDepth(22);
      layer.push(b.container);
    });
    const c = button(this, w / 2, h / 2 + 100, s.cancel, () => layer.forEach(o => o.destroy()), 220, 0x7d8f79);
    c.container.setDepth(22);
    layer.push(c.container);
  }
}
