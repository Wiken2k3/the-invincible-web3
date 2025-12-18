import {
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Text,
  Title,
  SegmentedControl,
  Stack,
  Flex,
  ThemeIcon,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { IconRefresh, IconDiamond, IconBomb } from "@tabler/icons-react";

/* ================= CONFIG ================= */

const GRID_SIZE = 64;

type Difficulty = "easy" | "medium" | "hard";
type GameState = "setup" | "playing" | "gameover" | "win";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { mines: number; empty: number; gems: number; min: number; max: number }
> = {
  easy: { mines: 12, empty: 42, gems: 10, min: 1.1, max: 2.0 },
  medium: { mines: 30, empty: 24, gems: 10, min: 1.5, max: 4.0 },
  hard: { mines: 42, empty: 12, gems: 10, min: 2.5, max: 8.0 },
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
  const { placeBet, claimReward, getTreasuryBalance, requestFaucet, getBalance } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [diamondsFound, setDiamondsFound] = useState(0);

  const [board, setBoard] = useState<Cell[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [gameState, setGameState] = useState<GameState>("setup");
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
  }, [getTreasuryBalance, getBalance, address, gameState]);

  const jackpotValue = treasuryBal ? (treasuryBal * 0.5) : 0;

  useEffect(() => {
    if (gameState === "playing" && diamondsFound === 10) {
      // Tự động cash out khi tìm thấy hết kim cương
      cashOut();
    }
  }, [opened, gameState, diamondsFound]);

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

    setLoading(true);
    await placeBet(bet, {
      onSuccess: () => {
        setBoard(generateBoard(difficulty));
        setOpened([]);
        setDiamondsFound(0);
        setTotalMultiplier(1);
        setGameState("playing");
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  /* 🧠 Click Cell */
  const clickCell = (i: number) => {
    if (gameState !== "playing" || opened.includes(i)) return;

    const cell = board[i];

    if (cell.type === "mine") {
      showNotification({
        title: "💥 BOOM!",
        message: "Bạn đã trúng mìn và mất toàn bộ SUI!",
        color: "red",
      });
      setOpened((prev) => [...prev, i]);
      setGameState("gameover");
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

    // Giả sử hàm claimReward sẽ gọi smart contract để trả thưởng
    await claimReward(reward, {
      onSuccess: () => {
        showNotification({
          title: "💰 THẮNG LỚN!",
          message: `Bạn đã nhận được ${reward.toFixed(3)} SUI (x${totalMultiplier})`,
          color: "green",
        });
        setGameState("win");
      },
      onFinally: () => setLoading(false),
    });
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

  const resetGame = () => {
    setGameState("setup");
    setDiamondsFound(0);
    setTotalMultiplier(1);
    setOpened([]);
  };

  return (
    <Card radius="lg" p="xl" style={{ maxWidth: 600 }} mx="auto">
      <Group justify="space-between" mb="lg">
        <Title order={3}>💣 Mines</Title>
        <Badge 
          size="lg" 
          variant="gradient" 
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          {userBal !== null ? `${userBal.toFixed(2)} SUI` : '...'}
        </Badge>
      </Group>
      
      {/* Treasury Info & Faucet */}
      <Group justify="space-between" mb="md">
        <Text size="xs" c="dimmed">
          🏦 Treasury: {treasuryBal !== null 
            ? `${treasuryBal.toFixed(2)} SUI` 
            : treasuryError 
              ? "Error" 
              : "Loading..."}
        </Text>
        
        <Button variant="subtle" size="xs" onClick={handleFaucet} leftSection={<IconRefresh size={14} />}>
          Faucet SUI
        </Button>
      </Group>

      {gameState === "setup" && (
        <>
          <NumberInput
            label="Bet (SUI)"
            value={bet}
            onChange={(v) => setBet(Number(v))}
            min={0.1}
            step={0.1}
            size="md"
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
            size="md"
          />

          <Button fullWidth mt="xl" size="lg" onClick={startGame} loading={loading}>
            Start Game
          </Button>
        </>
      )}

      {gameState !== "setup" && (
        <>
          <Flex mt="md" gap="md">
            <Box style={{ flex: 1 }}>
              <SimpleGrid cols={8} spacing={5}>
                {Array.from({ length: GRID_SIZE }).map((_, i) => {
                  const isOpened = opened.includes(i);
                  const isMine = board[i]?.type === "mine";
                  const isGem = board[i]?.type === "gem";
                  const isRevealed = (gameState === "gameover" || gameState === "win") && isMine;

                  return (
                    <Button
                      key={i}
                      fullWidth
                      h={45}
                      p={0}
                      variant={isOpened || isRevealed ? "filled" : "default"}
                      color={
                        isOpened
                          ? isMine ? "red" : "gray"
                          : isRevealed ? "red.3" : "gray"
                      }
                      onClick={() => clickCell(i)}
                      disabled={gameState !== "playing" && !isOpened}
                      styles={{
                        root: {
                          backgroundColor: isOpened && !isMine ? "black" : undefined,
                          borderColor: isOpened && !isMine ? "black" : undefined,
                          transition: "all 0.2s",
                        }
                      }}
                    >
                      {isOpened ? (
                        isGem ? <IconDiamond size={20} color="cyan" /> : isMine ? <IconBomb size={20} /> : ""
                      ) : isRevealed ? (
                        <IconBomb size={16} />
                      ) : (
                        ""
                      )}
                    </Button>
                  );
                })}
              </SimpleGrid>
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
                    size="xs"
                    radius="xl"
                  >
                    <Text style={{ fontSize: 8 }}>{step}</Text>
                  </ThemeIcon>
                );
              })}
              <Text size="xs" mt={5}>Gems</Text>
            </Stack>
          </Flex>

          <Group justify="space-between" mt="md">
            <Text fw={700} size="lg">x{totalMultiplier}</Text>
            <Text c="dimmed" size="sm">Potential Win: {(bet * totalMultiplier).toFixed(3)} SUI</Text>
          </Group>

          {gameState === "playing" ? (
            <Button fullWidth mt="md" size="md" color="green" onClick={cashOut} loading={loading} disabled={diamondsFound === 0}>
              Cash Out
            </Button>
          ) : (
            <Button fullWidth mt="md" size="md" variant="outline" onClick={resetGame}>
              Play Again
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
