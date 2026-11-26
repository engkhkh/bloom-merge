import { describe, it, expect, beforeEach } from 'vitest';

const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; }
};

const Q = await import('../src/quests');
const { Board, MAX_LEVEL } = await import('../src/objects/MergeLogic');

describe('Daily Quests', () => {
  beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

  it('picks the same 3 different quests for everyone on a day', () => {
    const a = Q.todayQuests('2026-11-26'), b = Q.todayQuests('2026-11-26');
    expect(a.map(q => q.id)).toEqual(b.map(q => q.id));
    expect(new Set(a.map(q => q.event)).size).toBe(3);
  });

  it('every quest has Arabic text', () => {
    for (const q of Q.QUEST_POOL) expect(q.ar.length).toBeGreaterThan(0);
  });

  it('tracks progress and pays the reward once', () => {
    const q = Q.todayQuests()[0];
    expect(Q.drops()).toBe(2);                 // starting drops
    expect(Q.claim(q)).toBe(0);                // not done yet
    const done = Q.track(q.event, q.target);
    expect(done.map(d => d.id)).toContain(q.id);
    expect(Q.unclaimedCount()).toBe(1);
    expect(Q.claim(q)).toBe(q.reward);
    expect(Q.claim(q)).toBe(0);                // can't collect twice
    expect(Q.drops()).toBe(2 + q.reward);
  });
});

describe('Magic Water', () => {
  it('grows a plant one size but not frozen, rocks or the biggest plant', () => {
    const b = new Board(5, () => 0);
    b.cells[0] = 1; b.cells[1] = MAX_LEVEL; b.cells[2] = 0;
    b.frozen.add(2);
    expect(b.grow(0)).toBe(true);
    expect(b.cells[0]).toBe(2);
    expect(b.grow(1)).toBe(false);
    expect(b.grow(2)).toBe(false);
    expect(b.grow(3)).toBe(false);             // empty cell
  });
});
