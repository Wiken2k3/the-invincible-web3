import {
  Container,
  Button,
  Group,
  Title,
  NumberInput,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

import { rollDice } from "./taixiu.logic";
import Dice from "./Dice";

type Choice = "TAI" | "XIU";

export default function TaiXiu() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [dice, setDice] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);

  // ▶️ Bet handler (WEB3 FLOW)
  const onPlay = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    if (!choice || spinning) return;

    setSpinning(true);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        const result = rollDice();
        setDice(result.dice);

        setTimeout(() => {
          if (result.result === choice) {
            showNotification({
              title: "🎉 Thắng!",
              message: `Nhận ${(bet * 2).toFixed(2)} SUI`,
              color: "green",
            });
          } else {
            showNotification({
              title: "💀 Thua",
              message: `Kết quả: ${result.sum} (${result.result})`,
              color: "red",
            });
          }

          setSpinning(false);
        }, 1200);
      },
      onError: () => {
        setSpinning(false);
      },
    });
  };

  return (
    <Container size="sm" ta="center">
      <Title>🎲 Tài Xỉu</Title>

      {/* Dice */}
      <Group justify="center" mt="md">
        {dice.map((d, i) => (
          <Dice key={i} value={d} />
        ))}
      </Group>

      {/* Choice */}
      <Group justify="center" mt="lg">
        <Button
          color={choice === "TAI" ? "green" : "gray"}
          onClick={() => setChoice("TAI")}
        >
          TÀI (11–17)
        </Button>

        <Button
          color={choice === "XIU" ? "blue" : "gray"}
          onClick={() => setChoice("XIU")}
        >
          XỈU (4–10)
        </Button>
      </Group>

      {/* Bet */}
      <NumberInput
        mt="md"
        label="Bet (SUI)"
        min={0.1}
        value={bet}
        onChange={(v) => setBet(Number(v))}
      />

      {/* Play */}
      <Button
        mt="lg"
        size="lg"
        loading={spinning}
        disabled={!choice}
        onClick={onPlay}
      >
        PLAY
      </Button>
    </Container>
  );
}
