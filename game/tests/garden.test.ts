import { describe, it, expect, beforeEach } from 'vitest';

// Simple in-memory localStorage for the save system
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; }
};

const { available, placed, savePlaced, MAX_PLACED } = await import('../src/garden');
const { recordMerge } = await import('../src/album');

describe('My Garden', () => {
  beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

  it('only offers plants you have grown', () => {
    expect(available()).toEqual({ 2: 0, 3: 0, 4: 0, 5: 0 });
    recordMerge(2); recordMerge(2); recordMerge(4);
    expect(available()).toEqual({ 2: 2, 3: 0, 4: 1, 5: 0 });
  });

  it('planting uses up the basket and saving keeps the layout', () => {
    recordMerge(3); recordMerge(3);
    savePlaced([{ l: 3, x: 100, y: 300 }]);
    expect(available()[3]).toBe(1);
    expect(placed()).toEqual([{ l: 3, x: 100, y: 300 }]);
  });

  it('caps the number of plants', () => {
    savePlaced(Array.from({ length: MAX_PLACED + 5 }, () => ({ l: 2, x: 1, y: 1 })));
    expect(placed().length).toBe(MAX_PLACED);
  });
});

describe('Reset progress', () => {
  it('clears progress but keeps settings', async () => {
    const { load, save, resetProgress } = await import('../src/save');
    save({ unlocked: 9, stars: { 1: 3 }, kidMode: true, lang: 'ar', markers: true, vibrate: false, garden: [{ l: 2, x: 1, y: 1 }], visitors: ['bee'] });
    resetProgress();
    const d = load();
    expect(d.unlocked).toBe(1);
    expect(d.stars).toEqual({});
    expect(d.garden).toBeUndefined();
    expect(d.visitors).toBeUndefined();
    expect([d.lang, d.markers, d.vibrate, d.kidMode]).toEqual(['ar', true, false, true]);
  });
});
