import {
  Card,
  Button,
  Group,
  Text,
  Title,
  NumberInput,
  Alert,
  Stack,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";

import { rollDice } from "./dice.logic";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS, TREASURY_ID, isValidSuiAddress } from "../../../config/web3";
import { saveTx } from "../../../utils/saveTx"; // ✅ IMPORT THÊM

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
      onSuccess: (result) => {
        const roll = rollDice();
        setLastRoll(roll);

        const isWin = roll.result === choice;

        // 🔥 LƯU TRANSACTION SUCCESS
        saveTx({
          id: crypto.randomUUID(),
          game: "Dice",
          amount: bet,
          status: "success",
          digest: result?.digest,
          timestamp: Date.now(),
        });

        if (isWin) {
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

      onError: (error) => {
        // 🔥 LƯU FAILED TX
        saveTx({
          id: crypto.randomUUID(),
          game: "Dice",
          amount: bet,
          status: "failed",
          timestamp: Date.now(),
        });

        showNotification({
          title: "Lỗi giao dịch",
          message: error.message,
          color: "red",
        });

        setRolling(false);
      },
    });
  };

  return (
    <Stack>
      {/* ⚠️ Setup Warning */}
      {!isValidSuiAddress(TREASURY_ADDRESS) && (
        <Alert color="yellow" title="⚙️ Cấu hình cần thiết">
          <Text size="sm">
            Để chơi game, bạn cần cập nhật địa chỉ ví nhận tiền.
          </Text>
          <Text size="sm" mt="xs" fw={600}>
            📝 Hướng dẫn:
          </Text>
          <Text size="sm" component="div" mt="xs">
            1. Mở file: <code>src/config/web3.ts</code>
            <br />
            2. Tìm dòng: <code>TREASURY_ADDRESS</code>
            <br />
            3. Thay thế bằng địa chỉ ví của bạn từ Sui Wallet
            <br />
            4. Lưu file và reload trang
          </Text>
        </Alert>
      )}

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
          disabled={!choice || !isValidSuiAddress(TREASURY_ADDRESS)}
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
    </Stack>
  );
}
