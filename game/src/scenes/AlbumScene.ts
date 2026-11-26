import Phaser from 'phaser';
import { drawBackground, ts, showStory } from '../art';
import { STORY, seen } from '../story';
import { t, lang, isRTL } from '../i18n';
import { VISITORS, unlockedIds } from '../album';

export class AlbumScene extends Phaser.Scene {
  constructor() { super('Album'); }

  create() {
    const s = t();
    const L = lang();
    const w = this.scale.width;
    drawBackground(this);
    const have = new Set(unlockedIds());

    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('Menu'));

    this.add.text(w / 2, 82, s.albumTitle, ts(46, '#ffffff', { fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 9 })).setOrigin(0.5);
    // Replay the story chapters you've already seen
    const seenBeats = STORY.filter(b => seen(b.id));
    if (seenBeats.length) {
      const st = this.add.text(isRTL() ? 24 : w - 24, 18, s.storyBtn, ts(22, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
        .setOrigin(isRTL() ? 0 : 1, 0).setInteractive({ useHandCursor: true });
      st.on('pointerup', () => {
        const play = (i: number) => { if (i < seenBeats.length) showStory(this, seenBeats[i], () => play(i + 1)); };
        play(0);
      });
    }
    this.add.text(w / 2, 138, s.albumCount(have.size, VISITORS.length), ts(22, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5);

    // 3 columns x 4 rows of cards
    const cw = 156, ch = 150, gap = 12;
    const x0 = (w - (3 * cw + 2 * gap)) / 2;
    VISITORS.forEach((v, i) => {
      const col = isRTL() ? 2 - (i % 3) : i % 3;
      const row = Math.floor(i / 3);
      const x = x0 + col * (cw + gap);
      const y = 180 + row * (ch + gap);
      const found = have.has(v.id);

      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15); g.fillRoundedRect(x, y + 5, cw, ch, 22);
      g.fillStyle(found ? 0xfff7d6 : 0xdfe8da, 1); g.fillRoundedRect(x, y, cw, ch, 22);
      g.lineStyle(4, found ? 0xe0a526 : 0xa7b8a2, 1); g.strokeRoundedRect(x, y, cw, ch, 22);

      const em = this.add.text(x + cw / 2, y + 52, found ? v.emoji : '❔', { fontSize: '56px' }).setOrigin(0.5);
      if (!found) em.setAlpha(0.45);
      else this.tweens.add({ targets: em, y: y + 46, duration: 900 + i * 60, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

      this.add.text(x + cw / 2, y + 104, found ? v.name[L] : v.hint[L], ts(found ? 22 : 17, found ? '#2f5d2a' : '#5f6f5b', {
        fontStyle: found ? 'bold' : 'normal', align: 'center', wordWrap: { width: cw - 16 }
      })).setOrigin(0.5);
    });
  }
}
