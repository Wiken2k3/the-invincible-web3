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

import { generateMines } from "./mines.logic";
import { getMultiplier } from "./mines.config";

export default function Mines() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [mines, setMines] = useState(3);
  const [opened, setOpened] = useState<number[]>([]);
  const [mineSet, setMineSet] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState(false);

  // ▶️ Start Game
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
        setMineSet(generateMines(mines));
        setOpened([]);
        setPlaying(true);
      },
    });
  };

  // 🧠 Click ô
  const clickCell = (i: number) => {
    if (!playing || opened.includes(i)) return;

    if (mineSet.has(i)) {
      showNotification({
        title: "💥 BOOM!",
        message: "Bạn đã trúng mìn!",
        color: "red",
      });
      setPlaying(false);
      return;
    }

    setOpened((prev) => [...prev, i]);
  };

  // 💰 Cash Out
  const cashOut = () => {
    const multiplier = getMultiplier(opened.length, mines);
    const reward = bet * multiplier;

    showNotification({
      title: "💰 CASH OUT",
      message: `Bạn nhận ${reward.toFixed(2)} SUI`,
      color: "green",
    });

    setPlaying(false);
  };

  return (
    <Card radius="lg" p="xl" style={{ maxWidth: 420 }}>
      <Title order={3}>💣 Mines Game</Title>

      {/* Setup */}
      {!playing && (
        <>
          <NumberInput
            label="Bet (SUI)"
            value={bet}
            onChange={(v) => setBet(Number(v))}
            min={0.1}
            step={0.1}
          />

          <NumberInput
            label="Số mìn"
            value={mines}
            onChange={(v) => setMines(Number(v))}
            min={1}
            max={10}
            mt="sm"
          />

          <Button fullWidth mt="md" onClick={startGame}>
            Start Game
          </Button>
        </>
      )}

      {/* Playing */}
      {playing && (
        <>
          <Grid mt="md">
            {Array.from({ length: 25 }).map((_, i) => (
              <Grid.Col span={2.4} key={i}>
                <Button
                  fullWidth
                  h={48}
                  variant={opened.includes(i) ? "filled" : "outline"}
                  color={opened.includes(i) ? "green" : "gray"}
                  onClick={() => clickCell(i)}
                >
                  {opened.includes(i) ? "💎" : "?"}
                </Button>
              </Grid.Col>
            ))}
          </Grid>

          <Text mt="sm">
            Multiplier: x{getMultiplier(opened.length, mines)}
          </Text>

          <Button fullWidth mt="md" color="yellow" onClick={cashOut}>
            Cash Out
          </Button>
        </>
      )}
    </Card>
  );
}
