export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 6) + 1;

  const total = d1 + d2 + d3;

  return {
    dices: [d1, d2, d3],
    total,
    result: total >= 11 ? "TAI" : "XIU",
  };
}
