/**
 * 🔥 Custom Hook để dễ dàng tương tác với Sui Smart Contract
 * 
 * Usage:
 * const { callContract, readObject, getBalance } = useSuiContract();
 */

import { useCallback } from "react";
import { 
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { showNotification } from "@mantine/notifications";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui/faucet";
import { PACKAGE_ID, TREASURY_ID } from "../config/web3";

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
   * Place Bet: Gọi smart contract để đặt cược
   */
  const placeBet = useCallback(
    async (amount: number, options?: any) => {
      if (!account) return Promise.reject(new Error('No account'));
      try {
        const tx = new Transaction();
        const amountMist = BigInt(Math.round(amount * 1_000_000_000));

        // Check mạng trước khi thực hiện
        if (ctx.network !== "testnet") {
          showNotification({ title: "Cảnh báo mạng", message: `App đang ở mạng ${ctx.network}. Vui lòng chuyển sang Testnet!`, color: "orange" });
        }
        
        // --- TỐI ƯU HÓA GAS & COIN ---
        // Thay vì chọn coin input, ta chọn coin để làm Gas Payment.
        // SUI cho phép dùng Gas Coin để split ra chuyển đi.
        try {
          // 1. Fetch ALL coins (Xử lý phân trang để lấy hết coin)
          const allCoins = [];
          let cursor = null;
          do {
            const response = await suiClient.getCoins({ 
              owner: account.address, 
              coinType: "0x2::sui::SUI",
              cursor,
            });
            allCoins.push(...response.data);
            cursor = response.nextCursor;
          } while (cursor);
          
          // 2. Sắp xếp coin từ lớn đến bé
          const sortedCoins = allCoins.sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)));
          
          // 3. Tính tổng tiền cần thiết (Cược + 0.05 SUI Gas Budget cố định)
          const GAS_BUDGET = 50_000_000n; // 0.05 SUI
          const totalNeeded = amountMist + GAS_BUDGET;
          
          // Check tổng số dư trước để báo lỗi rõ ràng
          const totalBalance = allCoins.reduce((sum, c) => sum + BigInt(c.balance), 0n);
          if (totalBalance < totalNeeded) {
             const currentSui = Number(totalBalance) / 1e9;
             const neededSui = Number(totalNeeded) / 1e9;
             throw new Error(`Mạng: ${ctx.network}. Ví: ${account.address.slice(0,6)}... Số dư: ${currentSui.toFixed(3)} SUI. Cần: ${neededSui.toFixed(3)} SUI.`);
          }

          // 4. Chọn các coin để làm Gas (gộp nhiều coin nếu 1 coin không đủ)
          let currentSum = 0n;
          const gasCoins = [];
          
          for (const coin of sortedCoins) {
            if (currentSum >= totalNeeded) break;
            gasCoins.push(coin);
            currentSum += BigInt(coin.balance);
          }

          // 5. Nếu tìm được coin đủ, set Gas Payment rõ ràng
          if (currentSum >= totalNeeded && gasCoins.length > 0) {
            tx.setGasPayment(gasCoins.map(c => ({
              objectId: c.coinObjectId,
              version: c.version,
              digest: c.digest
            })));
          }

          // QUAN TRỌNG: Set Gas Budget cố định để ví không bị lỗi ước tính
          tx.setGasBudget(Number(GAS_BUDGET));
        } catch (e) { 
            console.warn("Coin optimization failed", e);
            // Nếu lỗi do mình chủ động throw thì ném ra ngoài để hiện thông báo
            if (e instanceof Error && e.message.includes("Số dư Testnet không đủ")) {
                throw e;
            }
        }
        // ------------------------------------------
        
        // Luôn dùng tx.gas (lúc này đã được set là các coin to nhất) để tách tiền
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist.toString())]);
        
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::place_bet`,
          arguments: [tx.object(TREASURY_ID), coin],
        });

        return new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: (result) => {
                options?.onSuccess?.(result);
                resolve(result);
              },
              onError: (error) => {
                const msg = error.message;
                if (msg.includes("does not exist") || msg.includes("ObjectNotFound")) {
                  showNotification({ title: "Sai mạng lưới", message: "Không tìm thấy Contract. Hãy chuyển ví sang Testnet!", color: "orange" });
                } else if (msg.includes("No valid gas coins")) {
                  showNotification({ title: "Lỗi Coin lẻ", message: "Ví bạn có nhiều coin lẻ không đủ trả gas. Hãy thử Faucet thêm để gộp coin!", color: "red" });
                } else {
                  showNotification({ title: "Lỗi đặt cược", message: msg, color: "red" });
                }
                options?.onError?.(error);
                reject(error);
              },
              onSettled: options?.onFinally,
            }
          );
        });
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          showNotification({
            title: "Lỗi",
            message: err.message,
            color: "red",
          });
        }
        options?.onFinally?.();
        return Promise.reject(err);
      }
    },
    [account, signAndExecute, suiClient]
  );

  /**
   * Claim Reward: Gọi smart contract để nhận thưởng
   */
  const claimReward = useCallback(
    async (amount: number, options?: any) => {
      if (!account) return Promise.reject(new Error('No account'));
      try {
        const tx = new Transaction();

        // --- TỐI ƯU HÓA GAS & COIN (giống placeBet) ---
        try {
          const allCoins = [];
          let cursor = null;
          do {
            const response = await suiClient.getCoins({
              owner: account.address,
              coinType: "0x2::sui::SUI",
              cursor,
            });
            allCoins.push(...response.data);
            cursor = response.nextCursor;
          } while (cursor);

          const sortedCoins = allCoins.sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)));
          const GAS_BUDGET = 50_000_000n; // 0.05 SUI
          // Choose gas coins to cover minimal gas budget
          let currentSum = 0n;
          const gasCoins = [];
          const totalNeeded = GAS_BUDGET;
          for (const coin of sortedCoins) {
            if (currentSum >= totalNeeded) break;
            gasCoins.push(coin);
            currentSum += BigInt(coin.balance);
          }
          if (currentSum >= totalNeeded && gasCoins.length > 0) {
            tx.setGasPayment(gasCoins.map(c => ({ objectId: c.coinObjectId, version: c.version, digest: c.digest })));
          }
          tx.setGasBudget(Number(GAS_BUDGET));
        } catch (e) {
          console.warn('ClaimReward: coin optimization failed', e);
        }

        // Gọi hàm claim_reward
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::claim_reward`,
          arguments: [
            tx.object(TREASURY_ID),
            tx.pure.u64(Math.floor(amount * 1e9)), // Convert SUI to MIST
          ],
        });

        return new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            {
              onSuccess: (result) => {
                options?.onSuccess?.(result);
                resolve(result);
              },
              onError: (error) => {
                showNotification({ title: "Lỗi nhận thưởng", message: error.message, color: "red" });
                options?.onError?.(error);
                reject(error);
              },
              onSettled: options?.onFinally,
            }
          );
        });
      } catch (err) {
        console.error(err);
        options?.onFinally?.();
        return Promise.reject(err);
      }
    },
    [account, signAndExecute]
  );

  /**
   * Claim Winnings: Gọi smart contract để nhận thưởng từ các game (VD: Đua ngựa)
   */
  const claimWinnings = useCallback(
    async (amount: number, options?: any) => {
      if (!account) return Promise.reject(new Error('No account'));
      try {
        const tx = new Transaction();

        // --- TỐI ƯU HÓA GAS & COIN (giống các hàm khác) ---
        try {
          const allCoins = [];
          let cursor = null;
          do {
            const response = await suiClient.getCoins({
              owner: account.address,
              coinType: "0x2::sui::SUI",
              cursor,
            });
            allCoins.push(...response.data);
            cursor = response.nextCursor;
          } while (cursor);

          const sortedCoins = allCoins.sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)));
          const GAS_BUDGET = 50_000_000n; // 0.05 SUI
          let currentSum = 0n;
          const gasCoins = [];
          const totalNeeded = GAS_BUDGET;
          for (const coin of sortedCoins) {
            if (currentSum >= totalNeeded) break;
            gasCoins.push(coin);
            currentSum += BigInt(coin.balance);
          }
          if (currentSum >= totalNeeded && gasCoins.length > 0) {
            tx.setGasPayment(gasCoins.map(c => ({ objectId: c.coinObjectId, version: c.version, digest: c.digest })));
          }
          tx.setGasBudget(Number(GAS_BUDGET));
        } catch (e) {
          console.warn('claimWinnings: coin optimization failed', e);
        }

        // TODO: Thay 'horse_race::claim_winnings' bằng module và function tương ứng trên smart contract của bạn
        tx.moveCall({
          target: `${PACKAGE_ID}::horse_race::claim_winnings`,
          arguments: [
            tx.object(TREASURY_ID),
            tx.pure.u64(Math.floor(amount * 1e9)), // Convert SUI to MIST
          ],
        });

        return new Promise((resolve, reject) => {
          signAndExecute(
            { transaction: tx },
            { onSuccess: (result) => { options?.onSuccess?.(result); resolve(result); }, onError: (error) => { showNotification({ title: "Lỗi nhận thưởng", message: error.message, color: "red" }); options?.onError?.(error); reject(error); }, onSettled: options?.onFinally, }
          );
        });
      } catch (err) { console.error(err); options?.onFinally?.(); return Promise.reject(err); }
    },
    [account, signAndExecute, suiClient]
  );

  /**
   * Lấy số dư hiện tại của Treasury (Kho bạc game)
   */
  const getTreasuryBalance = useCallback(async () => {
    try {
      const res = await suiClient.getObject({
        id: TREASURY_ID,
        options: { showContent: true },
      });
      // Balance trong Move là struct { value: u64 }
      const fields = (res.data?.content as any)?.fields;
      return fields?.balance; // Trả về số MIST
    } catch (e) {
      console.error("Lỗi lấy số dư Treasury:", e);
      return null;
    }
  }, [suiClient]);

  /**
   * Faucet SUI Testnet
   */
  const requestFaucet = useCallback(async () => {
    if (!account) return;
    try {
      await requestSuiFromFaucetV0({
        host: getFaucetHost("testnet"),
        recipient: account.address,
      });
      showNotification({
        title: "Faucet thành công",
        message: "Đã yêu cầu SUI. Vui lòng đợi vài giây rồi kiểm tra ví.",
        color: "green",
      });
    } catch (error) {
      console.error(error);
      const err = error as Error;
      let msg = err.message;
      if (msg.includes("Too many requests") || msg.includes("429")) {
        msg = "Bạn đã xin quá nhiều lần. Vui lòng đợi 1 tiếng hoặc dùng Discord SUI để xin thêm.";
      } else if (msg.includes("Bad Gateway") || msg.includes("502")) {
        msg = "Server Faucet đang bảo trì. Vui lòng thử lại sau.";
      }
      showNotification({ title: "Lỗi Faucet", message: msg, color: "red" });
    }
  }, [account]);

  /**
   * Deposit: Nạp tiền vào Treasury (Dành cho Admin/Test)
   */
  const depositToTreasury = useCallback(
    async (amount: number, options?: any) => {
      if (!account) return;
      try {
        const tx = new Transaction();
        const amountMist = BigInt(Math.round(amount * 1_000_000_000));

        // --- TỐI ƯU HÓA GAS & COIN (Copy từ placeBet) ---
        try {
          const allCoins = [];
          let cursor = null;
          do {
            const response = await suiClient.getCoins({ 
              owner: account.address, 
              coinType: "0x2::sui::SUI",
              cursor,
            });
            allCoins.push(...response.data);
            cursor = response.nextCursor;
          } while (cursor);
          
          const sortedCoins = allCoins.sort((a, b) => Number(BigInt(b.balance) - BigInt(a.balance)));
          const GAS_BUDGET = 50_000_000n; 
          const totalNeeded = amountMist + GAS_BUDGET;
          
          let currentSum = 0n;
          const gasCoins = [];
          
          for (const coin of sortedCoins) {
            if (currentSum >= totalNeeded) break;
            gasCoins.push(coin);
            currentSum += BigInt(coin.balance);
          }

          if (currentSum >= totalNeeded && gasCoins.length > 0) {
            tx.setGasPayment(gasCoins.map(c => ({
              objectId: c.coinObjectId,
              version: c.version,
              digest: c.digest
            })));
          }
          tx.setGasBudget(Number(GAS_BUDGET));
        } catch (e) { console.warn("Coin optimization failed", e); }
        // ------------------------------------------
        
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist.toString())]);
        
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::deposit`, // Gọi hàm deposit
          arguments: [tx.object(TREASURY_ID), coin],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({ title: "Nạp tiền thành công", message: "Đã nạp thêm vốn vào Treasury", color: "green" });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({ title: "Lỗi nạp tiền", message: error.message, color: "red" });
              options?.onError?.(error);
            },
            onSettled: options?.onFinally,
          }
        );
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          showNotification({
            title: "Lỗi",
            message: err.message,
            color: "red",
          });
        }
        options?.onFinally?.();
      }
    },
    [account, signAndExecute, suiClient]
  );

  /**
   * Withdraw: Rút hết tiền từ Treasury về ví chỉ định
   */
  const withdrawFromTreasury = useCallback(
    async (recipient: string, options?: any) => {
      if (!account) return;
      try {
        const tx = new Transaction();
        
        // Gọi hàm withdraw trong contract
        tx.moveCall({
          target: `${PACKAGE_ID}::mines::withdraw`,
          arguments: [
            tx.object(TREASURY_ID),
            tx.pure.address(recipient),
          ],
        });

        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              showNotification({ title: "Rút tiền thành công", message: `Đã rút hết về ${recipient.slice(0,6)}...`, color: "green" });
              options?.onSuccess?.(result);
            },
            onError: (error) => {
              showNotification({ title: "Lỗi rút tiền", message: error.message, color: "red" });
              options?.onError?.(error);
            },
            onSettled: options?.onFinally,
          }
        );
      } catch (err) { console.error(err); options?.onFinally?.(); }
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
    claimWinnings,
    getTreasuryBalance,
    depositToTreasury,
    withdrawFromTreasury,
    requestFaucet,
    isPending,
    account,
  };
}
