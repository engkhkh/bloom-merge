// All sounds are made in code with the Web Audio API, so there are no sound files to download.
import { load, save } from './save';

let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, dest?: AudioNode) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest ?? a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const sfxOn = () => load().sound !== false;

export const Sfx = {
  pick() { if (sfxOn()) tone(660, 0, 0.08, 'triangle', 0.12); },
  drop() { if (sfxOn()) tone(330, 0, 0.1, 'triangle', 0.12); },
  bad()  { if (sfxOn()) { tone(220, 0, 0.12, 'square', 0.05); tone(180, 0.08, 0.15, 'square', 0.05); } },
  merge(level: number) {
    if (!sfxOn()) return;
    const base = 440 * Math.pow(2, level / 6);
    tone(base, 0, 0.15, 'sine', 0.22);
    tone(base * 1.5, 0.06, 0.2, 'sine', 0.16);
    tone(base * 2, 0.12, 0.25, 'triangle', 0.1);
  },
  crack() {
    if (!sfxOn()) return;
    [1800, 2400, 1500].forEach((f, i) => tone(f, i * 0.04, 0.08, 'square', 0.04));
  },
  win() {
    if (!sfxOn()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.2));
  },
  lose() {
    if (!sfxOn()) return;
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.18, 0.4, 'sine', 0.16));
  }
};

// Gentle looping garden music (pentatonic, never sounds "wrong")
const NOTES = [523, 587, 659, 784, 880, 784, 659, 587];
const BASS = [131, 131, 165, 147];

export function startMusic() {
  if (load().music === false || musicTimer !== null) return;
  const a = ac(); if (!a) return;
  musicGain = a.createGain();
  musicGain.gain.value = 0.5;
  musicGain.connect(a.destination);
  let step = 0;
  const play = () => {
    if (!musicGain) return;
    const n = NOTES[(step * 3) % NOTES.length];
    if (step % 2 === 0) tone(n, 0, 0.6, 'sine', 0.06, musicGain);
    if (step % 4 === 0) tone(BASS[(step / 4) % BASS.length], 0, 1.6, 'triangle', 0.07, musicGain);
    step++;
  };
  play();
  musicTimer = window.setInterval(play, 420);
}

export function stopMusic() {
  if (musicTimer !== null) clearInterval(musicTimer);
  musicTimer = null;
  musicGain?.disconnect();
  musicGain = null;
}

export function toggleSound(): boolean {
  const d = load(); d.sound = d.sound === false; save(d); return d.sound;
}

export function toggleMusic(): boolean {
  const d = load(); d.music = d.music === false; save(d);
  if (d.music) startMusic(); else stopMusic();
  return d.music;
}

// Stop the music when the app goes to the background (phone locked, app switched), resume on return
let resumeOnShow = false;
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeOnShow = musicTimer !== null; stopMusic(); ctx?.suspend().catch(() => {}); }
    else { ctx?.resume().catch(() => {}); if (resumeOnShow) startMusic(); }
  });
}

/** Short vibration on phones that support it (follows the Sound setting) */
export function buzz(ms = 15) {
  if (load().vibrate === false) return;
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}
