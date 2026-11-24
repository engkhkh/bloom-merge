import Phaser from 'phaser';
import { Board, ITEMS } from '../objects/MergeLogic';
import { LEVELS, Level } from '../levels';
import { load, save } from '../save';
import { drawBackground, drawBoardBed, drawCell, drawRock, drawIce, makeBadge, button, ts, FONT } from '../art';
import { Sfx, buzz } from '../audio';
import { motionOK } from '../settings';
import { t, isRTL, lang } from '../i18n';
import { dailyLevel, dailySeed, seededRandom, recordDaily, dailyStatus, dailyAlbum } from '../daily';
import { recordMerge, updateStats, Visitor } from '../album';
import { Custom, toLevel } from '../custom';

const HEARTS = ['❤️', '💙', '💛', '💚'];
const P_COLORS = ['#d63b3b', '#2f6fd6', '#c99700', '#2f9a3a'];

const SIZE = 5;
const CELL = 92;
const GAP = 8;

type Tile = Phaser.GameObjects.Container;

interface Snapshot { cells: (number | null)[]; frozen: number[]; score: number; movesLeft: number; }

export class GameScene extends Phaser.Scene {
  private board!: Board;
  private level!: Level;
  private kidMode = false;
  private movesLeft = 0;
  private score = 0;
  private tiles: (Tile | null)[] = [];
  private originX = 0;
  private originY = 0;
  private hud!: Phaser.GameObjects.Text;
  private history: Snapshot[] = [];
  private undosLeft = 0;
  private undoBtn?: Phaser.GameObjects.Text;
  private goalText!: Phaser.GameObjects.Text;
  private finished = false;
  private daily = false;
  private rng: () => number = Math.random;
  private custom: Custom | null = null;
  private family = 0;          // number of players in Family Garden (0 = normal game)
  private turn = 0;
  private pScores: number[] = [];
  private toastQueue: Visitor[] = [];
  private toasting = false;
  private lastAction = 0;
  private hintTween?: Phaser.Tweens.Tween;
  private tutorial?: Phaser.GameObjects.GameObject[];

  constructor() { super('Game'); }

  init(data: { levelId: number; daily?: boolean; family?: number; custom?: Custom }) {
    this.daily = !!data.daily;
    this.custom = data.custom ?? null;
    this.family = data.family ?? 0;
    this.turn = 0;
    this.pScores = new Array(this.family).fill(0);
    this.toastQueue = [];
    this.toasting = false;
    this.level = this.family
      ? { id: -1, goalLevel: 5, goalCount: 99, moves: this.family * 10, startSeeds: 10 }
      : this.custom ? toLevel(this.custom)
      : this.daily ? dailyLevel() : LEVELS.find(l => l.id === data.levelId) ?? LEVELS[0];
    // The daily puzzle is the same for everyone, so it uses a seeded generator and no Kid Mode
    this.rng = this.custom ? seededRandom(this.custom.seed) : this.daily ? seededRandom(dailySeed()) : Math.random;
    this.kidMode = this.daily || this.family ? false : load().kidMode;
    this.movesLeft = this.level.moves;
    this.score = 0;
    this.finished = false;
  }

  create() {
    const w = this.scale.width;
    drawBackground(this);
    this.board = new Board(SIZE, this.rng);
    const boardPx = SIZE * CELL + (SIZE - 1) * GAP;
    this.originX = (w - boardPx) / 2;
    this.originY = 270;

    // Top panel
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.85); panel.fillRoundedRect(20, 70, w - 40, 150, 24);
    const s = t();
    const back = this.add.text(isRTL() ? w - 24 : 24, 18, s.menu, ts(24, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 5 }))
      .setOrigin(isRTL() ? 1 : 0, 0);
    back.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('Menu'));
    this.add.text(w / 2, 36, this.family ? s.familyTitle : this.custom ? s.customTitle : this.daily ? s.dailyTitle : s.level(this.level.id), ts(34, '#ffffff', {
      fontStyle: 'bold', stroke: '#2f5d2a', strokeThickness: 7
    })).setOrigin(0.5);
    this.goalText = this.add.text(w / 2, 112, '', ts(28, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5);
    this.hud = this.add.text(w / 2, 172, '', ts(24, '#5a3b22')).setOrigin(0.5);

    // Undo: 3 per level (unlimited in Kid Mode). Not in the Daily Challenge or Family Garden, to keep them fair.
    this.history = [];
    this.undosLeft = this.kidMode ? Infinity : 3;
    if (!this.daily && !this.family) {
      this.undoBtn = this.add.text(isRTL() ? 46 : w - 46, 172, '', ts(22, '#ffffff', {
        fontStyle: 'bold', backgroundColor: '#3f7fbf', padding: { x: 12, y: 4 }, rtl: false
      })).setOrigin(0.5).setInteractive({ useHandCursor: true });
      this.undoBtn.on('pointerup', () => this.undo());
    } else this.undoBtn = undefined;

    // Garden bed
    drawBoardBed(this, this.originX, this.originY, boardPx);
    for (let i = 0; i < SIZE * SIZE; i++) {
      const { x, y } = this.cellPos(i);
      drawCell(this, x, y, CELL);
    }

    // Rocks block cells (World 2 levels)
    this.board.blocked = new Set(this.level.rocks ?? []);
    this.board.blocked.forEach(i => { const { x, y } = this.cellPos(i); drawRock(this, x, y, CELL); });
    // Frozen plants (World 3 levels)
    for (const [cell, lvl] of this.level.ice ?? []) { this.board.cells[cell] = lvl; this.board.frozen.add(cell); }

    this.tiles = new Array(SIZE * SIZE).fill(null);
    this.board.frozen.forEach(i => this.makeTile(i));
    for (let i = 0; i < this.level.startSeeds; i++) this.spawnTile();

    this.add.text(w / 2, 835, this.family ? s.familyHint : s.hint, ts(19, '#ffffff', { stroke: '#2f5d2a', strokeThickness: 4 })).setOrigin(0.5);

    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Tile) => {
      if (this.finished) return;
      this.stopHint();
      this.lastAction = this.time.now;
      obj.setDepth(10).setScale(1.15);
      Sfx.pick();
    });
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Tile, x: number, y: number) => {
      if (!this.finished) obj.setPosition(x, y);
    });
    this.input.on('dragend', (p: Phaser.Input.Pointer, obj: Tile) => {
      this.handleDrop(obj, p.worldX, p.worldY);
    });

    this.updateHud();

    // Gentle hint: after 7 s without a move, wiggle two plants that can merge
    this.lastAction = this.time.now;
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.maybeHint() });
    if (this.level.id === 1 && !this.family && !load().tutorialDone) this.time.delayedCall(600, () => this.showTutorial());
    if (this.level.id === 11 || this.level.id === 21) {
      const tip = this.add.text(this.scale.width / 2, 238, this.level.id === 21 ? t().iceTip : t().rockTip, ts(21, '#ffffff', {
        fontStyle: 'bold', backgroundColor: '#6b737b', padding: { x: 16, y: 8 }
      })).setOrigin(0.5).setDepth(25);
      this.tweens.add({ targets: tip, alpha: 0, delay: 4000, duration: 600, onComplete: () => tip.destroy() });
    }
  }

  private maybeHint() {
    if (this.finished || this.hintTween || this.time.now - this.lastAction < 7000) return;
    const pair = this.board.findPair();
    if (!pair) return;
    const targets = pair.map(i => this.tiles[i]).filter(Boolean) as Tile[];
    this.hintTween = this.tweens.add({ targets, scale: 1.12, duration: 260, yoyo: true, repeat: 3, ease: 'Sine.InOut',
      onComplete: () => { targets.forEach(t => t.active && t.setScale(1)); this.hintTween = undefined; this.lastAction = this.time.now - 3000; } });
  }

  private stopHint() {
    if (!this.hintTween) return;
    const targets = this.hintTween.targets as Tile[];
    this.hintTween.stop();
    targets.forEach(t => t.active && t.setScale(1));
    this.hintTween = undefined;
  }

  /** First game ever: a hand shows how to drag one seed onto another */
  private showTutorial() {
    if (this.finished) return;
    const pair = this.board.findPair();
    if (!pair) return;
    const a = this.cellPos(pair[0]);
    const b = this.cellPos(pair[1]);
    const w = this.scale.width;
    const hand = this.add.text(a.x + 18, a.y + 22, '👆', { fontSize: '54px' }).setOrigin(0.3, 0.1).setDepth(25);
    const bubble = this.add.text(w / 2, 238, t().tutorial, ts(22, '#ffffff', {
      fontStyle: 'bold', backgroundColor: '#e0762b', padding: { x: 16, y: 8 }
    })).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: hand, x: b.x + 18, y: b.y + 22, duration: 1100, delay: 300, hold: 400, repeat: -1, repeatDelay: 300, ease: 'Sine.InOut' });
    this.tweens.add({ targets: bubble, scale: 1.05, duration: 600, yoyo: true, repeat: -1 });
    this.tutorial = [hand, bubble];
  }

  private endTutorial() {
    if (!this.tutorial) return;
    this.tutorial.forEach(o => o.destroy());
    this.tutorial = undefined;
    const d = load(); d.tutorialDone = true; save(d);
  }

  private cellPos(i: number) {
    const c = i % SIZE;
    const r = Math.floor(i / SIZE);
    return {
      x: this.originX + c * (CELL + GAP) + CELL / 2,
      y: this.originY + r * (CELL + GAP) + CELL / 2
    };
  }

  private cellAt(x: number, y: number): number {
    const c = Math.floor((x - this.originX + GAP / 2) / (CELL + GAP));
    const r = Math.floor((y - this.originY + GAP / 2) / (CELL + GAP));
    if (c < 0 || r < 0 || c >= SIZE || r >= SIZE) return -1;
    return this.board.index(c, r);
  }

  private makeTile(i: number) {
    this.tiles[i]?.destroy();
    const level = this.board.cells[i];
    if (level === null) { this.tiles[i] = null; return; }
    const { x, y } = this.cellPos(i);
    const c = this.add.container(x, y);
    c.add(makeBadge(this, level, CELL));
    c.add(this.add.text(0, -2, ITEMS[level], { fontSize: '52px' }).setOrigin(0.5));
    c.setSize(CELL, CELL);
    c.setData('cell', i);
    this.tiles[i] = c;
    c.setScale(0);
    this.tweens.add({ targets: c, scale: 1, duration: 220, ease: 'Back.Out' });
    if (this.board.frozen.has(i)) {
      c.add(drawIce(this, CELL));
      c.setData('ice', true);
      return; // frozen: no dragging, no sway
    }
    c.setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(c);
    // Gentle idle sway for grown plants
    if (level >= 2 && motionOK()) {
      this.tweens.add({ targets: c, angle: { from: -3, to: 3 }, duration: 1600 + level * 100, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: Math.random() * 800 });
    }
  }

  private spawnTile() {
    const i = this.board.spawn(0);
    if (i >= 0) this.makeTile(i);
  }

  private handleDrop(obj: Tile, x: number, y: number) {
    this.lastAction = this.time.now;
    const from = obj.getData('cell') as number;
    const to = this.cellAt(x, y);
    const before = this.snapshot();
    const result = this.finished || to < 0 ? 'invalid' : this.board.move(from, to);
    if (result !== 'invalid') { this.history.push(before); if (this.history.length > 10) this.history.shift(); }

    if (result === 'invalid') {
      const p = this.cellPos(from);
      if (to !== from && !this.finished) Sfx.bad();
      this.tweens.add({ targets: obj, x: p.x, y: p.y, scale: 1, duration: 150 });
      obj.setDepth(0);
      return;
    }

    obj.destroy();
    this.tiles[from] = null;
    this.makeTile(to);

    if (result === 'merge') {
      const lvl = this.board.cells[to]!;
      const pts = 10 * (lvl + 1) * (lvl + 1);
      this.score += pts;
      if (this.family) this.pScores[this.turn % this.family] += pts;
      Sfx.merge(lvl);
      buzz(lvl >= 4 ? 40 : 15);
      this.endTutorial();
      this.toast(recordMerge(lvl));
      this.burst(to, lvl);
      this.floatText(to, `+${pts}`);
      this.board.thawAround(to).forEach(n => this.thaw(n));
    } else {
      Sfx.drop();
    }

    if (!this.kidMode) this.movesLeft--;
    if (this.family) this.turn++;
    this.spawnTile();
    if (result === 'merge' && this.rng() < 0.5) this.spawnTile();
    this.updateHud();
    this.checkEnd();
  }

  private burst(i: number, lvl: number) {
    const { x, y } = this.cellPos(i);
    const fx = ['✨', '🌸', '🍃', '⭐', '🐝', '🍎'][lvl] ?? '✨';
    const n = 6 + lvl * 2;
    for (let k = 0; k < n; k++) {
      const s = this.add.text(x, y, k % 2 ? '✨' : fx, { fontSize: '22px' }).setOrigin(0.5).setDepth(15);
      const a = (Math.PI * 2 * k) / n;
      this.tweens.add({
        targets: s, x: x + Math.cos(a) * 80, y: y + Math.sin(a) * 80,
        alpha: 0, scale: 1.4, duration: 550, ease: 'Cubic.Out', onComplete: () => s.destroy()
      });
    }
    if (lvl >= 4 && motionOK()) this.cameras.main.shake(150, 0.004);
  }

  private floatText(i: number, msg: string) {
    const { x, y } = this.cellPos(i);
    const t = this.add.text(x, y - 30, msg, {
      fontFamily: FONT, fontSize: '26px', color: '#ffe066', fontStyle: 'bold', stroke: '#5a3b22', strokeThickness: 5
    }).setOrigin(0.5).setDepth(16);
    this.tweens.add({ targets: t, y: y - 90, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private updateHud() {
    const s = t();
    if (this.family) {
      const p = this.turn % this.family;
      this.goalText.setText(`${HEARTS[p]} ${s.turn(s.player(p + 1))}`).setColor(P_COLORS[p]);
      const scores = this.pScores.map((v, i) => `${HEARTS[i]} ${v}`).join('    ');
      this.hud.setText(`${scores}\n${s.turnsLeft(this.movesLeft)}`).setAlign('center').setFontSize(22);
      return;
    }
    const have = Math.min(this.board.count(this.level.goalLevel), this.level.goalCount);
    this.goalText.setText(s.goal(ITEMS[this.level.goalLevel], s.items[this.level.goalLevel], have, this.level.goalCount));
    if (this.undoBtn) {
      const n = this.undosLeft === Infinity ? '∞' : String(this.undosLeft);
      this.undoBtn.setText(`↶ ${n}`).setAlpha(this.history.length && this.undosLeft > 0 ? 1 : 0.45);
    }
    const moves = s.moves(this.kidMode ? '∞' : String(this.movesLeft));
    this.hud.setText(`${moves}      ${s.score(this.score)}`);
    if (!this.kidMode && this.movesLeft <= 5) this.hud.setColor('#c0392b');
  }

  private checkEnd() {
    if (this.family) {
      if (this.movesLeft <= 0 || this.board.isStuck()) this.finishFamily();
      return;
    }
    const won = this.board.count(this.level.goalLevel) >= this.level.goalCount;
    if (won) return this.finish(true);
    if ((!this.kidMode && this.movesLeft <= 0) || this.board.isStuck()) this.finish(false);
  }

  private finish(won: boolean) {
    this.finished = true;
    const s = t();
    const w = this.scale.width;
    const h = this.scale.height;
    let stars = 0;
    let newBest = false;
    if (won) {
      const used = this.level.moves - this.movesLeft;
      stars = this.kidMode ? 3 : used <= this.level.moves * 0.5 ? 3 : used <= this.level.moves * 0.75 ? 2 : 1;
      if (this.daily || this.custom) {
        this.score += this.movesLeft * 10; // bonus for moves left over
      } else {
        const data = load();
        data.stars[this.level.id] = Math.max(data.stars[this.level.id] ?? 0, stars);
        data.unlocked = Math.max(data.unlocked, Math.min(this.level.id + 1, LEVELS.length));
        save(data);
      }
      Sfx.win();
    } else {
      Sfx.lose();
    }
    if (this.daily) { newBest = recordDaily(this.score, won); this.toast(dailyAlbum(won)); }

    this.time.delayedCall(450, () => {
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45).setDepth(20).setInteractive();
      const card = this.add.graphics().setDepth(21);
      card.fillStyle(0xfff7d6, 1); card.fillRoundedRect(w / 2 - 220, h / 2 - 200, 440, 400, 30);
      card.lineStyle(6, 0xe0a526, 1); card.strokeRoundedRect(w / 2 - 220, h / 2 - 200, 440, 400, 30);
      this.add.text(w / 2, h / 2 - 150, won ? s.won : s.lost, ts(32, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(22);
      const scoreLine = this.daily ? `${s.score(this.score)}   ·   ${s.best(dailyStatus().best)}` : s.score(this.score);
      this.add.text(w / 2, h / 2 - 102, scoreLine, ts(22, '#5a3b22')).setOrigin(0.5).setDepth(22);
      if (newBest && this.score > 0) {
        this.add.text(w / 2, h / 2 - 70, s.newBest, ts(20, '#c97a00', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(22);
      }

      if (won) {
        for (let k = 0; k < 3; k++) {
          const st = this.add.text(w / 2 + (k - 1) * 70, h / 2 - 15, '⭐', { fontSize: '50px' })
            .setOrigin(0.5).setDepth(22).setAlpha(k < stars ? 1 : 0.2).setScale(0);
          this.tweens.add({ targets: st, scale: 1, delay: 200 + k * 200, duration: 300, ease: 'Back.Out' });
        }
      } else {
        this.add.text(w / 2, h / 2 - 15, s.tryAgain, ts(32, '#5a3b22')).setOrigin(0.5).setDepth(22);
      }

      const next = !this.daily && !this.custom && won && this.level.id < LEVELS.length;
      const retry = !won || this.daily || !!this.custom;
      const label = next ? s.next : retry ? s.retry : s.menuBtn;
      const b1 = button(this, w / 2, h / 2 + 70, label, () => {
        if (next) this.scene.start('Game', { levelId: this.level.id + 1 });
        else if (retry) this.scene.restart({ levelId: this.level.id, daily: this.daily, custom: this.custom ?? undefined });
        else this.scene.start('Menu');
      }, 280, 0xe0762b);
      b1.container.setDepth(22);
      const b2 = button(this, w / 2, h / 2 + 145, this.custom ? s.editorTitle : s.menuBtn, () => this.custom ? this.scene.start('Editor', { custom: this.custom }) : this.scene.start('Menu'), 280);
      b2.container.setDepth(22);
    });
  }

  /** Show "A Ladybug visited your garden!" banners, one after another */
  private toast(visitors: Visitor[]) {
    this.toastQueue.push(...visitors);
    if (this.toasting || this.toastQueue.length === 0) return;
    this.toasting = true;
    const v = this.toastQueue.shift()!;
    const w = this.scale.width;
    const c = this.add.container(w / 2, -60).setDepth(40);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2); g.fillRoundedRect(-230, -30, 460, 66, 33);
    g.fillStyle(0xfff3c4, 1); g.fillRoundedRect(-230, -34, 460, 66, 33);
    g.lineStyle(4, 0xe0a526, 1); g.strokeRoundedRect(-230, -34, 460, 66, 33);
    const txt = this.add.text(0, -1, t().visited(v.emoji, v.name[lang()]), ts(22, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5);
    c.add([g, txt]);
    Sfx.win();
    this.tweens.add({
      targets: c, y: 250, duration: 450, ease: 'Back.Out', hold: 1800, yoyo: true,
      onComplete: () => { c.destroy(); this.toasting = false; this.toast([]); }
    });
  }

  private finishFamily() {
    this.finished = true;
    const s = t();
    const w = this.scale.width;
    const h = this.scale.height;
    const best = Math.max(...this.pScores);
    const winners = this.pScores.map((v, i) => (v === best ? i : -1)).filter(i => i >= 0);
    Sfx.win();
    this.toast(updateStats(st => { st.familyGames++; }));

    this.time.delayedCall(450, () => {
      this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45).setDepth(20).setInteractive();
      const card = this.add.graphics().setDepth(21);
      card.fillStyle(0xfff7d6, 1); card.fillRoundedRect(w / 2 - 220, h / 2 - 220, 440, 440, 30);
      card.lineStyle(6, 0xe0a526, 1); card.strokeRoundedRect(w / 2 - 220, h / 2 - 220, 440, 440, 30);
      const title = winners.length > 1 ? s.tie : s.winner(`${HEARTS[winners[0]]} ${s.player(winners[0] + 1)}`);
      this.add.text(w / 2, h / 2 - 170, title, ts(32, '#2f5d2a', { fontStyle: 'bold' })).setOrigin(0.5).setDepth(22);
      // Scoreboard, highest first
      const order = this.pScores.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
      order.forEach((o, k) => {
        const line = `${o.v === best ? '🏆' : '  '} ${HEARTS[o.i]} ${s.player(o.i + 1)}   ${o.v}`;
        this.add.text(w / 2, h / 2 - 110 + k * 40, line, ts(24, P_COLORS[o.i], { fontStyle: 'bold' })).setOrigin(0.5).setDepth(22);
      });
      const b1 = button(this, w / 2, h / 2 + 90, s.playAgain, () => this.scene.restart({ levelId: -1, family: this.family }), 280, 0xe0762b);
      b1.container.setDepth(22);
      const b2 = button(this, w / 2, h / 2 + 165, s.menuBtn, () => this.scene.start('Menu'), 280);
      b2.container.setDepth(22);
    });
  }

  /** Crack the ice on a plant: shards fly off and it becomes playable */
  private thaw(i: number) {
    const { x, y } = this.cellPos(i);
    for (let k = 0; k < 8; k++) {
      const shard = this.add.rectangle(x, y, 10, 6, 0xdff4ff, 0.95).setDepth(15).setAngle(Phaser.Math.Between(0, 180));
      const a = (Math.PI * 2 * k) / 8;
      this.tweens.add({ targets: shard, x: x + Math.cos(a) * 70, y: y + Math.sin(a) * 70 + 20, alpha: 0, angle: '+=180',
        duration: 500, ease: 'Cubic.Out', onComplete: () => shard.destroy() });
    }
    Sfx.crack();
    this.time.delayedCall(120, () => this.makeTile(i));
  }

  private snapshot(): Snapshot {
    return { cells: [...this.board.cells], frozen: [...this.board.frozen], score: this.score, movesLeft: this.movesLeft };
  }

  /** Take back the last move: restores the board, score and moves */
  private undo() {
    if (this.finished || this.undosLeft <= 0 || this.history.length === 0) { Sfx.bad(); return; }
    const snap = this.history.pop()!;
    this.undosLeft--;
    this.stopHint();
    this.board.cells = [...snap.cells];
    this.board.frozen = new Set(snap.frozen);
    this.score = snap.score;
    this.movesLeft = snap.movesLeft;
    for (let i = 0; i < this.tiles.length; i++) this.makeTile(i);
    Sfx.drop();
    this.lastAction = this.time.now;
    this.updateHud();
  }
}
