// Seasonal events: the garden changes its look by date.
// Ramadan and Eid dates follow the usual astronomical estimates; local moon sighting can shift them by a day.

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'ramadan' | 'eid';
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter', 'ramadan', 'eid'];

// [start, end] inclusive, as YYYY-MM-DD
const RAMADAN: [string, string][] = [
  ['2026-02-18', '2026-03-19'],
  ['2027-02-08', '2027-03-08'],
  ['2028-01-28', '2028-02-25'],
  ['2029-01-16', '2029-02-13'],
  ['2030-01-06', '2030-02-04']
];
const EID: [string, string][] = [
  ['2026-03-20', '2026-03-22'], ['2026-05-27', '2026-05-30'],   // Eid al-Fitr, Eid al-Adha
  ['2027-03-09', '2027-03-11'], ['2027-05-16', '2027-05-19'],
  ['2028-02-26', '2028-02-28'], ['2028-05-05', '2028-05-08'],
  ['2029-02-14', '2029-02-16'], ['2029-04-24', '2029-04-27'],
  ['2030-02-05', '2030-02-07'], ['2030-04-13', '2030-04-16']
];

const inRange = (d: string, list: [string, string][]) => list.some(([a, b]) => d >= a && d <= b);

let preview: Season | null = null;

export function seasonFor(date = new Date()): Season {
  const key = date.toISOString().slice(0, 10);
  if (inRange(key, EID)) return 'eid';
  if (inRange(key, RAMADAN)) return 'ramadan';
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

/** Current season, or the one being previewed (tap the season badge on the menu, or add ?season=winter to the URL) */
export function season(): Season {
  if (preview) return preview;
  try {
    const q = new URLSearchParams(location.search).get('season') as Season | null;
    if (q && SEASONS.includes(q)) return q;
  } catch { /* no URL */ }
  return seasonFor();
}

export function cyclePreview(): Season {
  const i = SEASONS.indexOf(season());
  preview = SEASONS[(i + 1) % SEASONS.length];
  return preview;
}

export const SEASON_ICON: Record<Season, string> = {
  spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️', ramadan: '🌙', eid: '🎉'
};

export interface Palette {
  skyTop: number; skyBottom: number; hillBack: number; hillFront: number; grass: number;
  sun: number; sunGlow: number; night: boolean; cloud: number;
}

export function palette(s: Season = season()): Palette {
  switch (s) {
    case 'spring': return { skyTop: 0x9fdcff, skyBottom: 0xfff0f6, hillBack: 0xb4e39a, hillFront: 0x86cf6e, grass: 0x5fae52, sun: 0xffe680, sunGlow: 0xfff3a6, night: false, cloud: 0xffffff };
    case 'autumn': return { skyTop: 0x9cc9e8, skyBottom: 0xfbe7cf, hillBack: 0xe0b45a, hillFront: 0xc99a45, grass: 0x8f7a2e, sun: 0xffc861, sunGlow: 0xffe0a6, night: false, cloud: 0xfff8ee };
    case 'winter': return { skyTop: 0xb8d6ec, skyBottom: 0xf2f8fc, hillBack: 0xe8f1f7, hillFront: 0xd5e6ef, grass: 0x9fb8a6, sun: 0xfff6d6, sunGlow: 0xffffff, night: false, cloud: 0xffffff };
    case 'ramadan': return { skyTop: 0x0e1b4d, skyBottom: 0x2b3f86, hillBack: 0x2f5f4a, hillFront: 0x264f3c, grass: 0x1f4232, sun: 0xfff1b0, sunGlow: 0xfff1b0, night: true, cloud: 0x3c4f96 };
    case 'eid': return { skyTop: 0x7fc8ff, skyBottom: 0xfff4d6, hillBack: 0x9fd88a, hillFront: 0x7cc46a, grass: 0x5fae52, sun: 0xffe066, sunGlow: 0xfff3a6, night: false, cloud: 0xffffff };
    default: return { skyTop: 0x8fd3ff, skyBottom: 0xdff4ff, hillBack: 0x9fd88a, hillFront: 0x7cc46a, grass: 0x5fae52, sun: 0xffe066, sunGlow: 0xfff3a6, night: false, cloud: 0xffffff };
  }
}
