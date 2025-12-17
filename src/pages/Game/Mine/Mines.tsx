import {
  Box,
  Button,
  Card,
  Group,
  Grid,
  NumberInput,
  Text,
  Title,
  SegmentedControl,
  Stack,
  Flex,
  ThemeIcon,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { useSuiClientContext } from "@mysten/dapp-kit";
import { TREASURY_ID } from "../../../config/web3";

/* ================= CONFIG ================= */

const GRID_SIZE = 64;

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { mines: number; empty: number; gems: number; min: number; max: number }
> = {
  easy: { mines: 24, empty: 30, gems: 10, min: 1.1, max: 2.0 },
  medium: { mines: 30, empty: 24, gems: 10, min: 1.5, max: 4.0 },
  hard: { mines: 42, empty: 12, gems: 10, min: 2.5, max: 10.0 },
};

type Cell =
  | { type: "mine" }
  | { type: "gem"; multiplier: number }
  | { type: "empty" };

/* ================= HELPERS ================= */

function generateBoard(difficulty: Difficulty): Cell[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const board: Cell[] = [];

  for (let i = 0; i < config.mines; i++) board.push({ type: "mine" });
  for (let i = 0; i < config.empty; i++) board.push({ type: "empty" });
  for (let i = 0; i < config.gems; i++) {
    const mult = Math.random() * (config.max - config.min) + config.min;
    board.push({ type: "gem", multiplier: Number(mult.toFixed(2)) });
  }

  // Shuffle
  return board.sort(() => Math.random() - 0.5);
}

/* ================= COMPONENT ================= */

export default function Mines() {
  const { address } = useWallet();
  const { transferSui, getBalance, claimReward, depositToTreasury } = useSuiContract();
  const ctx = useSuiClientContext();

  const [bet, setBet] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [diamondsFound, setDiamondsFound] = useState(0);

  const [board, setBoard] = useState<Cell[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [treasuryBal, setTreasuryBal] = useState<number | null>(null);
  const [treasuryError, setTreasuryError] = useState(false);
  const [userBal, setUserBal] = useState<number | null>(null);

  // Load user balance (similar to SlotMachine pattern)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!address) {
        setUserBal(null);
        return;
      }
      try {
        const res = await getBalance();
        // eslint-disable-next-line no-console
        console.log("Mines.getBalance ->", res);
        let total: any = null;
        if (res == null) total = null;
        else if (typeof res === "number" || typeof res === "string") total = res;
        else if ((res as any).totalBalance != null) total = (res as any).totalBalance;
        else if ((res as any).balance != null) total = (res as any).balance;
        else if ((res as any).data?.balance != null) total = (res as any).data.balance;
        if (mounted && total != null) setUserBal(Number(total) / 1e9);
      } catch (e) {
        console.error("Failed to load balance", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [address, getBalance]);

  // Load treasury balance
  useEffect(() => {
    (async () => {
      try {
        setTreasuryError(false);
        // TODO: Implement getTreasuryBalance when contract functions are ready
        setTreasuryBal(null);
      } catch (e) {
        console.error("Failed to load treasury", e);
        setTreasuryError(true);
      }
    })();
  }, []); 

  useEffect(() => {
    if (playing && diamondsFound === 10) {
      // Tự động cash out khi tìm thấy hết kim cương
      cashOut();
    }
  }, [opened, playing]); // Bỏ bớt dependency không cần thiết

  /* ▶️ Start Game */
  const startGame = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    // Simulate game start with transfer (real implementation would use placeBet contract call)
    setBoard(generateBoard(difficulty));
    setOpened([]);
    setDiamondsFound(0);
    setTotalMultiplier(1);
    setPlaying(true);
  };

  /* 🧠 Click Cell */
  const clickCell = (i: number) => {
    if (!playing || opened.includes(i)) return;

    const cell = board[i];

    if (cell.type === "mine") {
      showNotification({
        title: "💥 BOOM!",
        message: "Bạn đã trúng mìn và mất toàn bộ SUI!",
        color: "red",
      });
      setPlaying(false);
      return;
    }

    setOpened((prev) => [...prev, i]);

    if (cell.type === "gem") {
      setDiamondsFound((prev) => prev + 1);
      setTotalMultiplier((prev) =>
        Number((prev * cell.multiplier).toFixed(4))
      );
    }
  };

  /* 💰 Cash Out */
  const cashOut = async () => {
    if (loading) return;
    setLoading(true);
    const reward = bet * totalMultiplier;
    
    try {
      // Call claimReward contract function
      await claimReward(reward, {
        onSuccess: async (result) => {
          showNotification({
            title: "💰 THẮNG LỚN!",
            message: `Nhận ${reward.toFixed(3)} SUI (x${totalMultiplier})`,
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
            if (total != null) setUserBal(Number(total) / 1e9);
          }, 1000);
          
          setPlaying(false);
          setLoading(false);
        },
        onError: (error) => {
          console.error("Claim reward error:", error);
          setPlaying(false);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Cash out error:", error);
      setPlaying(false);
      setLoading(false);
    }
  };

  /* 💧 Handle Faucet & Refresh Balance */
  const handleFaucet = async () => {
    showNotification({
      title: "Faucet",
      message: "Use Slush Wallet's Faucet feature to get testnet SUI",
      color: "info",
    });
  };

  /* 🏦 Deposit to Treasury (Admin/Test) */
  const handleDeposit = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      await depositToTreasury(10, {
        onSuccess: async (result) => {
          showNotification({
            title: "✅ Nạp thành công",
            message: `Đã gửi 10 SUI tới Treasury`,
            color: "green",
          });
          setLoading(false);
        },
        onError: (error) => {
          console.error("Deposit error:", error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Deposit error:", error);
      setLoading(false);
    }
  };

  /* 💸 Withdraw All from Treasury */
  const handleWithdraw = async () => {
    showNotification({
      title: "Withdraw",
      message: "Contract withdraw function not yet implemented",
      color: "yellow",
    });
  };

  return (
    <Card radius="lg" p="xl" style={{ maxWidth: 600 }} mx="auto">
      <Title order={3}>💣 Mines – SUI (Testnet)</Title>
      
      {/* Thông tin debug mạng và ví */}
      <Text size="xs" c="dimmed" mt={5}>
        Network: <Text span c={ctx.network === 'testnet' ? 'green' : 'red'}>{ctx.network}</Text> | 
        Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
        Balance: <Text span c="yellow" fw={700}>{userBal !== null ? userBal.toFixed(3) : '...'} SUI</Text>
      </Text>

      {/* Treasury Address */}
      <Text size="xs" c="dimmed" mt={5}>
        🏦 Treasury: <Text span color="blue" size="xs" truncate>{TREASURY_ID}</Text>
      </Text>

      {/* Hiển thị số dư kho bạc để Admin kiểm tra */}
      <Group justify="space-between" mb="md">
        <Text size="xs" c="dimmed">
          Treasury: {treasuryBal !== null 
            ? `${treasuryBal.toFixed(2)} SUI` 
            : treasuryError 
              ? "Error" 
              : "Loading..."}
        </Text>
        
        <Group gap={5}>
          <Button variant="subtle" size="xs" onClick={handleWithdraw} color="red">
            💸 Withdraw All
          </Button>
          <Button variant="subtle" size="xs" onClick={handleDeposit} color="orange">
            🏦 Fund Treasury
          </Button>
          <Button variant="subtle" size="xs" onClick={handleFaucet}>
            💧 Faucet SUI
          </Button>
        </Group>
      </Group>

      {!playing && (
        <>
          <NumberInput
            label="Bet (SUI)"
            value={bet}
            onChange={(v) => setBet(Number(v))}
            min={0.1}
            step={0.1}
          />

          <Text mt="sm" size="sm" fw={500}>Difficulty</Text>
          <SegmentedControl
            fullWidth
            value={difficulty}
            onChange={(v) => setDifficulty(v as Difficulty)}
            data={[
              { label: "Easy", value: "easy" },
              { label: "Medium", value: "medium" },
              { label: "Hard", value: "hard" },
            ]}
            mt="sm"
          />

          <Button fullWidth mt="md" onClick={startGame} loading={loading}>
            Start Game
          </Button>
        </>
      )}

      {playing && (
        <>
          <Flex mt="md" gap="md">
            <Box style={{ flex: 1 }}>
              <Grid gutter={5}>
                {Array.from({ length: GRID_SIZE }).map((_, i) => (
                  <Grid.Col span={1.5} key={i}>
                    <Button
                      fullWidth
                      h={42}
                      p={0}
                      variant={opened.includes(i) ? "filled" : "outline"}
                      color={
                        opened.includes(i)
                          ? board[i].type === "gem"
                            ? "green"
                            : board[i].type === "mine"
                            ? "red"
                            : "gray"
                          : "gray"
                      }
                      onClick={() => clickCell(i)}
                    >
                      {opened.includes(i)
                        ? board[i].type === "gem"
                          ? "💎"
                          : board[i].type === "mine"
                          ? "�"
                          : ""
                        : "?"}
                    </Button>
                  </Grid.Col>
                ))}
              </Grid>
            </Box>

            {/* Progress Bar 10 steps */}
            <Stack gap={2} align="center" justify="center" w={40}>
              {Array.from({ length: 10 }).map((_, idx) => {
                const step = 10 - idx; // 10 at top, 1 at bottom
                const active = diamondsFound >= step;
                return (
                  <ThemeIcon
                    key={step}
                    variant={active ? "filled" : "light"}
                    color={active ? "green" : "gray"}
                    size="sm"
                    radius="xl"
                  >
                    <Text size="xs">{step}</Text>
                  </ThemeIcon>
                );
              })}
              <Text size="xs" mt={5}>Gems</Text>
            </Stack>
          </Flex>

          <Text mt="sm">Total Multiplier: x{totalMultiplier}</Text>

          <Button fullWidth mt="md" color="yellow" onClick={cashOut} loading={loading}>
            Cash Out
          </Button>
        </>
      )}
    </Card>
  );
}
