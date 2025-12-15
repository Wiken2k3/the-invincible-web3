export function rollDice() {
  const dice = [
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
    Math.ceil(Math.random() * 6),
  ];

  const sum = dice.reduce((a, b) => a + b, 0);
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

  let result: "TAI" | "XIU" | "TRIPLE";
  if (isTriple) result = "TRIPLE";
  else if (sum >= 11) result = "TAI";
  else result = "XIU";

  return { dice, sum, result };
}
