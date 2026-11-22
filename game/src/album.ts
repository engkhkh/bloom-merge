// Garden Album: animals that visit your garden as you play.
import { load, save, SaveData } from './save';

export interface Stats {
  merges: number;
  grown: number[];      // how many of each plant level you have grown, ever
  dailyWins: number;
  bestStreak: number;
  familyGames: number;
}

export interface Visitor {
  id: string;
  emoji: string;
  name: { en: string; ar: string };
  hint: { en: string; ar: string };
  check: (s: Stats) => boolean;
}

export const VISITORS: Visitor[] = [
  { id: 'ladybug', emoji: '🐞', name: { en: 'Ladybug', ar: 'دعسوقة' }, hint: { en: 'Grow a Tulip', ar: 'ازرع توليب' }, check: s => s.grown[2] >= 1 },
  { id: 'bee', emoji: '🐝', name: { en: 'Bee', ar: 'نحلة' }, hint: { en: 'Grow a Sunflower', ar: 'ازرع عباد الشمس' }, check: s => s.grown[3] >= 1 },
  { id: 'bird', emoji: '🐦', name: { en: 'Bird', ar: 'عصفور' }, hint: { en: 'Grow a Tree', ar: 'ازرع شجرة' }, check: s => s.grown[4] >= 1 },
  { id: 'rabbit', emoji: '🐰', name: { en: 'Rabbit', ar: 'أرنب' }, hint: { en: 'Grow an Apple Tree', ar: 'ازرع شجرة تفاح' }, check: s => s.grown[5] >= 1 },
  { id: 'caterpillar', emoji: '🐛', name: { en: 'Caterpillar', ar: 'يرقة' }, hint: { en: 'Merge 25 times', ar: 'ادمج 25 مرة' }, check: s => s.merges >= 25 },
  { id: 'snail', emoji: '🐌', name: { en: 'Snail', ar: 'حلزون' }, hint: { en: 'Merge 100 times', ar: 'ادمج 100 مرة' }, check: s => s.merges >= 100 },
  { id: 'ant', emoji: '🐜', name: { en: 'Ant', ar: 'نملة' }, hint: { en: 'Merge 300 times', ar: 'ادمج 300 مرة' }, check: s => s.merges >= 300 },
  { id: 'frog', emoji: '🐸', name: { en: 'Frog', ar: 'ضفدع' }, hint: { en: 'Grow 10 Sunflowers', ar: 'ازرع 10 عباد شمس' }, check: s => s.grown[3] >= 10 },
  { id: 'turtle', emoji: '🐢', name: { en: 'Turtle', ar: 'سلحفاة' }, hint: { en: 'Grow 5 Trees', ar: 'ازرع 5 أشجار' }, check: s => s.grown[4] >= 5 },
  { id: 'chick', emoji: '🐤', name: { en: 'Chick', ar: 'كتكوت' }, hint: { en: 'Win a Daily Challenge', ar: 'افز بتحدي اليوم' }, check: s => s.dailyWins >= 1 },
  { id: 'cat', emoji: '🐱', name: { en: 'Cat', ar: 'قطة' }, hint: { en: '3-day Daily streak', ar: '3 أيام متتالية' }, check: s => s.bestStreak >= 3 },
  { id: 'dog', emoji: '🐶', name: { en: 'Dog', ar: 'كلب' }, hint: { en: 'Play Family Garden', ar: 'العب حديقة العائلة' }, check: s => s.familyGames >= 1 }
];

export function stats(d: SaveData = load()): Stats {
  const s = d.stats ?? {};
  const grown = s.grown ?? [];
  return {
    merges: s.merges ?? 0,
    grown: [0, 1, 2, 3, 4, 5].map(i => grown[i] ?? 0),
    dailyWins: s.dailyWins ?? 0,
    bestStreak: s.bestStreak ?? 0,
    familyGames: s.familyGames ?? 0
  };
}

export function unlockedIds(d: SaveData = load()): string[] { return d.visitors ?? []; }

/** Change the stats, save, and return any visitors that just arrived. */
export function updateStats(change: (s: Stats) => void): Visitor[] {
  const d = load();
  const s = stats(d);
  change(s);
  d.stats = s;
  const have = new Set(unlockedIds(d));
  const fresh = VISITORS.filter(v => !have.has(v.id) && v.check(s));
  d.visitors = [...have, ...fresh.map(v => v.id)];
  save(d);
  return fresh;
}

export const recordMerge = (level: number) => updateStats(s => { s.merges++; s.grown[level]++; });
