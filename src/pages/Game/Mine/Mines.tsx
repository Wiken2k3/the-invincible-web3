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
  const { placeBet, claimReward, getTreasuryBalance, requestFaucet, getBalance, depositToTreasury, withdrawFromTreasury } = useSuiContract();
  const ctx = useSuiClientContext();

  const [bet, setBet] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [diamondsFound, setDiamondsFound] = useState(0);

  const [board, setBoard] = useState<Cell[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false); // Thêm state cho loading
  const [treasuryBal, setTreasuryBal] = useState<number | null>(null);
  const [treasuryError, setTreasuryError] = useState(false);
  const [userBal, setUserBal] = useState<number | null>(null);

  // Load số dư kho bạc khi mở game
  useEffect(() => {
    setTreasuryError(false);
    getTreasuryBalance().then((val) => {
      if (val) setTreasuryBal(Number(val) / 1e9); // Đổi MIST sang SUI
      else setTreasuryError(true);
    });

    // Load số dư người chơi
    if (address) {
      getBalance().then((res) => {
        if (res) setUserBal(Number(res.totalBalance) / 1e9);
      });
    }
  }, [getTreasuryBalance, getBalance, address, playing]); 

  const jackpotValue = treasuryBal ? (treasuryBal * 0.5) : 0;

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

    if (userBal !== null && userBal < bet) {
      showNotification({ title: "Không đủ SUI", message: "Số dư không đủ để đặt cược", color: "red" });
      return;
    }

    setLoading(true);
    try {
      await placeBet(bet, {
        onSuccess: () => {
          setBoard(generateBoard(difficulty));
          setOpened([]);
          setDiamondsFound(0);
          setTotalMultiplier(1);
          setPlaying(true);
        },
      });
    } catch (e: any) {
      if (e?.message?.includes("Balance of gas object")) {
        showNotification({ title: "Lỗi Gas", message: "Ví thiếu coin lớn để trả gas. Hãy Faucet thêm!", color: "orange" });
      }
    } finally {
      setLoading(false);
    }
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
    let reward = bet * totalMultiplier;

    // JACKPOT LOGIC
    const JACKPOT_CHANCE = 0.001;
    const isJackpot = Math.random() < JACKPOT_CHANCE;
    if (isJackpot) {
      reward = Number(jackpotValue.toFixed(4));
    }

    setLoading(true);

    try {
      // Check Treasury Balance first
      const tBal = await getTreasuryBalance();
      const tSui = tBal ? Number(tBal) / 1e9 : 0;
      
      if (tSui < reward) {
        showNotification({ title: "Lỗi trả thưởng", message: "Kho bạc không đủ tiền. Vui lòng liên hệ Admin.", color: "red" });
        setLoading(false);
        return;
      }

      await claimReward(reward, {
        onSuccess: () => {
          showNotification({
            title: isJackpot ? "🚨 JACKPOT!!!" : "💰 THẮNG LỚN!",
            message: isJackpot 
              ? `Bạn trúng JACKPOT: ${reward.toFixed(3)} SUI`
              : `Bạn đã nhận được ${reward.toFixed(3)} SUI (x${totalMultiplier})`,
            color: "green",
          });
          setPlaying(false);
          setOpened(board.map((_, idx) => idx)); // Reveal all
        },
      });
    } catch (e: any) {
      if (e?.message?.includes("Balance of gas object") || e?.message?.includes("GasBudgetTooHigh")) {
        showNotification({ title: "Lỗi Gas (Coin lẻ)", message: "Ví bạn có nhiều coin lẻ không đủ trả phí Gas. Hãy nhấn 'Faucet SUI' để lấy coin mới!", color: "orange", autoClose: 5000 });
      } else {
        showNotification({ title: "Lỗi nhận thưởng", message: e?.message || "Vui lòng thử lại", color: "red" });
      }
    } finally {
      setLoading(false);
    }
  };

  /* 💧 Handle Faucet & Refresh Balance */
  const handleFaucet = async () => {
    await requestFaucet();
    // Đợi 3s để blockchain xử lý rồi cập nhật lại số dư hiển thị
    setTimeout(() => {
      if (address) {
        getBalance().then(res => {
          if (res) setUserBal(Number(res.totalBalance) / 1e9);
        });
      }
    }, 3000);
  };

  /* 🏦 Deposit to Treasury (Admin/Test) */
  const handleDeposit = async () => {
    // Nạp 2 SUI vào kho bạc
    setLoading(true);
    await depositToTreasury(2, {
      onSuccess: () => getTreasuryBalance().then(val => val && setTreasuryBal(Number(val) / 1e9)),
      onFinally: () => setLoading(false)
    });
  };

  /* 💸 Withdraw All from Treasury */
  const handleWithdraw = async () => {
    const RECIPIENT = "0x12ac2224aa13e8f4fe5bab752a808dc52de2983f4684711a4424c118007a7b5a";
    setLoading(true);
    await withdrawFromTreasury(RECIPIENT, {
      onSuccess: () => getTreasuryBalance().then(val => val && setTreasuryBal(Number(val) / 1e9)),
      onFinally: () => setLoading(false)
    });
  };

  return (
    <Card radius="lg" p="xl" style={{ maxWidth: 600 }} mx="auto">
      <Title order={3}>💣 Mines – SUI (Testnet)</Title>
      
      {/* Jackpot Display */}
      <Card p="xs" radius="md" bg="rgba(255, 215, 0, 0.1)" style={{ border: '1px solid gold', marginBottom: 10 }}>
        <Stack gap={0} align="center">
          <Text size="xs" c="yellow" fw={700} tt="uppercase">🔥 Jackpot (0.1%) 🔥</Text>
          <Text size="xl" fw={900} c="yellow" style={{ textShadow: '0 0 10px orange' }}>{jackpotValue.toFixed(2)} SUI</Text>
        </Stack>
      </Card>

      {/* Thông tin debug mạng và ví */}
      <Text size="xs" c="dimmed" mt={5}>
        Network: <Text span c={ctx.network === 'testnet' ? 'green' : 'red'}>{ctx.network}</Text> | 
        Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} | 
        Balance: <Text span c="yellow" fw={700}>{userBal !== null ? userBal.toFixed(3) : '...'} SUI</Text>
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
