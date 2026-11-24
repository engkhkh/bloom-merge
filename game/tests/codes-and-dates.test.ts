import { describe, it, expect } from 'vitest';
import { toCode, fromCode } from '../src/custom';
import { dailySeed, seededRandom, todayKey } from '../src/daily';
import { seasonFor } from '../src/season';

describe('Level Editor codes', () => {
  it('round-trips a puzzle', () => {
    const c = { goalLevel: 3, goalCount: 2, moves: 40, startSeeds: 8, seed: 1036 };
    expect(toCode(c)).toBe('BM-3-2-40-8-1036');
    expect(fromCode('bm-3-2-40-8-1036')).toEqual(c);
  });
  it('rejects bad codes and clamps values', () => {
    expect(fromCode('hello')).toBeNull();
    expect(fromCode('BM-9-1-10-4-1')).toBeNull();
    expect(fromCode('BM-2-9-999-99-5')).toEqual({ goalLevel: 2, goalCount: 5, moves: 200, startSeeds: 16, seed: 5 });
  });
});

describe('Daily Challenge', () => {
  it('gives everyone the same random sequence on the same day', () => {
    const a = seededRandom(dailySeed('2026-11-24')), b = seededRandom(dailySeed('2026-11-24'));
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(dailySeed('2026-11-24')).not.toBe(dailySeed('2026-11-25'));
  });
  it('formats dates as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('Seasons', () => {
  const at = (d: string) => seasonFor(new Date(d + 'T12:00:00Z'));
  it('picks seasons by month', () => {
    expect(at('2026-04-10')).toBe('spring');
    expect(at('2026-07-10')).toBe('summer');
    expect(at('2026-11-24')).toBe('autumn');
    expect(at('2026-12-20')).toBe('winter');
  });
  it('knows Ramadan and Eid', () => {
    expect(at('2027-02-20')).toBe('ramadan');
    expect(at('2027-03-10')).toBe('eid');
  });
});
