import { SYMBOLS } from "./symbols";

export function spinReels() {
  const reels = [
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];

  const isWin =
    reels[0].id === reels[1].id && reels[1].id === reels[2].id;

  const payout = isWin ? reels[0].multiplier : 0;

  return { reels, isWin, payout };
}
