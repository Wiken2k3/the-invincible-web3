import { motion } from "framer-motion";
import { WHEEL_ITEMS } from "./wheel.config";
import { useState } from "react";
import {
  Container,
  Button,
  NumberInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";
import { spinWheel } from "./wheel.logic";

// Wheel display component (requires rotate prop)
function WheelDisplay({ rotate }: { rotate: number }) {
  const sliceDeg = 360 / WHEEL_ITEMS.length;

  return (
    <motion.div
      animate={{ rotate }}
      transition={{ duration: 3.5, ease: "easeOut" }}
      style={{
        width: 260,
        height: 260,
        borderRadius: "50%",
        border: "8px solid #0ea5e9",
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {WHEEL_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "50%",
            height: "50%",
            background: item.color,
            transform: `rotate(${sliceDeg * i}deg)`,
            transformOrigin: "100% 100%",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />
      ))}

      {/* Tâm vòng quay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 16,
          height: 16,
          background: "#0ea5e9",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </motion.div>
  );
}

// Main Wheel page component (no props required for routing)
export default function Wheel() {
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
      onSuccess: (tx) => {
        const result = spinWheel();
        setRotate(result.rotateDeg);

        setTimeout(() => {
          showNotification({
            title: "🎉 Kết quả!",
            message: `Bạn thắng: ${(bet * result.reward.multiplier).toFixed(2)} SUI (Tx: ${tx?.digest?.slice(0, 8)}...)`,
            color: "green",
          });
          setSpinning(false);
        }, 3500);
      },
      onError: () => {
        setSpinning(false);
      },
    });
  };

  return (
    <Container size="sm" py={40}>
      <Title order={2} mb={20}>
        🎡 Vòng Quay May Mắn
      </Title>

      <WheelDisplay rotate={rotate} />

      <NumberInput
        label="Số tiền cược (SUI)"
        value={bet}
        onChange={(value) => setBet(value as number)}
        min={0.1}
        max={100}
        step={0.1}
        my={20}
      />

      <Button onClick={onSpin} disabled={spinning} fullWidth>
        {spinning ? "Đang quay..." : "🎡 Quay Vòng"}
      </Button>
    </Container>
  );
}
