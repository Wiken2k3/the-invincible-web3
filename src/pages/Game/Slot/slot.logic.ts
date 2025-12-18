import { SYMBOLS } from "./symbols";
import type { SymbolType } from "./symbols";

/**
 * spinReels: simulate a spin with configurable number of columns (3 or 5)
 * Returns:
 * - reels: array of SymbolType shown
 * - win: boolean
 * - count: highest matching count for a symbol
 * - symbol: matched SymbolType | null
 * - multiplier: payout multiplier to apply to bet (e.g. 2.0 means bet*2)
 */
export function spinReels(columns = 3) {
  // create reels array
  const reels: SymbolType[] = [];
  for (let i = 0; i < columns; i++) {
    reels.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  // Count occurrences of each symbol id
  const counts: Record<string, { symbol: SymbolType; count: number }> = {};
  for (const s of reels) {
    if (!counts[s.id]) counts[s.id] = { symbol: s, count: 0 };
    counts[s.id].count++;
  }

  // Determine best payout based on counts
  let best = { symbol: null as SymbolType | null, count: 0, multiplier: 0 };
  for (const key of Object.keys(counts)) {
    const { symbol, count } = counts[key];
    let mult = 0;

    if (columns === 3) {
      // 3-column rules: 2-match small prize, 3-match full prize
      if (count === 2) mult = symbol.multiplier * 0.5; // half of symbol.multiplier
      if (count === 3) mult = symbol.multiplier; // full symbol multiplier
    } else {
      // 5-column rules: require at least 3 matches to win
      if (count === 3) mult = symbol.multiplier * 0.5;
      if (count === 4) mult = symbol.multiplier * 1.5;
      if (count === 5) mult = symbol.multiplier * 3;
    }

    if (mult > best.multiplier) {
      best = { symbol, count, multiplier: mult };
    }
  }

  const isWin = best.multiplier > 0;
  return {
    reels,
    win: isWin,
    count: best.count,
    symbol: best.symbol,
    multiplier: best.multiplier,
  };
}