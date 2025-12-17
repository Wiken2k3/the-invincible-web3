/**
 * 🔥 Custom Hook để dễ dàng tương tác với Sui Smart Contract
 * 
 * Usage:
 * const { callContract, readObject, getBalance } = useSuiContract();
 */

import { useCallback } from "react";
import { 
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext
} from "@mysten/dapp-kit";import { Transaction } from "@mysten/sui/transactions";
import { showNotification } from "@mantine/notifications";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { PACKAGE_ID, TREASURY_ID } from "../config/web3";

// Thay thế bằng ID thật bạn vừa lấy được (now imported from config/web3.ts)

export function useSuiContract() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const ctx = useSuiClientContext();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  /**
   * Gọi function từ Smart Contract
   */
  const callContract = useCallback(
    async (
      target: string, // Ví dụ: "0x123::module::function"
      arguments_: any[] = [],
      options?: {
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      if (!account) {
        showNotification({
          title: "Lỗi",
          message: "Vui lòng kết nối wallet trước!",
          color: "red",
        });
        return;
      }

      try {
        const tx = new Transaction();
        tx.moveCall({
          target,
          arguments: arguments_,
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({
                title: "Thành công",
                message: `Transaction: ${result.digest}`,
                color: "green",
              });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({
                title: "Lỗi",
                message: error.message,
                color: "red",
              });
              options?.onError?.(error as Error);
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        showNotification({
          title: "Lỗi",
          message: err.message,
          color: "red",
        });
        options?.onError?.(err);
      }
    },
    [account, signAndExecute]
  );

  /**
   * Đọc object từ blockchain
   */
  const readObject = useCallback(
    async (objectId: string) => {
      try {
        const object = await suiClient.getObject({
          id: objectId,
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });
        return object;
      } catch (error) {
        console.error("Error reading object:", error);
        throw error;
      }
    },
    [suiClient]
  );

  /**
   * Lấy balance của account
   */
  const getBalance = useCallback(async () => {
    if (!account) return null;
    try {
      const balance = await suiClient.getBalance({
        owner: account.address,
      });
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      return null;
    }
  }, [account, suiClient]);

  /**
   * Transfer SUI
   */
  const transferSui = useCallback(
    async (
      recipient: string,
      amount: number, // amount in SUI (will be converted to MIST)
      options?: {
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      if (!account) {
        showNotification({
          title: "Lỗi",
          message: "Vui lòng kết nối wallet trước!",
          color: "red",
        });
        return;
      }

      try {
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]); // Convert to MIST
        tx.transferObjects([coin], recipient);

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({
                title: "Thành công",
                message: `Đã chuyển ${amount} SUI`,
                color: "green",
              });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({
                title: "Lỗi",
                message: error.message,
                color: "red",
              });
              options?.onError?.(error as Error);
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        showNotification({
          title: "Lỗi",
          message: err.message,
          color: "red",
        });
        options?.onError?.(err);
      }
    },
    [account, signAndExecute]
  );

  /**
   * Place Bet on Mines Game
   */
  const placeBet = useCallback(
    async (
      amount: number, // amount in SUI
      options?: {
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      if (!account) {
        showNotification({
          title: "Lỗi",
          message: "Vui lòng kết nối wallet trước!",
          color: "red",
        });
        return;
      }

      try {
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]); // Convert to MIST
        
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::place_bet`,
          arguments: [tx.object(TREASURY_ID), coin],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({
                title: "Lỗi đặt cược",
                message: error.message,
                color: "red",
              });
              options?.onError?.(error as Error);
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        showNotification({
          title: "Lỗi",
          message: err.message,
          color: "red",
        });
        options?.onError?.(err);
      }
    },
    [account, signAndExecute]
  );

  /**
   * Claim Reward from Treasury
   */
  const claimReward = useCallback(
    async (
      amount: number, // amount in SUI
      options?: {
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      if (!account) {
        showNotification({
          title: "Lỗi",
          message: "Vui lòng kết nối wallet trước!",
          color: "red",
        });
        return;
      }

      try {
        const tx = new Transaction();
        
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::claim_reward`,
          arguments: [tx.object(TREASURY_ID), tx.pure.u64(BigInt(amount * 1e9))],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({
                title: "🎉 Thắng!",
                message: `Nhận thưởng ${amount.toFixed(3)} SUI`,
                color: "green",
              });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({
                title: "Lỗi",
                message: error.message,
                color: "red",
              });
              options?.onError?.(error as Error);
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        showNotification({
          title: "Lỗi",
          message: err.message,
          color: "red",
        });
        options?.onError?.(err);
      }
    },
    [account, signAndExecute]
  );

  /**
   * Deposit SUI to Treasury (for funding treasury)
   */
  const depositToTreasury = useCallback(
    async (
      amount: number, // amount in SUI
      options?: {
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      if (!account) {
        showNotification({
          title: "Lỗi",
          message: "Vui lòng kết nối wallet trước!",
          color: "red",
        });
        return;
      }

      try {
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [amount * 1e9]);
        
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::deposit_to_treasury`,
          arguments: [tx.object(TREASURY_ID), coin],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({
                title: "✅ Nạp thành công",
                message: `Đã gửi ${amount.toFixed(3)} SUI tới Treasury`,
                color: "green",
              });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({
                title: "Lỗi",
                message: error.message,
                color: "red",
              });
              options?.onError?.(error as Error);
            },
          }
        );
      } catch (error) {
        const err = error as Error;
        showNotification({
          title: "Lỗi",
          message: err.message,
          color: "red",
        });
        options?.onError?.(err);
      }
    },
    [account, signAndExecute]
  );

  return {
    callContract,
    readObject,
    getBalance,
    transferSui,
    placeBet,
    claimReward,
    depositToTreasury,
    isPending,
    account,
  };
}

