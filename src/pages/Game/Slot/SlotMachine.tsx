import {
  Container,
  Button,
  Group,
  Title,
  NumberInput,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import Reel from "./Reel";
import { spinReels } from "./slot.logic";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

export default function SlotMachine() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [reels, setReels] = useState<any[]>([]);
  const [spinning, setSpinning] = useState(false);

  // ▶️ Spin handler (WEB3 FLOW)
  const onSpin = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    if (spinning) return;
    setSpinning(true);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        const result = spinReels();
        setReels(result.reels);

        setTimeout(() => {
          if (result.isWin) {
            showNotification({
              title: "🎉 JACKPOT!",
              message: `Bạn thắng ${(bet * result.payout).toFixed(2)} SUI`,
              color: "green",
            });
          } else {
            showNotification({
              title: "😢 Thua",
              message: "Chúc may mắn lần sau!",
              color: "red",
            });
          }

          setSpinning(false);
        }, 800);
      },
      onError: () => {
        setSpinning(false);
      },
    });
  };

  return (
    <Container size="sm" ta="center">
      <Title>🎰 Slot Machine</Title>

      {/* Reels */}
      <Group justify="center" mt="lg">
        {reels.map((r, i) => (
          <Reel key={i} icon={r.icon} />
        ))}
      </Group>

      {/* Bet */}
      <NumberInput
        mt="lg"
        label="Bet (SUI)"
        min={0.1}
        value={bet}
        onChange={(v) => setBet(Number(v))}
      />

      {/* Spin */}
      <Button
        mt="lg"
        size="xl"
        loading={spinning}
        onClick={onSpin}
        style={{
          background: "linear-gradient(135deg,#facc15,#f97316)",
          boxShadow: "0 0 25px rgba(250,204,21,0.6)",
        }}
      >
        SPIN 🎰
      </Button>
    </Container>
  );
}
