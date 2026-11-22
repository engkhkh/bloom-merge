export interface Level {
  id: number;
  goalLevel: number;   // which item to grow (index in ITEMS)
  goalCount: number;   // how many of it
  moves: number;       // move limit (ignored in Kid Mode)
  startSeeds: number;
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
  { id: 10, goalLevel: 5, goalCount: 3, moves: 200, startSeeds: 12 }
];
