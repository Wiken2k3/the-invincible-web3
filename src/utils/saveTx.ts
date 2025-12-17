export type TxItem = {
  id: string;
  game: string;
  amount: number;
  status: "success" | "failed";
  // allow marking the initial bet action as 'bet' as well
  result?: "win" | "lose" | "bet";
  digest?: string;
  reward?: number;
  meta?: Record<string, any>;
  timestamp: number;
};

const TX_STORAGE_KEY = "invincible_tx_history";

export function saveTx(tx: TxItem) {
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(tx);
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Save tx failed", e);
  }
}
