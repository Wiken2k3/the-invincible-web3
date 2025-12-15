export const GRID_SIZE = 25;

export function getMultiplier(picks: number, mines: number) {
  // công thức đơn giản (MVP)
  return Number((1 + picks * (mines * 0.08)).toFixed(2));
}
