import {
  Box,
  Button,
  Card,
  Grid,
  NumberInput,
  Text,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

import { generateTower } from "./tower.logic";
import { MULTIPLIERS } from "./tower.config";

export default function Tower() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [level, setLevel] = useState(0);
  const [tower, setTower] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);

  const startGame = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        setTower(generateTower());
        setLevel(0);
        setPlaying(true);
      },
    });
  };

  const pick = () => {
    const result = tower[level];

    if (result === "BOMB") {
      showNotification({
        title: "💣 BOOM!",
        message: "Bạn đã thua!",
        color: "red",
      });
      setPlaying(false);
      return;
    }

    const nextLevel = level + 1;
    setLevel(nextLevel);

    showNotification({
      title: "✅ An toàn!",
      message: `Multiplier x${MULTIPLIERS[level]}`,
      color: "green",
    });
  };

  const cashOut = () => {
    const reward = bet * MULTIPLIERS[level - 1];

    showNotification({
      title: "💰 CASH OUT",
      message: `Bạn nhận ${reward.toFixed(2)} SUI`,
      color: "green",
    });

    setPlaying(false);
  };

  return (
    <Card radius="lg" p="xl" style={{ maxWidth: 420 }}>
      <Title order={3}>🗼 Tower Game</Title>

      {!playing && (
        <>
          <NumberInput
            label="Bet (SUI)"
            value={bet}
            onChange={(v) => setBet(Number(v))}
            min={0.1}
            step={0.1}
          />

          <Button fullWidth mt="md" onClick={startGame}>
            Start Game
          </Button>
        </>
      )}

      {playing && (
        <>
          <Text mt="md">
            Level: {level + 1} / {MULTIPLIERS.length}
          </Text>

          <Text>Multiplier: x{MULTIPLIERS[level]}</Text>

          <Grid mt="md">
            <Grid.Col span={6}>
              <Button fullWidth color="green" onClick={pick}>
                Go Up
              </Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button fullWidth color="yellow" onClick={cashOut}>
                Cash Out
              </Button>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Card>
  );
}
