import {
  Card,
  Button,
  Group,
  Text,
  Title,
  NumberInput,
  Progress,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

import { generateRace } from "./horse.logic";
import { HORSE_ODDS } from "./horse.config";

export default function HorseRace() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [horses, setHorses] = useState<any[]>([]);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  // ▶️ Start Race
  const startRace = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    if (selectedHorse === null) {
      showNotification({
        title: "Chưa chọn ngựa",
        message: "Hãy chọn 1 con ngựa",
        color: "orange",
      });
      return;
    }

    setRacing(true);
    setWinner(null);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        const race = generateRace();
        setHorses(race.horses);
        setWinner(race.winner);

        if (race.winner === selectedHorse) {
          showNotification({
            title: "🏆 Thắng!",
            message: `Bạn thắng ${(bet * 3).toFixed(2)} SUI`,
            color: "green",
          });
        } else {
          showNotification({
            title: "❌ Thua",
            message: "Ngựa của bạn không thắng",
            color: "red",
          });
        }

        setRacing(false);
      },
      onError: () => {
        setRacing(false);
      },
    });
  };

  return (
    <Card radius="lg" p="xl" maw={420} mx="auto">
      <Title order={3}>🐎 Horse Race</Title>

      <NumberInput
        label="Bet (SUI)"
        value={bet}
        onChange={(v) => setBet(Number(v))}
        min={0.1}
        step={0.1}
        mt="md"
      />

      {/* Chọn ngựa */}
      <Group mt="md" grow>
        {HORSE_ODDS.map((h) => (
          <Button
            key={h.id}
            variant={selectedHorse === h.id ? "filled" : "outline"}
            onClick={() => setSelectedHorse(h.id)}
          >
            {h.name} (x{h.multiplier})
          </Button>
        ))}
      </Group>

      <Button
        fullWidth
        mt="lg"
        loading={racing}
        disabled={selectedHorse === null}
        onClick={startRace}
      >
        🏁 Start Race
      </Button>

      {/* Hiển thị đua */}
      {horses.length > 0 && (
        <>
          <Text mt="lg" fw={500}>
            🏇 Cuộc đua
          </Text>

          {horses.map((h) => (
            <div key={h.id}>
              <Text size="sm">
                {h.name} {winner === h.id && "🏆"}
              </Text>
              <Progress
                value={h.progress}
                color={winner === h.id ? "green" : "blue"}
                mb="sm"
              />
            </div>
          ))}
        </>
      )}
    </Card>
  );
}
