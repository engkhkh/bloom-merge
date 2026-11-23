export interface Level {
  id: number;
  goalLevel: number;   // which item to grow (index in ITEMS)
  goalCount: number;   // how many of it
  moves: number;       // move limit (ignored in Kid Mode)
  startSeeds: number;
  rocks?: number[];    // blocked cells (0–24, row by row)
  ice?: [number, number][]; // frozen plants: [cell, plant level]
}

export const LEVELS: Level[] = [
  { id: 1,  goalLevel: 2, goalCount: 2, moves: 20, startSeeds: 6 },
  { id: 2,  goalLevel: 3, goalCount: 1, moves: 25, startSeeds: 8 },
  { id: 3,  goalLevel: 3, goalCount: 2, moves: 35, startSeeds: 8 },
  { id: 4,  goalLevel: 4, goalCount: 1, moves: 45, startSeeds: 10 },
  { id: 5,  goalLevel: 3, goalCount: 4, moves: 50, startSeeds: 10 },
  { id: 6,  goalLevel: 4, goalCount: 2, moves: 65, startSeeds: 10 },
  { id: 7,  goalLevel: 5, goalCount: 1, moves: 80, startSeeds: 10 },
  { id: 8,  goalLevel: 4, goalCount: 3, moves: 85, startSeeds: 12 },
  { id: 9,  goalLevel: 5, goalCount: 2, moves: 140, startSeeds: 12 },
  { id: 10, goalLevel: 5, goalCount: 3, moves: 200, startSeeds: 12 },
  // World 2: Rocky Garden – rocks block some cells
  { id: 11, goalLevel: 2, goalCount: 3, moves: 18, startSeeds: 8, rocks: [12] },
  { id: 12, goalLevel: 3, goalCount: 2, moves: 26, startSeeds: 8, rocks: [6, 8, 16, 18] },
  { id: 13, goalLevel: 4, goalCount: 1, moves: 28, startSeeds: 10, rocks: [0, 4, 20, 24] },
  { id: 14, goalLevel: 3, goalCount: 3, moves: 38, startSeeds: 8, rocks: [10, 11, 13, 14] },
  { id: 15, goalLevel: 4, goalCount: 2, moves: 55, startSeeds: 10, rocks: [2, 10, 14, 22] },
  { id: 16, goalLevel: 3, goalCount: 3, moves: 38, startSeeds: 6, rocks: [6, 7, 8, 16, 17, 18] },
  { id: 17, goalLevel: 4, goalCount: 1, moves: 28, startSeeds: 8, rocks: [0, 1, 3, 4, 20, 21, 23, 24] },
  { id: 18, goalLevel: 5, goalCount: 1, moves: 56, startSeeds: 10, rocks: [7, 11, 12, 13, 17] },
  { id: 19, goalLevel: 4, goalCount: 3, moves: 80, startSeeds: 10, rocks: [5, 9, 12, 15, 19] },
  { id: 20, goalLevel: 5, goalCount: 2, moves: 110, startSeeds: 10, rocks: [0, 4, 6, 8, 16, 18, 20, 24] },
  // World 3: Frozen Pond – frozen plants thaw when you merge right next to them
  { id: 21, goalLevel: 2, goalCount: 2, moves: 14, startSeeds: 6, ice: [[12, 1]] },
  { id: 22, goalLevel: 3, goalCount: 1, moves: 10, startSeeds: 6, ice: [[6, 2], [18, 2]] },
  { id: 23, goalLevel: 3, goalCount: 2, moves: 24, startSeeds: 8, ice: [[0, 1], [4, 1], [20, 1], [24, 1]] },
  { id: 24, goalLevel: 4, goalCount: 1, moves: 14, startSeeds: 8, ice: [[11, 3], [13, 2]] },
  { id: 25, goalLevel: 3, goalCount: 3, moves: 22, startSeeds: 8, rocks: [12], ice: [[7, 2], [11, 2], [13, 2], [17, 2]] },
  { id: 26, goalLevel: 4, goalCount: 1, moves: 18, startSeeds: 8, ice: [[2, 2], [10, 2], [14, 2], [22, 2]] },
  { id: 27, goalLevel: 4, goalCount: 2, moves: 55, startSeeds: 8, rocks: [6, 8, 16, 18], ice: [[12, 3]] },
  { id: 28, goalLevel: 5, goalCount: 1, moves: 28, startSeeds: 10, ice: [[0, 3], [4, 3], [20, 2], [24, 2]] },
  { id: 29, goalLevel: 4, goalCount: 3, moves: 70, startSeeds: 10, rocks: [12], ice: [[7, 3], [11, 3], [13, 1], [17, 1]] },
  { id: 30, goalLevel: 5, goalCount: 2, moves: 100, startSeeds: 10, rocks: [0, 4, 20, 24], ice: [[6, 3], [8, 3], [16, 2], [18, 2]] }
];

export const LEVELS_PER_WORLD = 10;
