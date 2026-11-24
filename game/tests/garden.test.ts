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
