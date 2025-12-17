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
import { TREASURY_ADDRESS, TREASURY_ID } from "../../../config/web3";

import { HORSE_ODDS } from "./horse.config";
import { useHorseRace } from "./useHorseRace";
import HorseTrack from "./HorseTrack";
import { saveTx } from "../../../utils/saveTx"; // ✅ THÊM IMPORT

export default function HorseRace() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const { horses, racing, start, reset } = useHorseRace();
  const [winner, setWinner] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

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

    setWinner(null);

    // ⏳ countdown
    let cd = 3;
    setCountdown(cd);
    const cdInterval = setInterval(() => {
      cd -= 1;
      setCountdown(cd > 0 ? cd : null);
      if (cd <= 0) clearInterval(cdInterval);
    }, 1000);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: async (tx) => {
        try {
          reset();
          await new Promise((r) => setTimeout(r, 3500));

          const winId = await start();
          setWinner(winId);

          const isWin = winId === selectedHorse;

          // 🔥 LƯU TRANSACTION
          saveTx({
            id: crypto.randomUUID(),
            game: "HorseRace",
            amount: bet,
            status: "success",
            result: isWin ? "win" : "lose",
            digest: tx?.digest,
            timestamp: Date.now(),
          });

          if (isWin) {
            const multiplier =
              HORSE_ODDS.find((h) => h.id === winId)?.multiplier || 1;

            showNotification({
              title: "🏆 Thắng!",
              message: `Bạn thắng ${(bet * multiplier).toFixed(2)} SUI`,
              color: "green",
            });
          } else {
            showNotification({
              title: "❌ Thua",
              message: "Ngựa của bạn không thắng",
              color: "red",
            });
          }
        } catch (err) {
          showNotification({
            title: "Lỗi",
            message: String(err),
            color: "red",
          });
        }
      },

      onError: (err) => {
        // ❌ TX FAIL
        saveTx({
          id: crypto.randomUUID(),
          game: "HorseRace",
          amount: bet,
          status: "failed",
          timestamp: Date.now(),
        });

        showNotification({
          title: "Lỗi giao dịch",
          message: "Giao dịch bị hủy",
          color: "red",
        });
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
        {countdown ? `⏳ ${countdown}` : "🏁 Start Race"}
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
