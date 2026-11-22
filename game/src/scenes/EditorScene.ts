import Phaser from 'phaser';
import { drawBackground, button, ts } from '../art';
import { t, isRTL } from '../i18n';
import { ITEMS } from '../objects/MergeLogic';
import { Custom, LIMITS, newSeed, toCode, fromCode, difficulty } from '../custom';
import { startMusic } from '../audio';

const DIFF_COLORS = ['#2f9a3a', '#c99700', '#e0762b', '#c0392b'];

export class EditorScene extends Phaser.Scene {
  private c!: Custom;
  private codeText!: Phaser.GameObjects.Text;
  private diffText!: Phaser.GameObjects.Text;
  private codeInput?: HTMLInputElement;

  constructor() { super('Editor'); }

  init(data: { custom?: Custom }) {
    this.c = data.custom ?? { goalLevel: 3, goalCount: 2, moves: 40, startSeeds: 8, seed: newSeed() };
  }

  create() {
    const s = t();
    const w = this.scale.width;
    drawBackground(this);
    this.events.once('shutdown', () => this.closeInput());

    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start('Menu'));

    this.add.text(w / 2, 82, s.editorTitle, ts(44, '#ffffff', { fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 9 })).setOrigin(0.5);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.9); panel.fillRoundedRect(30, 130, w - 60, 420, 26);

    // One row per setting: label, minus, value, plus
    const rows: { label: string; key: keyof typeof LIMITS; step: number; show: () => string }[] = [
      { label: s.edGoal, key: 'goalLevel', step: 1, show: () => `${ITEMS[this.c.goalLevel]}` },
      { label: s.edCount, key: 'goalCount', step: 1, show: () => `${this.c.goalCount}` },
      { label: s.edMoves, key: 'moves', step: 5, show: () => `${this.c.moves}` },
      { label: s.edSeeds, key: 'startSeeds', step: 1, show: () => `${this.c.startSeeds} ${ITEMS[0]}` }
    ];
    rows.forEach((r, i) => {
      const y = 180 + i * 82;
      const lx = isRTL() ? w - 56 : 56;
      this.add.text(lx, y, r.label, ts(24, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(isRTL() ? 1 : 0, 0.5);
      const cx = isRTL() ? 160 : w - 160;
      const val = this.add.text(cx, y, r.show(), ts(r.key === 'goalLevel' ? 40 : 30, '#5a3b22', { fontStyle: 'bold', rtl: false })).setOrigin(0.5);
      const change = (d: number) => {
        const [a, b] = LIMITS[r.key];
        this.c[r.key] = Math.min(b, Math.max(a, this.c[r.key] + d * r.step));
        val.setText(r.show());
        this.refresh();
      };
      button(this, cx - 82, y, '−', () => change(-1), 52, 0x7d8f79);
      button(this, cx + 82, y, '+', () => change(1), 52, 0x4e8a46);
    });

    this.diffText = this.add.text(w / 2, 505, '', ts(22, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5);

    // Share code
    this.codeText = this.add.text(w / 2, 590, '', ts(30, '#ffffff', {
      fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 6, rtl: false
    })).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.codeText.on('pointerup', () => this.copy());

    button(this, w / 2, 660, s.edPlay, () => {
      startMusic();
      this.scene.start('Game', { levelId: -2, custom: this.c });
    }, 340, 0xe0762b);
    button(this, w / 2 - 88, 738, s.edCopy, () => this.copy(), 164, 0x3f7fbf);
    button(this, w / 2 + 88, 738, s.edNewBoard, () => { this.c.seed = newSeed(); this.refresh(); }, 164, 0x8e5bd6);
    button(this, w / 2, 812, s.edEnter, () => this.openInput(), 340, 0xd6457a);

    this.refresh();
  }

  private refresh() {
    const s = t();
    const d = difficulty(this.c);
    this.diffText.setText(`${s.edDifficulty}: ${s.edLevels[d]}`).setColor(DIFF_COLORS[d]);
    this.codeText.setText(toCode(this.c));
  }

  private copy() {
    const code = toCode(this.c);
    const done = () => this.flash(t().edCopied);
    try {
      navigator.clipboard.writeText(code).then(done, () => this.flash(code));
    } catch { this.flash(code); }
  }

  private flash(msg: string) {
    const w = this.scale.width;
    const tip = this.add.text(w / 2, 545, msg, ts(20, '#ffffff', { backgroundColor: '#2f5d2a', padding: { x: 14, y: 6 } }))
      .setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: tip, alpha: 0, delay: 1400, duration: 400, onComplete: () => tip.destroy() });
  }

  /** A real text box over the canvas, so phones show their keyboard */
  private openInput() {
    if (this.codeInput) return;
    const s = t();
    const canvas = this.game.canvas.getBoundingClientRect();
    const scale = canvas.width / this.scale.width;
    const el = document.createElement('input');
    el.placeholder = 'BM-3-2-40-8-1234';
    el.autocapitalize = 'characters';
    el.setAttribute('aria-label', s.edEnter);
    Object.assign(el.style, {
      position: 'fixed', left: `${canvas.left + 60 * scale}px`, top: `${canvas.top + 860 * scale - 26}px`,
      width: `${(this.scale.width - 120) * scale}px`, height: '52px', fontSize: '20px', textAlign: 'center',
      border: '3px solid #d6457a', borderRadius: '26px', outline: 'none', zIndex: '10', boxSizing: 'border-box'
    });
    document.body.appendChild(el);
    this.codeInput = el;
    el.focus();
    const go = () => {
      const c = fromCode(el.value);
      if (!c) { el.style.borderColor = '#c0392b'; this.flash(s.edBadCode); return; }
      this.closeInput();
      this.scene.restart({ custom: c });
    };
    el.addEventListener('keydown', e => { if (e.key === 'Enter') go(); if (e.key === 'Escape') this.closeInput(); });
    el.addEventListener('blur', () => setTimeout(() => { if (this.codeInput && fromCode(el.value)) go(); else this.closeInput(); }, 150));
  }

  private closeInput() {
    this.codeInput?.remove();
    this.codeInput = undefined;
  }
}
