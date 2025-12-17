import {
  Container,
  Button,
  Group,
  Title,
  NumberInput,
  Text,
  Table,
  Divider,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS, TREASURY_ID } from "../../../config/web3";
import { rollDice } from "./taixiu.logic";
import { saveTx } from "../../../utils/saveTx";

type Choice = "TAI" | "XIU";

type HistoryItem = {
  sum: number;
  result: Choice;
  win: boolean;
  reward: number;
};

export default function TaiXiu() {
  const { address } = useWallet();
  const { transferSui, getBalance, claimReward } = useSuiContract();

  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!address) {
        setBalance(null);
        return;
      }
      try {
        const b = await getBalance();
        // eslint-disable-next-line no-console
        console.log("TaiXiu.getBalance ->", b);
        let total: any = null;
        if (b == null) total = null;
        else if (typeof b === "number" || typeof b === "string") total = b;
        else if ((b as any).totalBalance != null) total = (b as any).totalBalance;
        else if ((b as any).balance != null) total = (b as any).balance;
        else if ((b as any).data?.balance != null) total = (b as any).data.balance;
        if (mounted && total != null) setBalance(Number(total) / 1e9);
      } catch (e) {
        console.error("Failed to load balance", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [address, getBalance]);

  const [bet, setBet] = useState(1);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [dice, setDice] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);

  // 🧠 NEW STATE
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [taiCount, setTaiCount] = useState(0);
  const [xiuCount, setXiuCount] = useState(0);

  const sum = dice.reduce((a, b) => a + b, 0);

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

    console.log("DEBUG BALANCE:", balance, "BET:", bet);

    if (balance === undefined || balance === null || Number(balance) < bet) {
      showNotification({
        title: "Không đủ SUI",
        message:
          `Số dư không đủ (Ví: ${balance ?? 0} | Cược: ${bet}). Vui lòng kiểm tra lại ví.`,
        color: "red",
      });
      return;
    }

    setSpinning(true);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: (tx) => {
        const result = rollDice();
        setDice(result.dice);

        const win = result.result === choice;
        const reward = win ? bet * 2 : 0;

        // 📜 Save to transaction history (localStorage)
        saveTx({
          id: crypto.randomUUID(),
          game: "Tài Xỉu",
          amount: bet,
          status: "success",
          result: win ? "win" : "lose",
          reward,
          digest: tx?.digest,
          timestamp: Date.now(),
        });

        // 📜 Update local history (max 10) - cast result to match HistoryItem
        const historyResult = result.result as "TAI" | "XIU"; // Filter out TRIPLE if it exists
        setHistory((prev) =>
          [
            {
              sum: result.sum,
              result: historyResult,
              win,
              reward,
            },
            ...prev,
          ].slice(0, 10)
        );

        // 📊 Update statistics
        if (result.result === "TAI") setTaiCount((c) => c + 1);
        else setXiuCount((c) => c + 1);

        setTimeout(() => {
          if (win) {
            // Call claimReward contract function
            claimReward(reward, {
              onSuccess: async (result) => {
                showNotification({
                  title: "🎉 Thắng!",
                  message: `Kết quả: ${result.sum} (${result.result}) - Thắng ${reward.toFixed(2)} SUI`,
                  color: "green",
                });
                // Refresh balance after claiming reward
                setTimeout(async () => {
                  const b = await getBalance();
                  let total: any = null;
                  if (b == null) total = null;
                  else if (typeof b === "number" || typeof b === "string") total = b;
                  else if ((b as any).totalBalance != null) total = (b as any).totalBalance;
                  else if ((b as any).balance != null) total = (b as any).balance;
                  else if ((b as any).data?.balance != null) total = (b as any).data.balance;
                  if (total != null) setBalance(Number(total) / 1e9);
                }, 1000);
              },
              onError: (error) => {
                console.error("Claim reward error:", error);
              },
            });
          } else {
            showNotification({
              title: "💀 Thua",
              message: `Kết quả: ${result.sum} (${result.result})`,
              color: "red",
            });
            // Refresh balance after losing
            (async () => {
              const b = await getBalance();
              let total: any = null;
              if (b == null) total = null;
              else if (typeof b === "number" || typeof b === "string") total = b;
              else if ((b as any).totalBalance != null) total = (b as any).totalBalance;
              else if ((b as any).balance != null) total = (b as any).balance;
              else if ((b as any).data?.balance != null) total = (b as any).data.balance;
              if (total != null) setBalance(Number(total) / 1e9);
            })();
          }
          setSpinning(false);
        }, 1500);
      },
      onError: () => {
        // 📜 Save failed transaction to history
        saveTx({
          id: crypto.randomUUID(),
          game: "Tài Xỉu",
          amount: bet,
          status: "failed",
          timestamp: Date.now(),
        });
        setSpinning(false);
      },
    });
  };

  const totalGames = taiCount + xiuCount;

  return (
    <Container size="md" ta="center">
      {/* 🎰 STYLE CASINO */}
      <style>{`
        .board {
          background: radial-gradient(circle, #0b3c5d, #021b2b);
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 0 40px rgba(255, 200, 0, 0.4);
          animation: boardGlow 3s infinite;
        }

        @keyframes boardGlow {
          0% { box-shadow: 0 0 20px #ffb400; }
          50% { box-shadow: 0 0 50px #ffd700; }
          100% { box-shadow: 0 0 20px #ffb400; }
        }

        .center-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, #111, #000);
          color: white;
          font-size: 52px;
          font-weight: bold;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid gold;
          animation: blink 1.2s infinite;
        }

        @keyframes blink {
          0% { box-shadow: 0 0 10px gold; }
          50% { box-shadow: 0 0 40px gold; }
          100% { box-shadow: 0 0 10px gold; }
        }

        .side {
          width: 45%;
          padding: 20px;
          border-radius: 20px;
          background: linear-gradient(145deg, #0d4f7c, #06293f);
          animation: sideGlow 2s infinite;
        }

        @keyframes sideGlow {
          0% { box-shadow: 0 0 10px #00f; }
          50% { box-shadow: 0 0 25px #00ffff; }
          100% { box-shadow: 0 0 10px #00f; }
        }
      `}</style>

      <div className="board">
        <Title c="yellow">🎲 TÀI XỈU ON-CHAIN</Title>

        <div className="center-circle">
          {dice.length ? sum : "--"}
        </div>

        {/* TAI / XIU */}
        <Group justify="space-between" mt="xl">
          <div className="side">
            <Title order={3} c="white">TÀI</Title>
            <Text c="gray">11 – 17</Text>
            <Button
              mt="md"
              color={choice === "TAI" ? "green" : "gray"}
              onClick={() => setChoice("TAI")}
              fullWidth
            >
              ĐẶT CƯỢC
            </Button>
          </div>

          <div className="side">
            <Title order={3} c="white">XỈU</Title>
            <Text c="gray">4 – 10</Text>
            <Button
              mt="md"
              color={choice === "XIU" ? "blue" : "gray"}
              onClick={() => setChoice("XIU")}
              fullWidth
            >
              ĐẶT CƯỢC
            </Button>
          </div>
        </Group>

        <NumberInput
          mt="xl"
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
          disabled={!choice}
          onClick={onPlay}
          fullWidth
        >
          🎰 PLAY
        </Button>

        <Divider my="lg" />

        {/* 📜 HISTORY */}
        <Title order={4} c="yellow">📜 Lịch sử kết quả</Title>
        <Table striped highlightOnHover mt="sm">
          <thead>
            <tr>
              <th>Tổng</th>
              <th>Kết quả</th>
              <th>Thắng</th>
              <th>Nhận (SUI)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.sum}</td>
                <td>{h.result}</td>
                <td>{h.win ? "✔" : "✖"}</td>
                <td>{h.reward}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Divider my="lg" />

        {/* 📊 STATISTICS */}
        <Title order={4} c="yellow">📊 Thống kê xúc xắc</Title>
        <Text>
          TÀI: {taiCount} (
          {totalGames ? ((taiCount / totalGames) * 100).toFixed(1) : 0}%)
        </Text>
        <Text>
          XỈU: {xiuCount} (
          {totalGames ? ((xiuCount / totalGames) * 100).toFixed(1) : 0}%)
        </Text>

        <Text mt="md" c="green">
          ✔ On-chain Bet • History • Analytics
        </Text>

        <Divider my="lg" />

        {/* 🏦 TREASURY INFO */}
        <Text size="xs" c="dimmed">
          🏦 Treasury Address (Game Pool):
        </Text>
        <Text size="xs" truncate color="blue">
          {TREASURY_ID}
        </Text>
      </div>
    </Container>
  );
}
