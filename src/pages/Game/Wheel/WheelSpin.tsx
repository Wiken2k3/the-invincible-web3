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
import { TREASURY_ADDRESS } from "../../../config/web3";

export default function WheelSpin() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // ▶️ Spin handler
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
        const result = spinWheel();

        // cộng thêm vòng quay để animation không quay ngược
        setRotate((prev) => prev + result.rotateDeg + 360 * 3);

        setTimeout(() => {
          if (result.reward.multiplier > 0) {
            showNotification({
              title: "🎉 Thắng!",
              message: `Nhận ${(bet * result.reward.multiplier).toFixed(2)} SUI`,
              color: "green",
            });
          } else {
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
