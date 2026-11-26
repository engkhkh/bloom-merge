import Phaser from 'phaser';
import { LEVELS, LEVELS_PER_WORLD } from '../levels';

let menuPage: number | null = null; // which world page the menu shows
import { ITEMS } from '../objects/MergeLogic';
import { load, save } from '../save';
import { drawBackground, button, ts } from '../art';
import { startMusic } from '../audio';
import { t, toggleLang, isRTL } from '../i18n';
import { unlockedIds } from '../album';
import { season, cyclePreview, SEASON_ICON } from '../season';
import { motionOK } from '../settings';
import { unclaimedCount } from '../quests';
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
    if (motionOK()) this.tweens.add({ targets: title, y: 92, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(w / 2, 152, ITEMS.join(' → '), { fontSize: '26px', color: '#2f5d2a', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 4 }).setOrigin(0.5);

    // Level buttons: one page (world) of 10 at a time, 5 columns x 2 rows
    const worlds = Math.ceil(LEVELS.length / LEVELS_PER_WORLD);
    if (menuPage === null) menuPage = Math.min(worlds - 1, Math.floor((Math.min(data.unlocked, LEVELS.length) - 1) / LEVELS_PER_WORLD));
    const page = menuPage;
    this.add.text(w / 2, 196, s.world(page + 1, s.worldNames[page] ?? ''), ts(22, '#ffffff', {
      fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 5
    })).setOrigin(0.5);
    const arrow = (dir: number, x: number) => {
      const target = page + dir;
      const ok = target >= 0 && target < worlds;
      const a = this.add.text(x, 300, dir < 0 ? '◀' : '▶', ts(34, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 6, rtl: false }))
        .setOrigin(0.5).setAlpha(ok ? 1 : 0.25);
      if (ok) a.setInteractive({ useHandCursor: true }).on('pointerup', () => { menuPage = target; this.scene.restart(); });
    };
    arrow(isRTL() ? 1 : -1, 22);
    arrow(isRTL() ? -1 : 1, w - 22);

    const cols = 5, cell = 92;
    LEVELS.slice(page * LEVELS_PER_WORLD, (page + 1) * LEVELS_PER_WORLD).forEach((lvl, i) => {
      const x = w / 2 + ((i % cols) - (cols - 1) / 2) * cell;
      const y = 250 + Math.floor(i / cols) * 102;
      const locked = lvl.id > data.unlocked;
      const rocky = !!lvl.rocks?.length && !lvl.ice;
      const icy = !!lvl.ice?.length;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.2); g.fillCircle(x, y + 5, 36);
      g.fillStyle(locked ? 0xa7b8a2 : icy ? 0xdff4ff : rocky ? 0xe3e6ea : 0xfff3c4, 1); g.fillCircle(x, y, 36);
      g.lineStyle(5, locked ? 0x7d8f79 : icy ? 0x5fb4e0 : rocky ? 0x7d848c : 0xe0a526, 1); g.strokeCircle(x, y, 36);
      this.add.text(x, y, locked ? '🔒' : String(lvl.id), ts(locked ? 26 : 32, '#5a3b22', { fontStyle: 'bold', rtl: false })).setOrigin(0.5);
      const stars = data.stars[lvl.id] ?? 0;
      this.add.text(x, y + 46, stars ? '⭐'.repeat(stars) : '', { fontSize: '15px' }).setOrigin(0.5);
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

    // Daily Challenge + Daily Quests
    const ds = dailyStatus();
    const qx = isRTL() ? -1 : 1;
    button(this, w / 2 - qx * 58, 542, ds.done ? s.dailyDone(ds.best) : s.daily, () => {
      startMusic();
      this.scene.start('Game', { levelId: 0, daily: true });
    }, 224, 0x8e5bd6);
    button(this, w / 2 + qx * 116, 542, s.quests, () => this.scene.start('Quests'), 108, 0x2f8fd6);
    const todo = unclaimedCount();
    if (todo > 0) this.add.text(w / 2 + qx * 116 + 46, 518, String(todo), ts(16, '#ffffff', {
      fontStyle: 'bold', backgroundColor: '#d63b3b', padding: { x: 7, y: 1 } })).setOrigin(0.5);
    if (ds.streak > 0) {
      this.add.text(w / 2, 583, s.streak(ds.streak), ts(19, '#ffffff', { stroke: '#5a3b22', strokeThickness: 4 })).setOrigin(0.5);
    }

    // Family Garden + Album + My Garden (three across)
    const fx = isRTL() ? 1 : -1;
    button(this, w / 2 + fx * 116, 638, s.family, () => this.chooseFamily(), 108, 0xd6457a);
    const found = unlockedIds().length;
    button(this, w / 2, 638, s.album, () => this.scene.start('Album'), 108, 0xc98a1c);
    this.add.text(w / 2 + 46, 614, String(found), ts(16, '#ffffff', { fontStyle: 'bold', backgroundColor: '#d63b3b', padding: { x: 7, y: 1 } }))
      .setOrigin(0.5).setVisible(found > 0);
    button(this, w / 2 - fx * 116, 638, s.garden, () => this.scene.start('Garden'), 108, 0x2f9a6a);

    // Settings
    button(this, w / 2 - fx * 88, 712, s.editor, () => this.scene.start('Editor'), 164, 0x8e5bd6);
    const kid = button(this, w / 2 + fx * 88, 712, s.kidMode(data.kidMode), () => {
      const d = load(); d.kidMode = !d.kidMode; save(d);
      kid.text.setText(s.kidMode(d.kidMode)).setScale(1);
      if (kid.text.width > 140) kid.text.setScale(140 / kid.text.width);
    }, 164, 0x4e8a46);

    button(this, w / 2, 786, s.settings, () => this.scene.start('Settings'), 340, 0x3f7fbf);

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
