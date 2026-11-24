import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/levels';
import { VISITORS } from '../src/album';
import { Board, MAX_LEVEL } from '../src/objects/MergeLogic';
import { seededRandom } from '../src/daily';

describe('Translations', async () => {
  // Read both language tables from the source so a missing Arabic string fails the build
  const src = (await import('node:fs')).readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8');
  const block = (lang: string) => src.slice(src.indexOf(`  ${lang}: {`), src.indexOf('\n  }', src.indexOf(`  ${lang}: {`)));
  const keys = (b: string) => [...b.matchAll(/^ {4}(\w+):/gm)].map(m => m[1]).sort();
  it('Arabic has every English key', () => {
    expect(keys(block('ar'))).toEqual(keys(block('en')));
  });
  it('every visitor has both languages', () => {
    for (const v of VISITORS) { expect(v.name.ar).toBeTruthy(); expect(v.hint.ar).toBeTruthy(); }
  });
});

describe('Levels', () => {
  it('have unique ids 1..N and valid cells', () => {
    expect(LEVELS.map(l => l.id)).toEqual(LEVELS.map((_, i) => i + 1));
    for (const l of LEVELS) {
      for (const c of [...(l.rocks ?? []), ...(l.ice ?? []).map(i => i[0])]) expect(c >= 0 && c < 25).toBe(true);
      expect(l.goalLevel).toBeLessThanOrEqual(MAX_LEVEL);
      for (const [, lv] of l.ice ?? []) expect(lv).toBeLessThan(l.goalLevel); // ice never gives the goal for free
    }
  });

  // A simple greedy player: merge the biggest pair below the goal (next to ice if it can), else move a plant.
  const neighbours = (i: number) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dc, dr]) => [i % 5 + dc, Math.floor(i / 5) + dr]).filter(([c, r]) => c >= 0 && r >= 0 && c < 5 && r < 5).map(([c, r]) => r * 5 + c);

  function play(l: (typeof LEVELS)[number], seed: number): boolean {
    const rng = seededRandom(seed);
    const b = new Board(5, rng);
    b.blocked = new Set(l.rocks ?? []);
    for (const [c, lv] of l.ice ?? []) { b.cells[c] = lv; b.frozen.add(c); }
    for (let i = 0; i < l.startSeeds; i++) b.spawn(0);
    for (let m = 0; m < l.moves; m++) {
      let done = false;
      for (let lv = l.goalLevel - 1; lv >= 0 && !done; lv--) {
        const idx = b.cells.flatMap((c, i) => (c === lv && !b.frozen.has(i) ? [i] : []));
        if (idx.length < 2) continue;
        const to = idx.find(i => neighbours(i).some(n => b.frozen.has(n))) ?? idx[1];
        const from = idx.find(i => i !== to)!;
        b.move(from, to); b.thawAround(to); b.spawn(0); if (rng() < 0.5) b.spawn(0);
        done = true;
      }
      if (!done) {
        const empty = b.emptyCells();
        const from = b.cells.findIndex((c, i) => c !== null && !b.frozen.has(i));
        if (!empty.length || from < 0) return false;
        b.move(from, empty[0]); b.spawn(0);
      }
      if (b.count(l.goalLevel) >= l.goalCount) return true;
      if (b.isStuck()) return false;
    }
    return false;
  }

  it.each(LEVELS.map(l => [l.id, l] as const))('level %i is winnable', (_id, l) => {
    const runs = 200;
    let wins = 0;
    for (let s = 1; s <= runs; s++) if (play(l, s * 7919)) wins++;
    expect(wins / runs).toBeGreaterThanOrEqual(0.9);
  });
});
