// Garden artwork drawn in code: sky, sun, clouds, hills, flowers and tile textures.
import Phaser from 'phaser';
import { isRTL } from './i18n';
import { season, palette, Season } from './season';

// One rounded font that has both Latin and Arabic letters
export const FONT = '"Baloo Bhaijaan 2", "Segoe UI", Tahoma, Arial, sans-serif';

/** Text style with the game font, and right-to-left when Arabic is on */
export function ts(size: number, color = '#2f5d2a', extra: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT, fontSize: `${size}px`, color, rtl: isRTL(), padding: { top: 4, bottom: 4 }, ...extra };
}

export const TILE_COLORS = [0xd9b98c, 0xc8eba0, 0xffc9de, 0xffe58a, 0xa9dc8f, 0xffb8b0];

export function drawBackground(scene: Phaser.Scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const sn = season();
  const p = palette(sn);
  const g = scene.add.graphics().setDepth(-10);

  // Sky gradient
  g.fillGradientStyle(p.skyTop, p.skyTop, p.skyBottom, p.skyBottom, 1);
  g.fillRect(0, 0, w, h * 0.55);

  if (p.night) {
    // Stars and a crescent moon
    for (let i = 0; i < 40; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.4, 1));
      g.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h * 0.45), Phaser.Math.FloatBetween(0.8, 2));
    }
    g.fillStyle(p.sunGlow, 0.18); g.fillCircle(w - 80, 90, 66);
    g.fillStyle(p.sun, 1); g.fillCircle(w - 80, 90, 40);
    g.fillStyle(p.skyTop, 1); g.fillCircle(w - 64, 80, 36);
  } else {
    g.fillStyle(p.sunGlow, 0.35); g.fillCircle(w - 80, 90, 70);
    g.fillStyle(p.sun, 1); g.fillCircle(w - 80, 90, 44);
  }

  // Back and front hills
  g.fillStyle(p.hillBack, 1);
  g.fillEllipse(w * 0.2, h * 0.55, w * 0.9, 260);
  g.fillEllipse(w * 0.85, h * 0.57, w * 0.9, 240);
  if (sn === 'winter') {
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(w * 0.2, h * 0.55 - 100, w * 0.5, 70);
    g.fillEllipse(w * 0.85, h * 0.57 - 95, w * 0.5, 60);
  }
  g.fillStyle(p.hillFront, 1);
  g.fillRect(0, h * 0.55, w, h * 0.45);

  // Grass tufts and little flowers along the bottom
  const flowerCols = sn === 'autumn' ? [0xe0762b, 0xc0392b, 0xffb300, 0x8e5b2b]
    : sn === 'winter' ? [0xffffff, 0xdcefff, 0xffffff, 0xc9e2f5]
    : sn === 'spring' ? [0xff8fb1, 0xffc2d8, 0xffffff, 0xff8fb1]
    : [0xff8fb1, 0xffffff, 0xffd84a, 0xc39bff];
  for (let i = 0; i < 26; i++) {
    const x = (i / 25) * w + Phaser.Math.Between(-8, 8);
    const y = h - Phaser.Math.Between(12, 40);
    g.fillStyle(p.grass, 1);
    g.fillTriangle(x - 6, y + 14, x, y - 6, x + 6, y + 14);
    if (i % 2 === 0) {
      g.fillStyle(flowerCols[i % 4], 1); g.fillCircle(x + 8, y - 2, 5);
      g.fillStyle(0xffb300, 1); g.fillCircle(x + 8, y - 2, 2);
    }
  }

  // Drifting clouds
  [[90, 70, 1], [330, 140, 0.8]].forEach(([x, y, s]) => {
    const c = scene.add.container(x, y).setDepth(-9).setScale(s);
    const cg = scene.add.graphics();
    cg.fillStyle(p.cloud, p.night ? 0.6 : 0.95);
    cg.fillCircle(0, 0, 26); cg.fillCircle(28, -10, 32); cg.fillCircle(58, 0, 24); cg.fillRoundedRect(-20, 0, 96, 22, 11);
    c.add(cg);
    scene.tweens.add({ targets: c, x: x + 60, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  });

  drawSeasonExtras(scene, sn);
}

/** Lanterns, falling snow, petals, leaves or confetti */
function drawSeasonExtras(scene: Phaser.Scene, sn: Season) {
  const w = scene.scale.width;
  const h = scene.scale.height;

  if (sn === 'ramadan') {
    // Hanging lanterns on a string across the top
    const g = scene.add.graphics().setDepth(-8);
    g.lineStyle(2, 0xffe8a3, 0.8);
    g.beginPath(); g.moveTo(0, 8);
    for (let x = 0; x <= w; x += 10) g.lineTo(x, 8 + Math.sin((x / w) * Math.PI) * 40);
    g.strokePath();
    [0.12, 0.3, 0.5, 0.7, 0.88].forEach((f, i) => {
      const x = f * w;
      const y = 8 + Math.sin(f * Math.PI) * 40;
      const l = scene.add.container(x, y).setDepth(-8);
      const lg = scene.add.graphics();
      const col = [0xffc93c, 0xff7a59, 0x7fd1ff, 0xc39bff, 0x8ee07c][i];
      lg.lineStyle(2, 0xffe8a3, 1); lg.lineBetween(0, 0, 0, 14);
      lg.fillStyle(col, 0.35); lg.fillCircle(0, 34, 26);
      lg.fillStyle(0x8a5a1c, 1); lg.fillRect(-9, 12, 18, 5); lg.fillRect(-9, 52, 18, 5);
      lg.fillStyle(col, 1); lg.fillRoundedRect(-12, 16, 24, 36, 8);
      lg.fillStyle(0xffffff, 0.5); lg.fillRoundedRect(-6, 20, 5, 28, 3);
      l.add(lg);
      scene.tweens.add({ targets: l, angle: { from: -6, to: 6 }, duration: 1800 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });
  }

  type Fall = { chars?: string[]; color?: number[]; size: [number, number]; speed: [number, number]; every: number; sway: number };
  const fall: Partial<Record<Season, Fall>> = {
    winter: { color: [0xffffff], size: [2, 5], speed: [5000, 9000], every: 160, sway: 30 },
    spring: { color: [0xffb7cf, 0xffd6e4, 0xffffff], size: [3, 6], speed: [6000, 10000], every: 380, sway: 60 },
    autumn: { chars: ['🍂', '🍁', '🍂'], size: [16, 24], speed: [6000, 10000], every: 650, sway: 70 },
    eid: { color: [0xff5d73, 0xffc93c, 0x4fc3f7, 0x8ee07c, 0xc39bff], size: [3, 6], speed: [4000, 7000], every: 140, sway: 40 },
    ramadan: { color: [0xfff1b0], size: [1, 2], speed: [9000, 14000], every: 900, sway: 10 }
  };
  const f = fall[sn];
  if (!f) return;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const drop = () => {
    const x = Phaser.Math.Between(-20, w + 20);
    const size = Phaser.Math.Between(f.size[0], f.size[1]);
    let obj: Phaser.GameObjects.GameObject & { x: number; y: number; angle: number; destroy: () => void };
    if (f.chars) {
      obj = scene.add.text(x, -30, Phaser.Utils.Array.GetRandom(f.chars), { fontSize: `${size}px` }).setOrigin(0.5).setDepth(-6);
    } else {
      const c = Phaser.Utils.Array.GetRandom(f.color!);
      obj = sn === 'eid'
        ? scene.add.rectangle(x, -10, size, size * 1.8, c).setDepth(-6)
        : scene.add.circle(x, -10, size, c, 0.9).setDepth(-6);
    }
    scene.tweens.add({
      targets: obj, y: h + 30, x: x + Phaser.Math.Between(-f.sway, f.sway), angle: Phaser.Math.Between(-180, 180),
      duration: Phaser.Math.Between(f.speed[0], f.speed[1]), ease: 'Linear', onComplete: () => obj.destroy()
    });
  };
  for (let i = 0; i < 6; i++) scene.time.delayedCall(i * 200, drop);
  scene.time.addEvent({ delay: f.every, loop: true, callback: drop });

  if (sn === 'eid') {
    // Balloons floating up
    scene.time.addEvent({
      delay: 1800, loop: true, callback: () => {
        const b = scene.add.text(Phaser.Math.Between(20, w - 20), h + 40, '🎈', { fontSize: '34px' }).setOrigin(0.5).setDepth(-6);
        scene.tweens.add({ targets: b, y: -60, x: b.x + Phaser.Math.Between(-40, 40), duration: 9000, onComplete: () => b.destroy() });
      }
    });
  }
}

/** Wooden garden-bed board behind the grid */
export function drawBoardBed(scene: Phaser.Scene, x: number, y: number, size: number) {
  const g = scene.add.graphics().setDepth(-5);
  g.fillStyle(0x000000, 0.15); g.fillRoundedRect(x - 12, y - 6, size + 24, size + 24, 22);
  g.fillStyle(0x9a6b3f, 1); g.fillRoundedRect(x - 14, y - 14, size + 28, size + 28, 22);
  g.fillStyle(0xb5834f, 1); g.fillRoundedRect(x - 8, y - 8, size + 16, size + 16, 18);
  g.fillStyle(0x6e4a2b, 1); g.fillRoundedRect(x - 2, y - 2, size + 4, size + 4, 14);
}

/** One soil cell */
export function drawCell(scene: Phaser.Scene, cx: number, cy: number, s: number) {
  const g = scene.add.graphics().setDepth(-4);
  g.fillStyle(0x5a3b22, 1); g.fillRoundedRect(cx - s / 2, cy - s / 2, s, s, 14);
  g.fillStyle(0x7a5232, 1); g.fillRoundedRect(cx - s / 2 + 3, cy - s / 2 + 3, s - 6, s - 8, 12);
  g.fillStyle(0x8a603b, 0.6);
  for (let i = 0; i < 5; i++) g.fillCircle(cx + Phaser.Math.Between(-30, 30), cy + Phaser.Math.Between(-30, 30), 2);
}

/** Coloured round badge behind each plant, colour depends on its level */
export function makeBadge(scene: Phaser.Scene, level: number, s: number) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.18); g.fillCircle(0, 4, s * 0.42);
  g.fillStyle(TILE_COLORS[level], 1); g.fillCircle(0, 0, s * 0.42);
  g.fillStyle(0xffffff, 0.35); g.fillCircle(-s * 0.12, -s * 0.14, s * 0.16);
  return g;
}

/** Rounded button with text */
export function button(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, w = 260, color = 0x4e8a46) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.2); g.fillRoundedRect(-w / 2, -24, w, 56, 28);
  g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, -28, w, 56, 28);
  g.fillStyle(0xffffff, 0.18); g.fillRoundedRect(-w / 2 + 10, -24, w - 20, 18, 9);
  const t = scene.add.text(0, 0, label, ts(26, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5);
  if (t.width > w - 24) t.setScale((w - 24) / t.width); // shrink long labels to fit
  c.add([g, t]);
  c.setSize(w, 56).setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => c.setScale(0.95));
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerup', () => { c.setScale(1); onClick(); });
  return { container: c, text: t };
}

/** A grey garden rock sitting in a soil cell */
export function drawRock(scene: Phaser.Scene, cx: number, cy: number, s: number) {
  const g = scene.add.graphics().setDepth(-3);
  g.fillStyle(0x000000, 0.25); g.fillEllipse(cx, cy + s * 0.24, s * 0.78, s * 0.22);
  g.fillStyle(0x7d848c, 1);
  g.fillEllipse(cx - s * 0.08, cy + s * 0.04, s * 0.62, s * 0.5);
  g.fillEllipse(cx + s * 0.14, cy + s * 0.1, s * 0.46, s * 0.38);
  g.fillStyle(0x9aa2ab, 1); g.fillEllipse(cx - s * 0.12, cy - s * 0.04, s * 0.42, s * 0.3);
  g.fillStyle(0xc2c8ce, 1); g.fillEllipse(cx - s * 0.18, cy - s * 0.1, s * 0.16, s * 0.09);
  g.fillStyle(0x6aa84f, 1); g.fillEllipse(cx + s * 0.2, cy - s * 0.04, s * 0.14, s * 0.07); // moss
}

/** Ice block drawn over a frozen plant */
export function drawIce(scene: Phaser.Scene, s: number) {
  const g = scene.add.graphics();
  const h = s / 2 - 4;
  g.fillStyle(0xbfe9ff, 0.55); g.fillRoundedRect(-h, -h, h * 2, h * 2, 14);
  g.lineStyle(3, 0xffffff, 0.9); g.strokeRoundedRect(-h, -h, h * 2, h * 2, 14);
  g.lineStyle(3, 0xffffff, 0.75);
  g.lineBetween(-h + 10, -h + 24, -h + 24, -h + 10);
  g.lineBetween(-h + 10, -h + 38, -h + 38, -h + 10);
  g.lineStyle(2, 0x8fd0f0, 0.8);
  g.lineBetween(h - 30, h - 8, h - 12, h - 26); // crack
  g.lineBetween(h - 12, h - 26, h - 20, h - 34);
  return g;
}
