export type SymbolType = {
  id: string;
  icon: string;
  multiplier: number;
};

export const SYMBOLS: SymbolType[] = [
  { id: "cherry", icon: "🍒", multiplier: 2 },
  { id: "lemon", icon: "🍋", multiplier: 3 },
  { id: "bell", icon: "🔔", multiplier: 5 },
  { id: "star", icon: "⭐", multiplier: 8 },
  { id: "diamond", icon: "💎", multiplier: 15 },
];
