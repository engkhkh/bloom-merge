// Progress saved on the device (works on web, mobile and desktop builds)
const KEY = 'bloom-merge-save';

export interface SaveData {
  unlocked: number;
  stars: Record<number, number>;
  kidMode: boolean;
  sound?: boolean;
  music?: boolean;
  lang?: 'en' | 'ar';
  // Daily Challenge
  dailyDate?: string;      // date of the last daily played, e.g. 2026-11-21
  dailyBest?: number;      // best score that day
  dailyDone?: boolean;     // goal reached that day
  streak?: number;         // days in a row with the daily done
  lastDoneDate?: string;
  // Garden Album
  stats?: { merges?: number; grown?: number[]; dailyWins?: number; bestStreak?: number; familyGames?: number };
  visitors?: string[];
}

export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable */ }
  return { unlocked: 1, stars: {}, kidMode: false, sound: true, music: true };
}

export function save(data: SaveData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}
