import { Container, Button, Group, Title, NumberInput, Paper, Stack, Text, SegmentedControl, Table } from "@mantine/core";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import Reel from "./Reel";
import { spinReels } from "./slot.logic";
import { SYMBOLS } from "./symbols";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { useSuiClientContext } from "@mysten/dapp-kit";

export default function SlotMachine() {
  const { address } = useWallet();
  const { placeBet, claimReward, getBalance, requestFaucet, getTreasuryBalance, isPending } = useSuiContract();
  const ctx = useSuiClientContext();

  const [userBal, setUserBal] = useState<number | null>(null);
  const [treasuryBal, setTreasuryBal] = useState<number | null>(null);

  const [bet, setBet] = useState(1);
  const [reelsData, setReelsData] = useState<any[] | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [columns, setColumns] = useState<3 | 5>(3);

  const jackpotValue = treasuryBal ? (treasuryBal * 0.5) : 0;

  const onSpin = async () => {
    if (!address) {
      showNotification({ title: "Lỗi", message: "Vui lòng kết nối ví", color: "red" });
      return;
    }

    // Reset UI
    setReelsData(null);

    try {
      // Wait for on-chain bet to succeed
      await placeBet(bet, {
        onError: (err: Error) => showNotification({ title: 'Lỗi đặt cược', message: err.message, color: 'red' }),
      });

      // Payment done — start spinning animation
      setSpinning(true);

      // Determine result locally (server/contract should verify in production)
      const result = spinReels(columns);

      // JACKPOT LOGIC (0.1% chance)
      const JACKPOT_CHANCE = 0.001;
      const isJackpot = Math.random() < JACKPOT_CHANCE;

      // Small initial delay so user sees spinning
      setTimeout(() => {
        setReelsData(result.reels);
        setSpinning(false);

        // After reels stop, show notification and if win, claim reward
        setTimeout(async () => {
            let reward = 0;
            let isWin = false;

            if (isJackpot) {
              reward = Number(jackpotValue.toFixed(4));
              isWin = true;
            } else if (result.win) {
              reward = Number((bet * result.multiplier).toFixed(9));
              isWin = true;
            }

            if (isWin) {
            try {
              // Check treasury has enough balance before claiming
              const treasuryBal = await getTreasuryBalance();
              const treasurySui = treasuryBal ? Number(treasuryBal) / 1e9 : 0;
              if (treasuryBal === null || BigInt(Math.floor((treasurySui) * 1e9)) < BigInt(Math.floor(reward * 1e9))) {
                showNotification({ title: "Lỗi trả thưởng", message: "Treasury không đủ tiền để trả thưởng. Vui lòng thử lại sau hoặc liên hệ admin.", color: "red" });
              } else {
                await claimReward(reward, {});
              showNotification({
                title: isJackpot ? "🚨 JACKPOT!!!" : "🎊 CHIẾN THẮNG!",
                message: `Bạn nhận được ${reward.toFixed(3)} SUI ${isJackpot ? "(50% Treasury)" : `(x${result.multiplier})`}`,
                color: "green",
              });
              // Refresh balance after reward
              if (address) {
                getBalance().then((res) => {
                  if (res) setUserBal(Number(res.totalBalance) / 1e9);
                });
              }
              getTreasuryBalance().then((res) => res && setTreasuryBal(Number(res) / 1e9));
              }
            } catch (err: any) {
              showNotification({ title: "Lỗi trả thưởng", message: err?.message || String(err), color: "red" });
            }
          } else {
            showNotification({ title: "Thua", message: "Chúc may mắn lần sau!", color: "gray" });
          }
        }, 2500);
      }, 500);
    } catch (err: any) {
      // placeBet rejected
      showNotification({ title: 'Đặt cược thất bại', message: err?.message || String(err), color: 'red' });
      setSpinning(false);
    }
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
    getTreasuryBalance().then((res) => res && setTreasuryBal(Number(res) / 1e9));
  }, [address, isPending, getTreasuryBalance]);

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

          {/* Jackpot Display */}
          <Paper p="xs" radius="md" bg="rgba(255, 215, 0, 0.1)" style={{ border: '1px solid gold' }}>
            <Stack gap={0} align="center">
              <Text size="xs" c="yellow" fw={700} tt="uppercase">🔥 Jackpot (0.1%) 🔥</Text>
              <Text size="xl" fw={900} c="yellow" style={{ textShadow: '0 0 10px orange' }}>{jackpotValue.toFixed(2)} SUI</Text>
            </Stack>
          </Paper>

          <Group gap="xs" justify="center">
            {Array.from({ length: columns }).map((_, i) => (
              <Reel
                key={i}
                spinning={spinning}
                finalSymbol={reelsData ? reelsData[i] : null}
                delay={i * 0.25}
                size={columns === 3 ? 90 : 64}
              />
            ))}
          </Group>

          <Group justify="space-between" w="100%">
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
          <Group w="100%" justify="flex-end">
            <Button size="xs" variant="subtle" onClick={handleFaucet}>💧 Faucet</Button>
          </Group>

          <NumberInput
            label="Mức cược (SUI)"
            min={0.1}
            value={bet}
            onChange={(v) => setBet(Number(v))}
            w="100%"
          />

          <SegmentedControl
            value={String(columns)}
            onChange={(v) => setColumns(v === '5' ? 5 : 3)}
            data={[{ label: '3 Cột', value: '3' }, { label: '5 Cột', value: '5' }]}
            fullWidth
          />

          {/* Payout table */}
          <Table highlightOnHover withColumnBorders striped>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Symbol</th>
                {columns === 3 ? <th>2-match (x)</th> : <th>3-match (x)</th>}
                {columns === 3 ? <th>3-match (x)</th> : <><th>4-match (x)</th><th>5-match (x)</th></>}
              </tr>
            </thead>
            <tbody>
              {/** Populate rows by mapping SYMBOLS */}
              {SYMBOLS.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 20 }}>{s.icon}</td>
                  <td>{s.id}</td>
                  {columns === 3 ? <td>{(s.multiplier * 0.5).toFixed(2)}</td> : <td>{(s.multiplier * 0.5).toFixed(2)}</td>}
                  {columns === 3 ? <td>{(s.multiplier).toFixed(2)}</td> : <><td>{(s.multiplier * 1.5).toFixed(2)}</td><td>{(s.multiplier * 3).toFixed(2)}</td></>}
                </tr>
              ))}
            </tbody>
          </Table>

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