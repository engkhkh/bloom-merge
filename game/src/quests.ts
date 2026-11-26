// Daily Quests: three small goals a day (like the order boards in Merge Mansion / Merge Gardens),
// rewarded with Magic Water drops instead of anything bought.
import { load, save } from './save';
import { todayKey, dailySeed, seededRandom } from './daily';

export type QuestEvent = 'merge' | 'grow3' | 'grow4' | 'win' | 'stars3' | 'daily' | 'plant' | 'combo';

export interface Quest { id: string; event: QuestEvent; target: number; reward: number; en: string; ar: string; }

export const QUEST_POOL: Quest[] = [
  { id: 'merge20', event: 'merge', target: 20, reward: 1, en: 'Merge 20 times', ar: 'ادمج 20 مرة' },
  { id: 'merge50', event: 'merge', target: 50, reward: 2, en: 'Merge 50 times', ar: 'ادمج 50 مرة' },
  { id: 'grow3x3', event: 'grow3', target: 3, reward: 1, en: 'Grow 3 Sunflowers', ar: 'ازرع 3 عباد شمس' },
  { id: 'grow4x2', event: 'grow4', target: 2, reward: 2, en: 'Grow 2 Trees or Apple Trees', ar: 'ازرع شجرتين' },
  { id: 'win2', event: 'win', target: 2, reward: 1, en: 'Win 2 levels', ar: 'افز بمرحلتين' },
  { id: 'win4', event: 'win', target: 4, reward: 2, en: 'Win 4 levels', ar: 'افز بـ 4 مراحل' },
  { id: 'stars3', event: 'stars3', target: 1, reward: 2, en: 'Get 3 stars on a level', ar: 'احصل على 3 نجوم في مرحلة' },
  { id: 'daily', event: 'daily', target: 1, reward: 2, en: 'Win the Daily Challenge', ar: 'افز بتحدي اليوم' },
  { id: 'plant3', event: 'plant', target: 3, reward: 1, en: 'Plant 3 things in My Garden', ar: 'ازرع 3 نباتات في حديقتي' },
  { id: 'combo2', event: 'combo', target: 2, reward: 1, en: 'Make 2 combos (3 merges in a row)', ar: 'اصنع سلسلتين (3 دمجات متتالية)' }
];

/** Today's three quests: the same for everyone on the same day */
export function todayQuests(key = todayKey()): Quest[] {
  const r = seededRandom(dailySeed('quests-' + key));
  const pool = [...QUEST_POOL];
  const out: Quest[] = [];
  while (out.length < 3) {
    const q = pool.splice(Math.floor(r() * pool.length), 1)[0];
    if (!out.some(o => o.event === q.event)) out.push(q); // three different kinds
  }
  return out;
}

function state(key = todayKey()) {
  const d = load();
  if (!d.quests || d.quests.date !== key) d.quests = { date: key, progress: {}, claimed: [] };
  return d;
}

export function questProgress(q: Quest): number {
  return Math.min(q.target, state().quests!.progress[q.id] ?? 0);
}
export const isClaimed = (q: Quest) => state().quests!.claimed.includes(q.id);
export const isDone = (q: Quest) => questProgress(q) >= q.target;

/** Count something that happened; returns quests that just became complete */
export function track(event: QuestEvent, amount = 1): Quest[] {
  const d = state();
  const done: Quest[] = [];
  for (const q of todayQuests()) {
    if (q.event !== event) continue;
    const before = d.quests!.progress[q.id] ?? 0;
    const after = before + amount;
    d.quests!.progress[q.id] = after;
    if (before < q.target && after >= q.target) done.push(q);
  }
  save(d);
  return done;
}

/** Collect a finished quest's reward. Returns the number of drops received (0 if not allowed). */
export function claim(q: Quest): number {
  const d = state();
  if ((d.quests!.progress[q.id] ?? 0) < q.target || d.quests!.claimed.includes(q.id)) return 0;
  d.quests!.claimed.push(q.id);
  d.drops = (d.drops ?? 2) + q.reward;
  save(d);
  return q.reward;
}

export const unclaimedCount = () => todayQuests().filter(q => isDone(q) && !isClaimed(q)).length;

export function drops(): number { return load().drops ?? 2; } // everyone starts with 2
export function addDrops(n: number) { const d = load(); d.drops = Math.max(0, (d.drops ?? 2) + n); save(d); }
