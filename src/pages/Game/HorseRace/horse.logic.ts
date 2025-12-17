import { HORSE_ODDS } from "./horse.config";

export type Horse = {
  id: number;
  name: string;
  multiplier: number;
  progress: number;
  speed: number;
};

// Initialize horses from config with randomized speed influenced by multiplier
export function initHorses(): Horse[] {
  return HORSE_ODDS.map((h, i) => {
    // higher multiplier -> longer odds -> slightly lower average speed
    const base = 1 + Math.random() * 0.6; // 1.0 - 1.6
    const oddsFactor = 1 / (h.multiplier || 1);
    const speed = base * (0.9 + oddsFactor * 0.6);

    return {
      id: h.id,
      name: h.name,
      multiplier: h.multiplier,
      progress: 0,
      speed,
    } as Horse;
  });
}

// Utility: pick winner deterministically from finished horses (first to >=100)
export function pickWinner(horses: Horse[]) {
  const finished = horses.filter((h) => h.progress >= 100);
  if (finished.length === 0) return null;
  // pick horse with largest progress
  finished.sort((a, b) => b.progress - a.progress);
  return finished[0].id;
}
