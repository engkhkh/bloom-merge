// Player settings that other parts of the game read
import { load } from './save';

/** False when the player (or their device) asked for less motion */
export function motionOK(): boolean {
  if (load().reduceMotion) return false;
  try { return !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return true; }
}

/** Colour-blind friendly markers: dots under each plant showing its level */
export const markersOn = () => !!load().markers;

export const vibrateOn = () => load().vibrate !== false;
