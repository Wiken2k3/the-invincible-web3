export function generateMines(mines: number) {
  const positions = new Set<number>();

  while (positions.size < mines) {
    positions.add(Math.floor(Math.random() * 25));
  }

  return positions;
}
