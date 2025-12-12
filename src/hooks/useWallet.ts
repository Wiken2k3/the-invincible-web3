// src/hooks/useWallet.ts
import { useCallback, useState, useEffect } from "react";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";

const LOCAL_KEY = "invincible_sui_address";

export function useWallet() {
  const account = useCurrentAccount();
  const { mutateAsync: disconnectWallet } = useDisconnectWallet();

  const [address, setAddress] = useState<string | null>(() => {
    try { return localStorage.getItem(LOCAL_KEY); } catch { return null; }
  });

  useEffect(() => {
    if (account?.address) {
      localStorage.setItem(LOCAL_KEY, account.address);
      setAddress(account.address);
    } else if (!account) {
      setAddress(null);
    }
  }, [account]);

  const logout = useCallback(async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error("Disconnect wallet error:", error);
    }
    localStorage.removeItem(LOCAL_KEY);
    setAddress(null);
  }, [disconnectWallet]);

  return { address, logout };
}
