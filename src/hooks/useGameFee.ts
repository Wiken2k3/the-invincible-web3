import { useSuiContract } from "./useSuiContract";

export function useGameFee() {
  const { transferSui } = useSuiContract();

  const payFee = async (amount: number) => {
    await transferSui(
      "0xGAME_TREASURY_ADDRESS",
      amount
    );
  };

  return { payFee };
}
