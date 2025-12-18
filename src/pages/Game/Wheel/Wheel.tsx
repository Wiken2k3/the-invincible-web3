import { useState, useEffect } from "react";
import {
  Container,
  Button,
  NumberInput,
  Title,
  Group,
  Text,
  Paper,
  Stack,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { motion, useAnimation } from "framer-motion";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { useSuiClientContext } from "@mysten/dapp-kit";

// 🎡 Cấu hình các ô trên vòng quay
const SEGMENTS = [
  { label: "x0.0", multiplier: 0, color: "#ef4444", text: "white" }, // 0
  { label: "x2.0", multiplier: 2.0, color: "#3b82f6", text: "white" }, // 1
  { label: "x0.0", multiplier: 0, color: "#ef4444", text: "white" }, // 2
  { label: "x1.5", multiplier: 1.5, color: "#22c55e", text: "white" }, // 3
  { label: "x5.0", multiplier: 5.0, color: "#a855f7", text: "white" }, // 5
  { label: "JACKPOT", multiplier: -1, color: "#FFD700", text: "black" }, // 4
  { label: "x0.0", multiplier: 0, color: "#ef4444", text: "white" }, // 6
  { label: "x1.2", multiplier: 1.2, color: "#eab308", text: "white" }, // 7
];

const WHEEL_SIZE = 320;

export default function Wheel() {
  const { address } = useWallet();
  const { placeBet, claimReward, getBalance, getTreasuryBalance, requestFaucet } = useSuiContract();
  const ctx = useSuiClientContext();
  const controls = useAnimation();

  const [userBal, setUserBal] = useState<number | null>(null);
  const [treasuryBal, setTreasuryBal] = useState<number | null>(null);
  const [bet, setBet] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const jackpotValue = treasuryBal ? (treasuryBal * 0.5) : 0;

  // Load balances
  useEffect(() => {
    if (address) {
      getBalance().then((res) => res && setUserBal(Number(res.totalBalance) / 1e9));
    } else {
      setUserBal(null);
    }
    getTreasuryBalance().then((res) => res && setTreasuryBal(Number(res) / 1e9));
  }, [address, getBalance, getTreasuryBalance, spinning]);

  const handleFaucet = async () => {
    await requestFaucet();
    setTimeout(() => {
      if (address) getBalance().then((res) => res && setUserBal(Number(res.totalBalance) / 1e9));
    }, 3000);
  };

  const onSpin = async () => {
    if (!address) {
      showNotification({ title: "Lỗi", message: "Vui lòng kết nối ví", color: "red" });
      return;
    }

    if (userBal !== null && userBal < bet) {
      showNotification({ title: "Không đủ SUI", message: "Số dư không đủ để cược", color: "red" });
      return;
    }

    setSpinning(true);

    try {
      // 1. Place Bet On-chain
      await placeBet(bet, {
        onError: (err: any) => { throw err; }
      });

      // 2. Determine Result (Client-side logic for demo)
      const JACKPOT_CHANCE = 0.001; // 0.1%
      const isJackpot = Math.random() < JACKPOT_CHANCE;
      
      let randomIndex;
      if (isJackpot) {
        randomIndex = SEGMENTS.findIndex(s => s.label === "JACKPOT");
      } else {
        const availableIndices = SEGMENTS.map((_, i) => i).filter(i => SEGMENTS[i].label !== "JACKPOT");
        randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      }
      
      const segment = SEGMENTS[randomIndex];
      
      // Calculate rotation
      const segmentAngle = 360 / SEGMENTS.length;
      const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
      const targetAngle = 360 * 5 + (360 - (randomIndex * segmentAngle)) + randomOffset; 
      const newRotation = rotation + targetAngle;

      // 3. Animate
      await controls.start({
        rotate: newRotation,
        transition: { duration: 4, ease: [0.2, 0.8, 0.2, 1] }
      });
      
      setRotation(newRotation);

      // 4. Handle Result
      let reward = 0;
      let isWin = false;

      if (segment.label === "JACKPOT") {
        reward = Number(jackpotValue.toFixed(4));
        isWin = true;
      } else if (segment.multiplier > 0) {
        reward = Number((bet * segment.multiplier).toFixed(9));
        isWin = true;
      }

      if (isWin) {
        
        if (treasuryBal !== null && treasuryBal < reward) {
           showNotification({ title: "Lỗi trả thưởng", message: "Kho bạc không đủ tiền. Liên hệ Admin.", color: "red" });
        } else {
           try {
             await claimReward(reward, {});
             showNotification({
               title: segment.label === "JACKPOT" ? "🚨 JACKPOT!!!" : "🎉 CHIẾN THẮNG!",
               message: `Bạn nhận được ${reward.toFixed(2)} SUI ${segment.label === "JACKPOT" ? "(50% Treasury)" : `(x${segment.multiplier})`}`,
               color: "green",
             });
             getBalance().then((res) => res && setUserBal(Number(res.totalBalance) / 1e9));
             getTreasuryBalance().then((res) => res && setTreasuryBal(Number(res) / 1e9));
           } catch (e) {
             showNotification({ title: "Lỗi nhận thưởng", message: "Vui lòng thử lại", color: "red" });
           }
        }
      } else {
        showNotification({ title: "Chúc may mắn lần sau", message: "Bạn quay vào ô x0.0", color: "gray" });
      }

    } catch (e: any) {
      if (e?.message?.includes("Balance of gas object")) {
        showNotification({ title: "Lỗi Gas", message: "Ví thiếu coin lớn để trả gas. Hãy Faucet thêm!", color: "orange" });
      } else {
        showNotification({ title: "Lỗi", message: e.message || "Có lỗi xảy ra", color: "red" });
      }
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Container size="sm" py={40}>
      <Paper p="xl" radius="lg" withBorder style={{ background: '#1A1B1E', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
        <Stack align="center" gap="lg">
          <Title order={2} c="yellow" style={{ textShadow: '0 0 10px gold' }}>🎡 VÒNG QUAY MAY MẮN</Title>

          {/* Jackpot Display */}
          <Paper p="xs" radius="md" bg="rgba(255, 215, 0, 0.1)" style={{ border: '1px solid gold' }}>
            <Stack gap={0} align="center">
              <Text size="xs" c="yellow" fw={700} tt="uppercase">🔥 Jackpot (0.1%) 🔥</Text>
              <Text size="xl" fw={900} c="yellow" style={{ textShadow: '0 0 10px orange' }}>{jackpotValue.toFixed(2)} SUI</Text>
            </Stack>
          </Paper>

          {/* Info Bar */}
          <Group justify="space-between" w="100%">
             <Text size="xs" c="dimmed">Ví: {userBal !== null ? userBal.toFixed(3) : '...'} SUI</Text>
             <Text size="xs" c="dimmed">Kho: {treasuryBal !== null ? treasuryBal.toFixed(2) : '...'} SUI</Text>
          </Group>
          <Group w="100%" justify="flex-end">
             <Button size="xs" variant="subtle" onClick={handleFaucet}>💧 Faucet</Button>
          </Group>

          {/* Wheel Container */}
          <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE, margin: '20px auto' }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute',
              top: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              width: 0, height: 0, 
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderTop: '25px solid #fbbf24',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            }} />

            {/* The Wheel */}
            <motion.div
              animate={controls}
              initial={{ rotate: 0 }}
              style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                border: '8px solid #334155',
                position: 'relative',
                overflow: 'hidden',
                background: `conic-gradient(${SEGMENTS.map((s, i) => `${s.color} ${i * (100/SEGMENTS.length)}% ${(i+1) * (100/SEGMENTS.length)}%`).join(', ')})`,
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}
            >
              {SEGMENTS.map((s, i) => {
                const angle = (360 / SEGMENTS.length) * i + (360 / SEGMENTS.length) / 2;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${WHEEL_SIZE/2 - 40}px)`,
                      color: s.text, fontWeight: 'bold', fontSize: '14px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)', textAlign: 'center'
                    }}
                  >
                    {s.label}
                  </div>
                );
              })}
            </motion.div>

            {/* Center Cap */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 50, height: 50,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fbbf24, #d97706)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid #fff'
            }}>
               <Text size="xs" fw={900} c="white">SPIN</Text>
            </div>
          </div>

          <NumberInput
            label="Mức cược (SUI)"
            value={bet}
            onChange={(v) => setBet(Number(v))}
            min={0.1}
            step={0.1}
            w="100%"
          />

          <Button
            fullWidth
            size="xl"
            onClick={onSpin}
            loading={spinning}
            disabled={spinning}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
          >
            QUAY NGAY
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
