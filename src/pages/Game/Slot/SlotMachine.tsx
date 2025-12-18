import { Container, Button, Group, Title, NumberInput, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import Reel from "./Reel";
import { spinReels } from "./slot.logic";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { useSuiClientContext } from "@mysten/dapp-kit";

export default function SlotMachine() {
  const { address } = useWallet();
  const { placeBet, claimReward, getBalance, requestFaucet, isPending } = useSuiContract();
  const ctx = useSuiClientContext();

  const [userBal, setUserBal] = useState<number | null>(null);

  const [bet, setBet] = useState(1);
  const [reelsData, setReelsData] = useState<any[] | null>(null);
  const [spinning, setSpinning] = useState(false);

  const onSpin = async () => {
    if (!address) {
      showNotification({ title: "Lỗi", message: "Vui lòng kết nối ví", color: "red" });
      return;
    }

    // Reset UI and start spinning animation while tx is pending
    setSpinning(true);
    setReelsData(null);

    // Place bet on-chain first (locks player's bet in Treasury)
    await placeBet(bet, {
      onSuccess: () => {
        // Determine result locally (server/contract should verify in production)
        const result = spinReels();

        // Small initial delay so user sees spinning
        setTimeout(() => {
          setReelsData(result.reels);
          setSpinning(false);

          // After reels stop, show notification and if win, claim reward
          setTimeout(async () => {
            if (result.isWin) {
              const reward = Number((bet * result.payout).toFixed(9));
              // Call contract to pay out reward back to player
              await claimReward(reward, {
                onSuccess: () => {
                  showNotification({
                    title: "🎊 CHIẾN THẮNG!",
                    message: `Bạn nhận được ${ (bet * result.payout).toFixed(3) } SUI`,
                    color: "green",
                  });
                  // Refresh balance after reward
                  if (address) {
                    getBalance().then((res) => {
                      if (res) setUserBal(Number(res.totalBalance) / 1e9);
                    });
                  }
                },
                onError: (err: Error) => {
                  showNotification({ title: "Lỗi trả thưởng", message: err.message, color: "red" });
                },
              });
            } else {
              showNotification({ title: "Thua", message: "Chúc may mắn lần sau!", color: "gray" });
            }
          }, 2500);
        }, 500);
      },
      onError: () => {
        setSpinning(false);
      },
    });
  };

  // Load user balance and refresh after pending txs settle
  useEffect(() => {
    if (address) {
      getBalance().then((res) => {
        if (res) setUserBal(Number(res.totalBalance) / 1e9);
      });
    } else {
      setUserBal(null);
    }
  }, [address, isPending]);

  const handleFaucet = async () => {
    await requestFaucet();
    setTimeout(() => {
      if (address) {
        getBalance().then((res) => {
          if (res) setUserBal(Number(res.totalBalance) / 1e9);
        });
      }
    }, 3000);
  };

  return (
    <Container size="xs" py={40}>
      <Paper p="xl" radius="lg" withBorder style={{ background: '#1A1B1E', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
        <Stack align="center" gap="xl">
          <Title order={2} c="yellow" style={{ textShadow: '0 0 10px gold' }}>🎰 SUI SLOTS</Title>

          <Group gap="xs" justify="center">
            {[0, 1, 2].map((i) => (
              <Reel 
                key={i} 
                spinning={spinning} 
                finalSymbol={reelsData ? reelsData[i] : null} 
                delay={i * 0.4} // Hiệu ứng cột 1 dừng trước, cột 3 dừng sau
              />
            ))}
          </Group>

          <Group position="apart" w="100%">
            <Text size="xs" c="dimmed">
              Network: <Text span c={ctx.network === 'testnet' ? 'green' : 'red'}>{ctx.network}</Text>
            </Text>
            <Text size="xs" c="dimmed">
              Wallet: {address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Not connected'}
            </Text>
            <Text size="xs" c="yellow">
              {userBal !== null ? `${userBal.toFixed(3)} SUI` : '...'}
            </Text>
          </Group>
          <Group w="100%" position="right">
            <Button size="xs" variant="subtle" onClick={handleFaucet}>💧 Faucet</Button>
          </Group>

          <NumberInput
            label="Mức cược (SUI)"
            min={0.1}
            value={bet}
            onChange={(v) => setBet(Number(v))}
            w="100%"
          />

          <Button
            fullWidth
            size="xl"
            onClick={onSpin}
            loading={spinning || isPending}
            disabled={spinning || isPending}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange' }}
          >
            QUAY NGAY
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}