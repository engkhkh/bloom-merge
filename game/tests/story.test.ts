import { describe, it, expect } from 'vitest';
import { STORY, beatFor } from '../src/story';
import { LEVELS } from '../src/levels';

describe('Story', () => {
  it('has unique ids and points at real levels', () => {
    expect(new Set(STORY.map(b => b.id)).size).toBe(STORY.length);
    for (const b of STORY) expect(LEVELS.some(l => l.id === b.level)).toBe(true);
  });
  it('every page has English and Arabic text', () => {
    for (const b of STORY) for (const p of b.pages) { expect(p.en.length).toBeGreaterThan(5); expect(p.ar.length).toBeGreaterThan(5); }
  });
  it('opens and closes each world', () => {
    for (const [start, end] of [[1, 10], [11, 20], [21, 30]]) {
      expect(beatFor('before', start)).toBeDefined();
      expect(beatFor('after', end)).toBeDefined();
    }
  });
});
