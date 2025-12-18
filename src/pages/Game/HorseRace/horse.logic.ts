export function generateRace() {
  const horses = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    speed: Math.random() * 2 + 1, // random speed
    progress: 0,
  }));

  let finished = false;
  let winner = null;

  while (!finished) {
    horses.forEach((h) => {
      h.progress += h.speed;
      if (h.progress >= 100 && !winner) {
        winner = h.id;
        finished = true;
      }
    });
  }

  return {
    winner,
    horses,
  };
}
