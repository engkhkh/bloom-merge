import Phaser from 'phaser';
import { drawBackground, ts } from '../art';
import { t, lang, isRTL } from '../i18n';
import { ITEMS } from '../objects/MergeLogic';
import { DECOR_LEVELS, MAX_PLACED, Placed, available, placed, savePlaced } from '../garden';
import { VISITORS, unlockedIds } from '../album';
import { Sfx, buzz } from '../audio';
import { track } from '../quests';

const LAWN_TOP = 250;
const LAWN_BOTTOM = 720;
const TRAY_Y = 800;

export class GardenScene extends Phaser.Scene {
  private list: Placed[] = [];
  private selected: number | null = null;
  private trayCounts: Phaser.GameObjects.Text[] = [];
  private trayRings: Phaser.GameObjects.Graphics[] = [];

  constructor() { super('Garden'); }

  create() {
    const s = t();
    const w = this.scale.width;
    drawBackground(this);
    this.list = placed();
    this.selected = null;

    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0).setInteractive({ useHandCursor: true }).setDepth(2000);
    back.on('pointerup', () => this.scene.start('Menu'));
    this.add.text(w / 2, 78, s.gardenTitle, ts(46, '#ffffff', { fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 9 })).setOrigin(0.5).setDepth(2000);
    this.add.text(w / 2, 150, s.gardenHint, ts(18, '#2f5d2a', {
      fontStyle: 'bold', align: 'center', wordWrap: { width: w - 60 }, backgroundColor: '#ffffffcc', padding: { x: 12, y: 6 }
    })).setOrigin(0.5).setDepth(2000);

    // Lawn: tap to plant the selected item
    const lawn = this.add.graphics().setDepth(1);
    lawn.fillStyle(0x8fd47a, 1); lawn.fillRoundedRect(16, LAWN_TOP - 20, w - 32, LAWN_BOTTOM - LAWN_TOP + 50, 40);
    lawn.fillStyle(0xa3de8f, 1);
    for (let i = 0; i < 40; i++) lawn.fillEllipse(Phaser.Math.Between(40, w - 40), Phaser.Math.Between(LAWN_TOP, LAWN_BOTTOM), 26, 8);
    const zone = this.add.zone(w / 2, (LAWN_TOP + LAWN_BOTTOM) / 2, w - 32, LAWN_BOTTOM - LAWN_TOP + 40).setInteractive().setDepth(2);
    zone.on('pointerup', (p: Phaser.Input.Pointer) => this.plantAt(p.worldX, p.worldY));

    this.list.forEach(p => this.addPlant(p, false));
    this.drawTray();
    this.addVisitors();

    if (DECOR_LEVELS.every(l => available(this.list)[l] === 0) && this.list.length === 0) {
      this.add.text(w / 2, (LAWN_TOP + LAWN_BOTTOM) / 2, s.gardenEmpty, ts(22, '#2f5d2a', {
        fontStyle: 'bold', align: 'center', wordWrap: { width: w - 100 }
      })).setOrigin(0.5).setDepth(3);
    }

    // Dragging a placed plant moves it; dropping it on the basket puts it back
    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text) => obj.setScale(1.2));
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text, x: number, y: number) => {
      obj.setPosition(x, y).setDepth(1500);
    });
    this.input.on('dragend', (p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Text) => {
      const item = obj.getData('item') as Placed;
      if (p.worldY > LAWN_BOTTOM + 30) {           // dropped on the basket
        this.list = this.list.filter(x => x !== item);
        obj.destroy();
        Sfx.drop();
      } else {
        item.x = Phaser.Math.Clamp(Math.round(p.worldX), 40, w - 40);
        item.y = Phaser.Math.Clamp(Math.round(p.worldY), LAWN_TOP, LAWN_BOTTOM);
        obj.setPosition(item.x, item.y).setScale(1).setDepth(10 + item.y);
      }
      savePlaced(this.list);
      this.refreshTray();
    });
  }

  private addPlant(p: Placed, pop: boolean) {
    const size = [0, 0, 44, 50, 64, 70][p.l];
    const o = this.add.text(p.x, p.y, ITEMS[p.l], { fontSize: `${size}px` }).setOrigin(0.5, 0.85).setDepth(10 + p.y);
    o.setData('item', p).setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(o);
    if (pop) { o.setScale(0); this.tweens.add({ targets: o, scale: 1, duration: 260, ease: 'Back.Out' }); }
    this.tweens.add({ targets: o, angle: { from: -2, to: 2 }, duration: 1800 + Math.random() * 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private plantAt(x: number, y: number) {
    if (this.selected === null) return;
    const left = available(this.list)[this.selected];
    if (left <= 0 || this.list.length >= MAX_PLACED) { Sfx.bad(); return; }
    const p: Placed = { l: this.selected, x: Math.round(x), y: Math.round(Phaser.Math.Clamp(y, LAWN_TOP, LAWN_BOTTOM)) };
    this.list.push(p);
    savePlaced(this.list);
    this.addPlant(p, true);
    Sfx.merge(p.l);
    buzz(12);
    track('plant');
    this.refreshTray();
  }

  private drawTray() {
    const w = this.scale.width;
    const g = this.add.graphics().setDepth(1900);
    g.fillStyle(0x9a6b3f, 1); g.fillRoundedRect(20, TRAY_Y - 58, w - 40, 116, 30);
    g.fillStyle(0xb5834f, 1); g.fillRoundedRect(28, TRAY_Y - 50, w - 56, 100, 24);
    const step = (w - 80) / DECOR_LEVELS.length;
    DECOR_LEVELS.forEach((l, k) => {
      const x = 40 + step * (isRTL() ? DECOR_LEVELS.length - 1 - k : k) + step / 2;
      const ring = this.add.graphics().setDepth(1901);
      this.trayRings.push(ring);
      const icon = this.add.text(x, TRAY_Y - 6, ITEMS[l], { fontSize: '46px' }).setOrigin(0.5).setDepth(1902)
        .setInteractive({ useHandCursor: true });
      icon.on('pointerup', () => {
        if (available(this.list)[l] <= 0) { Sfx.bad(); return; }
        this.selected = this.selected === l ? null : l;
        Sfx.pick();
        this.refreshTray();
      });
      ring.setData('x', x).setData('l', l);
      this.trayCounts.push(this.add.text(x + 30, TRAY_Y + 26, '', ts(18, '#ffffff', {
        fontStyle: 'bold', backgroundColor: '#5a3b22', padding: { x: 7, y: 1 }, rtl: false
      })).setOrigin(0.5).setDepth(1903));
    });
    this.refreshTray();
  }

  private refreshTray() {
    const left = available(this.list);
    DECOR_LEVELS.forEach((l, k) => {
      this.trayCounts[k].setText(String(left[l]));
      const ring = this.trayRings[k];
      ring.clear();
      if (this.selected === l) {
        ring.lineStyle(5, 0xffe066, 1);
        ring.strokeCircle(ring.getData('x'), TRAY_Y - 6, 38);
      }
    });
    if (this.selected !== null && left[this.selected] <= 0) { this.selected = null; this.refreshTray(); }
  }

  /** Collected Album animals wander around the garden */
  private addVisitors() {
    const w = this.scale.width;
    const have = new Set(unlockedIds());
    VISITORS.filter(v => have.has(v.id)).forEach((v, i) => {
      const flying = ['bee', 'bird', 'ladybug'].includes(v.id);
      const x = Phaser.Math.Between(60, w - 60);
      const y = Phaser.Math.Between(LAWN_TOP + 20, LAWN_BOTTOM - 10);
      const a = this.add.text(x, y, v.emoji, { fontSize: '34px' }).setOrigin(0.5, 0.9).setDepth(10 + y);
      a.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        Sfx.pick();
        const tag = this.add.text(a.x, a.y - 44, v.name[lang()], ts(18, '#ffffff', { backgroundColor: '#2f5d2a', padding: { x: 8, y: 3 } }))
          .setOrigin(0.5).setDepth(1800);
        this.tweens.add({ targets: tag, y: tag.y - 20, alpha: 0, delay: 900, duration: 500, onComplete: () => tag.destroy() });
      });
      const wander = () => {
        const nx = Phaser.Math.Clamp(a.x + Phaser.Math.Between(-120, 120), 40, w - 40);
        const ny = Phaser.Math.Clamp(a.y + Phaser.Math.Between(-80, 80), LAWN_TOP + 10, LAWN_BOTTOM);
        a.setFlipX(nx < a.x);
        this.tweens.add({
          targets: a, x: nx, y: ny, duration: flying ? 1600 : 2600 + i * 100, ease: 'Sine.InOut',
          onUpdate: () => a.setDepth(10 + a.y), onComplete: () => this.time.delayedCall(Phaser.Math.Between(600, 2200), wander)
        });
        if (!flying) this.tweens.add({ targets: a, scaleY: 0.9, duration: 180, yoyo: true, repeat: 3 }); // little hops
      };
      this.time.delayedCall(Phaser.Math.Between(200, 1500), wander);
    });
  }
}
