export function generateTower() {
  // mỗi tầng random SAFE hoặc BOMB
  return Array.from({ length: 8 }, () =>
    Math.random() < 0.5 ? "SAFE" : "BOMB"
  );
}
