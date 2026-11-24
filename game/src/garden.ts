// My Garden: plants you grew in the levels can be placed in your own garden.
import { load, save } from './save';
import { stats } from './album';

export interface Placed { l: number; x: number; y: number; }

/** Plant levels you can decorate with: tulip, sunflower, tree, apple tree */
export const DECOR_LEVELS = [2, 3, 4, 5];
export const MAX_PLACED = 60;

export function placed(): Placed[] { return load().garden ?? []; }

export function savePlaced(list: Placed[]) {
  const d = load();
  d.garden = list.slice(0, MAX_PLACED);
  save(d);
}

/** How many of each plant are still in the basket (grown in levels minus already planted) */
export function available(list: Placed[] = placed()): Record<number, number> {
  const grown = stats().grown;
  const out: Record<number, number> = {};
  for (const l of DECOR_LEVELS) out[l] = Math.max(0, grown[l] - list.filter(p => p.l === l).length);
  return out;
}
