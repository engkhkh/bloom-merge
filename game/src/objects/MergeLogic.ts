// Pure game rules: no drawing here, so they are easy to test.

export const ITEMS = ['🌰', '🌱', '🌷', '🌻', '🌳', '🍎'];
export const MAX_LEVEL = ITEMS.length - 1;

export type Cell = number | null; // item level 0..MAX_LEVEL, or empty

export class Board {
  cells: Cell[];
  /** Cells covered by rocks: nothing can be placed or moved there */
  blocked = new Set<number>();
  /** Cells whose plant is frozen in ice: can't be moved or merged until thawed */
  frozen = new Set<number>();
  constructor(public size: number, private rng: () => number = Math.random) {
    this.cells = new Array(size * size).fill(null);
  }

  index(col: number, row: number) { return row * this.size + col; }

  emptyCells(): number[] {
    return this.cells.flatMap((c, i) => (c === null && !this.blocked.has(i) ? [i] : []));
  }

  /** Put a seed in a random empty cell. Returns the cell index, or -1 if full. */
  spawn(level = 0): number {
    const empty = this.emptyCells();
    if (empty.length === 0) return -1;
    const i = empty[Math.floor(this.rng() * empty.length)];
    this.cells[i] = level;
    return i;
  }

  /**
   * Try to move item from -> to.
   * Same item  => merge into the next level.
   * Empty cell => simple move.
   */
  move(from: number, to: number): 'merge' | 'move' | 'invalid' {
    if (from === to || this.blocked.has(to) || this.blocked.has(from) || this.frozen.has(from) || this.frozen.has(to)) return 'invalid';
    const a = this.cells[from];
    const b = this.cells[to];
    if (a === null) return 'invalid';
    if (b === null) {
      this.cells[to] = a;
      this.cells[from] = null;
      return 'move';
    }
    if (a === b && a < MAX_LEVEL) {
      this.cells[to] = a + 1;
      this.cells[from] = null;
      return 'merge';
    }
    return 'invalid';
  }

  count(level: number) { return this.cells.filter(c => c === level).length; }

  /** Two cells holding the same item that can still grow, or null */
  findPair(): [number, number] | null {
    const seen = new Map<number, number>();
    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      if (c === null || c === MAX_LEVEL || this.frozen.has(i)) continue;
      if (seen.has(c)) return [seen.get(c)!, i];
      seen.set(c, i);
    }
    return null;
  }

  /** True when no merge is possible and the board is full. */
  isStuck(): boolean {
    if (this.emptyCells().length > 0) return false;
    return this.findPair() === null;
  }

  /** Thaw frozen plants next to (up/down/left/right of) a cell. Returns the thawed cells. */
  thawAround(i: number): number[] {
    const c = i % this.size, r = Math.floor(i / this.size);
    const out: number[] = [];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= this.size || nr >= this.size) continue;
      const n = this.index(nc, nr);
      if (this.frozen.delete(n)) out.push(n);
    }
    return out;
  }

}
