// Daily Challenge: everyone gets the same puzzle on the same day.
import { Level } from './levels';
import { load, save } from './save';
import { updateStats, Visitor } from './album';

export function todayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Small, fast seeded random generator (mulberry32) */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailySeed(key = todayKey()): number {
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Today's puzzle, built from the date */
export function dailyLevel(): Level {
  const r = seededRandom(dailySeed());
  const hard = r() < 0.5;
  return {
    id: 0,
    goalLevel: hard ? 4 : 3,
    goalCount: hard ? 1 : 2 + Math.floor(r() * 2),
    moves: hard ? 45 + Math.floor(r() * 10) : 35 + Math.floor(r() * 10),
    startSeeds: 8 + Math.floor(r() * 4)
  };
}

export interface DailyStatus { done: boolean; best: number; streak: number; }

export function dailyStatus(): DailyStatus {
  const d = load();
  const today = todayKey();
  const sameDay = d.dailyDate === today;
  // A streak counts only if yesterday or today was completed
  const y = new Date(); y.setDate(y.getDate() - 1);
  const alive = d.lastDoneDate === today || d.lastDoneDate === todayKey(y);
  return {
    done: sameDay && !!d.dailyDone,
    best: sameDay ? d.dailyBest ?? 0 : 0,
    streak: alive ? d.streak ?? 0 : 0
  };
}

/** Save a daily result. Returns true if it is a new best for today. */
export function recordDaily(score: number, won: boolean): boolean {
  const d = load();
  const today = todayKey();
  if (d.dailyDate !== today) { d.dailyDate = today; d.dailyBest = 0; d.dailyDone = false; }
  const newBest = score > (d.dailyBest ?? 0);
  if (newBest) d.dailyBest = score;
  if (won && !d.dailyDone) {
    d.dailyDone = true;
    const y = new Date(); y.setDate(y.getDate() - 1);
    d.streak = d.lastDoneDate === todayKey(y) ? (d.streak ?? 0) + 1 : 1;
    d.lastDoneDate = today;
  }
  save(d);
  return newBest;
}

/** Album credit for a daily win (called after recordDaily) */
export function dailyAlbum(won: boolean): Visitor[] {
  if (!won) return [];
  const streak = load().streak ?? 0;
  return updateStats(s => { s.dailyWins++; s.bestStreak = Math.max(s.bestStreak, streak); });
}
