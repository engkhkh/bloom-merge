// Custom puzzles from the Level Editor, shared as a short code like BM-3-2-40-10-4821.
// The last number is the board seed, so a friend who enters the code gets the exact same board.
import { Level } from './levels';

export interface Custom { goalLevel: number; goalCount: number; moves: number; startSeeds: number; seed: number; }

export const LIMITS = {
  goalLevel: [2, 5], goalCount: [1, 5], moves: [10, 200], startSeeds: [4, 16]
} as const;

const clamp = (v: number, [a, b]: readonly [number, number]) => Math.min(b, Math.max(a, v));

export function newSeed() { return Math.floor(Math.random() * 9000) + 1000; }

export function toCode(c: Custom): string {
  return `BM-${c.goalLevel}-${c.goalCount}-${c.moves}-${c.startSeeds}-${c.seed}`;
}

/** Read a code; returns null when it isn't a valid Bloom Merge puzzle code. */
export function fromCode(code: string): Custom | null {
  const m = code.trim().toUpperCase().match(/^BM-(\d)-(\d)-(\d{1,3})-(\d{1,2})-(\d{1,6})$/);
  if (!m) return null;
  const [g, n, mv, s, seed] = m.slice(1).map(Number);
  if (g < LIMITS.goalLevel[0] || g > LIMITS.goalLevel[1]) return null;
  return {
    goalLevel: g,
    goalCount: clamp(n, LIMITS.goalCount),
    moves: clamp(mv, LIMITS.moves),
    startSeeds: clamp(s, LIMITS.startSeeds),
    seed
  };
}

export function toLevel(c: Custom): Level {
  return { id: -2, goalLevel: c.goalLevel, goalCount: c.goalCount, moves: c.moves, startSeeds: c.startSeeds };
}

/** Rough difficulty: seeds needed vs. moves allowed */
export function difficulty(c: Custom): 0 | 1 | 2 | 3 {
  const merges = c.goalCount * (2 ** c.goalLevel - 1);
  const ratio = merges / c.moves;
  return ratio < 0.4 ? 0 : ratio < 0.65 ? 1 : ratio < 0.9 ? 2 : 3;
}
