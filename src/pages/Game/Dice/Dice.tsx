import {
  Card,
  Button,
  Group,
  Text,
  Title,
  NumberInput,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import { rollDice } from "./dice.logic";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

type Choice = "TAI" | "XIU";

export default function Dice() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<any>(null);

  // ▶️ Play Game
  const play = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    if (!choice) {
      showNotification({
        title: "Chưa chọn",
        message: "Vui lòng chọn Tài hoặc Xỉu",
        color: "orange",
      });
      return;
    }

    setRolling(true);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        const result = rollDice();
        setLastRoll(result);

        if (result.result === choice) {
          const reward = bet * 2;

          showNotification({
            title: "🎉 Thắng!",
            message: `Bạn nhận ${reward.toFixed(2)} SUI`,
            color: "green",
          });
        } else {
          showNotification({
            title: "❌ Thua",
            message: "Chúc bạn may mắn lần sau!",
            color: "red",
          });
        }

        setRolling(false);
      },
      onError: () => {
        setRolling(false);
      },
    });
  };

  return (
    <Card radius="lg" p="xl" maw={420} mx="auto">
      <Title order={3}>🎲 Tài Xỉu</Title>

      <NumberInput
        label="Bet (SUI)"
        value={bet}
        onChange={(v) => setBet(Number(v))}
        min={0.1}
        step={0.1}
        mt="md"
      />

      <Group mt="md" grow>
        <Button
          color={choice === "TAI" ? "green" : "gray"}
          onClick={() => setChoice("TAI")}
        >
          TÀI (11–18)
        </Button>

        <Button
          color={choice === "XIU" ? "blue" : "gray"}
          onClick={() => setChoice("XIU")}
        >
          XỈU (3–10)
        </Button>
      </Group>

      <Button
        fullWidth
        mt="lg"
        loading={rolling}
        disabled={!choice}
        onClick={play}
      >
        🎲 Roll
      </Button>

      {lastRoll && (
        <>
          <Text mt="md">
            Xúc xắc: {lastRoll.dices.join(" - ")}
          </Text>
          <Text>
            Tổng: {lastRoll.total} → {lastRoll.result}
          </Text>
        </>
      )}
    </Card>
  );
}
