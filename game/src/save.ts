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
  tutorialDone?: boolean;
  garden?: { l: number; x: number; y: number }[];
  vibrate?: boolean;
  reduceMotion?: boolean;
  markers?: boolean;
  drops?: number;                       // Magic Water boosters
  quests?: { date: string; progress: Record<string, number>; claimed: string[] };
  story?: string[];                     // story beats already shown
}

export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable */ }
  return { unlocked: 1, stars: {}, kidMode: false, sound: true, music: true, drops: 2 };
}

export function save(data: SaveData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

/** Start over: keeps settings (language, sound, music, accessibility), clears progress */
export function resetProgress() {
  const d = load();
  save({ unlocked: 1, stars: {}, kidMode: d.kidMode, sound: d.sound, music: d.music, lang: d.lang,
    vibrate: d.vibrate, reduceMotion: d.reduceMotion, markers: d.markers, drops: 2 });
}
