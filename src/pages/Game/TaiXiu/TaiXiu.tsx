import {
  Container,
  Button,
  Group,
  Title,
  NumberInput,
  Text,
  Table,
  Divider,
  Paper,
  Stack,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { rollDice } from "./taixiu.logic";

type Choice = "TAI" | "XIU" | "TRIPLE";

type HistoryItem = {
  sum: number;
  result: Choice;
  win: boolean;
  reward: number;
};

export default function TaiXiu() {
  const { address } = useWallet();
  const { placeBet, claimReward, getBalance, getTreasuryBalance } = useSuiContract();

  const [userBal, setUserBal] = useState<number | null>(null);
  const [treasuryBal, setTreasuryBal] = useState<number | null>(null);

  const [bet, setBet] = useState(1);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [dice, setDice] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  
  // 🥣 Bowl & Reveal State
  const [isCovered, setIsCovered] = useState(false);
  const [tempResult, setTempResult] = useState<{dice: number[], sum: number, result: Choice} | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (address) {
      getBalance().then((res: any) => {
        if (res) setUserBal(Number(res.totalBalance) / 1e9);
      });
    } else {
      setUserBal(null);
    }
  }, [address]);

  useEffect(() => {
    getTreasuryBalance().then((val: any) => {
      if (val) setTreasuryBal(Number(val) / 1e9);
    });
  }, [getTreasuryBalance]);

  const jackpotValue = treasuryBal ? (treasuryBal * 0.5) : 0;

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

    if (!choice || spinning || isCovered) return;

    console.log("DEBUG BALANCE:", userBal, "BET:", bet);

    if (userBal === null || userBal < bet) {
      showNotification({
        title: "Không đủ SUI",
        message:
          `Số dư không đủ (Ví: ${userBal?.toFixed(2) ?? 0} | Cược: ${bet}). Vui lòng kiểm tra lại ví.`,
        color: "red",
      });
      return;
    }

    setSpinning(true);
    setIsCovered(true); // 🥣 Úp mâm ngay khi bấm chơi
    setDragOffset({x: 0, y: 0});

    await placeBet(bet, {
      onSuccess: () => {
        const result = rollDice();
        setDice(result.dice);
        setTempResult(result);
        setSpinning(false);
        // Chờ người chơi kéo mâm ra để revealResult()
      },
      onError: () => {
        setSpinning(false);
        setIsCovered(false);
      },
    });
  };

  const revealResult = async () => {
    if (!tempResult) return;
    setIsCovered(false);
    
    const { result, sum } = tempResult;
    
    // JACKPOT LOGIC
    const JACKPOT_CHANCE = 0.001;
    const isJackpot = Math.random() < JACKPOT_CHANCE;

    let win = result === choice;
    let reward = win ? bet * 2 : 0;

    if (isJackpot) {
      win = true;
      reward = Number(jackpotValue.toFixed(4));
    }

    // 📜 Update history
    setHistory((prev) => [{ sum, result, win, reward }, ...prev].slice(0, 10));

    // 📊 Update statistics
    if (result === "TAI") setTaiCount((c) => c + 1);
    else if (result === "XIU") setXiuCount((c) => c + 1);

    if (win) {
      try {
        await claimReward(reward, {});
        showNotification({
          title: isJackpot ? "🚨 JACKPOT!!!" : "🎉 Thắng!",
          message: isJackpot 
            ? `Bạn trúng JACKPOT: ${reward} SUI`
            : `Kết quả: ${sum} (${result}) - Nhận ${reward} SUI`,
          color: "green",
        });
        getBalance().then((res: any) => res && setUserBal(Number(res.totalBalance) / 1e9));
        getTreasuryBalance().then((val: any) => val && setTreasuryBal(Number(val) / 1e9));
      } catch (e) {
        showNotification({ title: "Lỗi nhận thưởng", message: "Vui lòng thử lại", color: "red" });
      }
    } else {
      showNotification({ title: "💀 Thua", message: `Kết quả: ${sum} (${result})`, color: "red" });
    }
    setTempResult(null);
  };

  // 🖱️ Drag Logic
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const dist = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);
    if (dist > 75) revealResult(); // Kéo xa > 75px thì mở
    else setDragOffset({ x: 0, y: 0 }); // Reset
    setDragStart(null);
    setIsDragging(false);
  };

  const totalGames = taiCount + xiuCount;
  const DICE_CHARS = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

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

        .dice-area {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .bowl {
          position: absolute;
          top: 0; left: 0;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #5e2c2c, #2a0a0a);
          border: 5px solid #d4af37;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          cursor: grab;
          touch-action: none;
        }
        
        .bowl:active { cursor: grabbing; }

        .dice-display {
          font-size: 64px;
          color: white;
          text-shadow: 0 0 10px gold;
          animation: shake 0.5s infinite;
        }

        @keyframes shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }

        .side {
          width: 45%;
          padding: 20px;
          border-radius: 20px;
          background: linear-gradient(145deg, #0d4f7c, #06293f);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          opacity: 0.7;
        }

        .side.selected {
          opacity: 1;
          border-color: #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          transform: scale(1.05);
        }
      `}</style>

      <div className="board">
        <Title c="yellow">🎲 TÀI XỈU ON-CHAIN</Title>
        
        {/* Jackpot Display */}
        <Paper p="xs" radius="md" bg="rgba(255, 215, 0, 0.1)" style={{ border: '1px solid gold', marginBottom: 10, width: 'fit-content', margin: '0 auto 10px auto' }}>
          <Stack gap={0} align="center">
            <Text size="xs" c="yellow" fw={700} tt="uppercase">🔥 Jackpot (0.1%) 🔥</Text>
            <Text size="xl" fw={900} c="yellow" style={{ textShadow: '0 0 10px orange' }}>{jackpotValue.toFixed(2)} SUI</Text>
          </Stack>
        </Paper>

        <Group justify="center" gap="xs">
          <Text c="dimmed" size="sm">Ví: {userBal !== null ? userBal.toFixed(3) : "..."} SUI</Text>
          <Text c="dimmed" size="sm">|</Text>
          <Text c="dimmed" size="sm">Treasury: {treasuryBal !== null ? treasuryBal.toFixed(2) : "..."} SUI</Text>
        </Group>

        <div className="dice-area">
          {/* 🎲 DICE */}
          <div className="dice-display" style={{ animation: spinning ? 'shake 0.2s infinite' : 'none' }}>
             {dice.length > 0 ? dice.map((d, i) => (
               <span key={i}>{DICE_CHARS[d]}</span>
             )) : "🎲🎲🎲"}
          </div>

          {/* 🥣 BOWL (MÂM) */}
          {isCovered && (
            <div 
              className="bowl"
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              style={{ 
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <Text size="xl" fw={900} c="yellow">KÉO MỞ</Text>
            </div>
          )}
        </div>

        {/* TAI / XIU */}
        <Group justify="space-between" mt="xl">
          <div className={`side ${choice === "TAI" ? "selected" : ""}`}>
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

          <div className={`side ${choice === "XIU" ? "selected" : ""}`}>
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
          loading={spinning && !isCovered}
          disabled={!choice || isCovered}
          onClick={onPlay}
          fullWidth
        >
          {isCovered ? "👇 KÉO MÂM RA 👇" : "🎰 PLAY"}
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
      </div>
    </Container>
  );
}
