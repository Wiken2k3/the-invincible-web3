import {
  Container,
  Button,
  NumberInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import Wheel from "./Wheel";
import { spinWheel } from "./wheel.logic";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS, TREASURY_ID } from "../../../config/web3";
import { saveTx } from "../../../utils/saveTx"; // ✅ IMPORT

export default function WheelSpin() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // ▶️ Spin handler (FULL HISTORY)
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
      onSuccess: (tx) => {
        // 1️⃣ BET
        saveTx({
          id: crypto.randomUUID(),
          game: "Wheel",
          amount: bet,
          status: "success",
          result: "bet",
          digest: tx?.digest,
          timestamp: Date.now(),
        });

        const result = spinWheel();

        // cộng thêm vòng quay để animation không quay ngược
        setRotate((prev) => prev + result.rotateDeg + 360 * 3);

        setTimeout(() => {
          const reward = bet * result.reward.multiplier;

          if (result.reward.multiplier > 0) {
            // 2️⃣ WIN
            saveTx({
              id: crypto.randomUUID(),
              game: "Wheel",
              amount: bet,
              status: "success",
              result: "win",
              reward,
              meta: {
                label: result.reward.label,
                multiplier: result.reward.multiplier,
              },
              timestamp: Date.now(),
            });

            showNotification({
              title: "🎉 Thắng!",
              message: `Nhận ${reward.toFixed(2)} SUI`,
              color: "green",
            });
          } else {
            // 3️⃣ LOSE
            saveTx({
              id: crypto.randomUUID(),
              game: "Wheel",
              amount: bet,
              status: "success",
              result: "lose",
              meta: {
                label: result.reward.label,
              },
              timestamp: Date.now(),
            });

            showNotification({
              title: "💀 Thua",
              message: "Chúc may mắn lần sau!",
              color: "red",
            });
          }

          setSpinning(false);
        }, 3600);
      },

      onError: () => {
        // 4️⃣ FAILED
        saveTx({
          id: crypto.randomUUID(),
          game: "Wheel",
          amount: bet,
          status: "failed",
          timestamp: Date.now(),
        });

        setSpinning(false);
      },
    });
  };

  return (
    <Container size="sm" style={{ textAlign: "center" }}>
      <Title mb="md">🎡 Wheel Spin</Title>

      <Wheel rotate={rotate} />

      <NumberInput
        mt="md"
        label="Bet (SUI)"
        value={bet}
        min={0.1}
        step={0.1}
        onChange={(v) => setBet(Number(v))}
      />

      <Button
        mt="lg"
        size="lg"
        loading={spinning}
        onClick={onSpin}
      >
        SPIN
      </Button>
    </Container>
  );
}
