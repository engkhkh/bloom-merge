import Phaser from 'phaser';
import { drawBackground, button, ts } from '../art';
import { t, lang, isRTL } from '../i18n';
import { todayQuests, questProgress, isClaimed, claim, drops } from '../quests';
import { Sfx, buzz } from '../audio';

export class QuestsScene extends Phaser.Scene {
  constructor() { super('Quests'); }

  create() {
    const s = t();
    const w = this.scale.width;
    drawBackground(this);

    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('Menu'));
    this.add.text(w / 2, 80, s.questsTitle, ts(46, '#ffffff', { fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 9 })).setOrigin(0.5);
    this.add.text(w / 2, 136, s.dropsHave(drops()), ts(24, '#ffffff', {
      fontStyle: 'bold', backgroundColor: '#2f8fd6', padding: { x: 16, y: 6 }
    })).setOrigin(0.5);

    todayQuests().forEach((q, i) => {
      const y = 200 + i * 150;
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.15); g.fillRoundedRect(30, y + 5, w - 60, 130, 24);
      g.fillStyle(0xffffff, 0.95); g.fillRoundedRect(30, y, w - 60, 130, 24);
      const tx = isRTL() ? w - 54 : 54;
      this.add.text(tx, y + 18, lang() === 'ar' ? q.ar : q.en, ts(24, '#2f5d2a', { fontStyle: 'bold', wordWrap: { width: w - 230 } }))
        .setOrigin(isRTL() ? 1 : 0, 0);
      this.add.text(tx, y + 54, s.reward(q.reward), ts(18, '#2f8fd6', { fontStyle: 'bold' })).setOrigin(isRTL() ? 1 : 0, 0);

      // Progress bar
      const p = questProgress(q);
      const bw = w - 230, bx = isRTL() ? w - 54 - bw : 54;
      g.fillStyle(0xdfe8da, 1); g.fillRoundedRect(bx, y + 92, bw, 18, 9);
      g.fillStyle(0x4e8a46, 1);
      const fw = Math.max(18, (bw * p) / q.target);
      g.fillRoundedRect(isRTL() ? bx + bw - fw : bx, y + 92, fw, 18, 9);
      this.add.text(bx + bw / 2, y + 101, `${p}/${q.target}`, ts(14, '#1f3a1b', { fontStyle: 'bold', rtl: false })).setOrigin(0.5);

      const bxBtn = isRTL() ? 106 : w - 106;
      if (isClaimed(q)) {
        this.add.text(bxBtn, y + 65, s.claimed, ts(20, '#4e8a46', { fontStyle: 'bold' })).setOrigin(0.5);
      } else if (p >= q.target) {
        const b = button(this, bxBtn, y + 65, s.claim, () => {
          if (claim(q) > 0) { Sfx.win(); buzz(30); this.scene.restart(); }
        }, 130, 0xe0762b);
        this.tweens.add({ targets: b.container, scale: 1.06, duration: 500, yoyo: true, repeat: -1 });
      } else {
        this.add.text(bxBtn, y + 65, '⏳', { fontSize: '34px' }).setOrigin(0.5);
      }
    });

    this.add.text(w / 2, 680, s.questsHint, ts(18, '#2f5d2a', {
      align: 'center', wordWrap: { width: w - 80 }, backgroundColor: '#ffffffcc', padding: { x: 12, y: 8 }
    })).setOrigin(0.5);
  }
}
