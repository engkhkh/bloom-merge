import { describe, it, expect } from 'vitest';
import { Board, MAX_LEVEL } from '../src/objects/MergeLogic';

const board = (cells: (number | null)[]) => { const b = new Board(5, () => 0); b.cells = [...cells, ...Array(25 - cells.length).fill(null)]; return b; };

describe('Board', () => {
  it('merges two equal plants into the next level', () => {
    const b = board([0, 0]);
    expect(b.move(0, 1)).toBe('merge');
    expect(b.cells[1]).toBe(1);
    expect(b.cells[0]).toBeNull();
  });

  it('moves into an empty cell and rejects different plants', () => {
    const b = board([0, null, 1]);
    expect(b.move(0, 1)).toBe('move');
    expect(b.move(1, 2)).toBe('invalid');
  });

  it('never merges past the last plant', () => {
    const b = board([MAX_LEVEL, MAX_LEVEL]);
    expect(b.move(0, 1)).toBe('invalid');
  });

  it('treats rocks as blocked cells', () => {
    const b = board([0]);
    b.blocked = new Set([1]);
    expect(b.move(0, 1)).toBe('invalid');
    expect(b.emptyCells()).not.toContain(1);
  });

  it('keeps frozen plants still until a merge next to them thaws them', () => {
    const b = board([1, null, 0, 0]);
    b.frozen = new Set([0]);
    expect(b.move(0, 1)).toBe('invalid');      // can't move ice
    expect(b.findPair()).toEqual([2, 3]);      // frozen plant is not a hint
    expect(b.move(2, 1)).toBe('move');
    expect(b.move(3, 1)).toBe('merge');        // merge at cell 1, next to cell 0
    expect(b.thawAround(1)).toEqual([0]);
    expect(b.frozen.size).toBe(0);
    expect(b.move(1, 0)).toBe('merge');        // thawed sprout now merges
  });

  it('is stuck only when full and nothing can merge', () => {
    const full = board(Array.from({ length: 25 }, (_, i) => i % 5)); // 0..4 repeated: pairs exist
    expect(full.isStuck()).toBe(false);
    const stuck = board(Array.from({ length: 25 }, (_, i) => (i === 0 ? 0 : MAX_LEVEL)));
    expect(stuck.isStuck()).toBe(true);
  });
});
