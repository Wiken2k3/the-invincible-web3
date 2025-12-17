import {
  Container,
  Button,
  Group,
  Title,
  NumberInput,
  Text,
  Card,
  Stack,
  Badge,
  Divider,
  Table,
  Anchor,
  Grid,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { showNotification } from "@mantine/notifications";

import Reel from "./Reel";
import { spinReels } from "./slot.logic";

import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS, TREASURY_ID } from "../../../config/web3";
import { saveTx } from "../../../utils/saveTx"; // ✅ IMPORT
import { ConnectModal } from "@mysten/dapp-kit";

export default function SlotMachine() {
  const { address } = useWallet();
  const { transferSui, getBalance, claimReward } = useSuiContract();

  const [bet, setBet] = useState(1);
  const [reels, setReels] = useState<any[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // 🔥 TX DIGEST
  const [txDigest, setTxDigest] = useState<string | undefined>();

  // ▶️ Spin handler (WEB3 FLOW + HISTORY)
  const onSpin = async () => {
    if (!address) {
      showNotification({
        title: "Chưa kết nối ví",
        message: "Vui lòng connect wallet",
        color: "red",
      });
      return;
    }

    if (spinning) return;
    setSpinning(true);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: (tx) => {
        setTxDigest(tx?.digest);

        const result = spinReels();
        setReels(result.reels);

        setTimeout(() => {
          if (result.isWin) {
            const reward = bet * result.payout;

            // Call claimReward contract function
            claimReward(reward, {
              onSuccess: (claimTx) => {
                // ✅ WIN
                saveTx({
                  id: crypto.randomUUID(),
                  game: "Slot Machine",
                  amount: bet,
                  status: "success",
                  result: "win",
                  reward,
                  digest: claimTx?.digest,
                  timestamp: Date.now(),
                });

                showNotification({
                  title: "🎉 JACKPOT!",
                  message: `Bạn thắng ${reward.toFixed(2)} SUI`,
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
            // ❌ LOSE
            saveTx({
              id: crypto.randomUUID(),
              game: "Slot Machine",
              amount: bet,
              status: "success",
              result: "lose",
              digest: tx?.digest,
              timestamp: Date.now(),
            });

            showNotification({
              title: "😢 Thua",
              message: "Chúc may mắn lần sau!",
              color: "red",
            });
          }

          setSpinning(false);
        }, 800);
      },

      onError: () => {
        // ❌ TX FAILED
        saveTx({
          id: crypto.randomUUID(),
          game: "Slot Machine",
          amount: bet,
          status: "failed",
          timestamp: Date.now(),
        });

        setSpinning(false);
      },
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!address) {
        setBalance(null);
        return;
      }
      try {
        const b = await getBalance();
        // Debug: log raw balance response for troubleshooting
        // eslint-disable-next-line no-console
        console.log("useSuiContract.getBalance() ->", b);
        // try common response shapes
        // possible shapes:
        // - { totalBalance: number }
        // - { totalBalance: "123" }
        // - { balance: number }
        // - { data: { balance: number } }
        // - a plain number/string
        let total: any = null;
        if (b == null) total = null;
        else if (typeof b === "number" || typeof b === "string") total = b;
        else if ((b as any).totalBalance != null) total = (b as any).totalBalance;
        else if ((b as any).balance != null) total = (b as any).balance;
        else if ((b as any).data?.balance != null) total = (b as any).data.balance;
        else if (b?.coinObjectCount != null && b?.totalBalance != null) total = b.totalBalance;
        if (mounted && total != null) setBalance(Number(total) / 1e9);
      } catch (e) {
        console.error("Failed to load balance", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [address, getBalance]);

  // Transaction history helper
  const txHistory = useMemo(() => {
    try {
      const raw = localStorage.getItem("invincible_tx_history");
      return raw ? JSON.parse(raw).reverse() : [];
    } catch (e) {
      return [];
    }
  }, []);

  const explorerTxUrl = (digest?: string) =>
    digest ? `https://explorer.sui.io/txblock?network=testnet&tx=${digest}` : "";

  return (
    <Container size="lg">
      <Title>🎰 Slot Machine</Title>

      <Grid mt="lg">
        <Grid.Col span={8}>
          <Card shadow="md" p="lg">
            <Stack align="center">
              <Group justify="center">
                {reels.length > 0 ? (
                  reels.map((r, i) => <Reel key={i} icon={r.icon} />)
                ) : (
                  <Text color="dimmed">Chưa quay lần nào — hãy đặt cược!</Text>
                )}
              </Group>

              <NumberInput
                mt="md"
                label="Bet (SUI)"
                min={0.1}
                step={0.1}
                value={bet}
                onChange={(v) => setBet(Number(v))}
                style={{ width: 220 }}
              />

              <Button
                mt="md"
                size="xl"
                loading={spinning}
                onClick={onSpin}
                style={{
                  background: "linear-gradient(135deg,#facc15,#f97316)",
                  boxShadow: "0 0 25px rgba(250,204,21,0.6)",
                }}
              >
                SPIN 🎰
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Stack gap="sm">
            <Card withBorder>
              <Group justify="space-between">
                <Text size="sm" fw={700}>Wallet</Text>
                {address ? (
                  <Badge color="green">Connected</Badge>
                ) : (
                  <Badge color="gray">Disconnected</Badge>
                )}
              </Group>

              <Divider my="sm" />

              <Stack gap={6}>
                <Text size="sm" color="dimmed">
                  Your Address:
                </Text>
                <Text size="sm" truncate>
                  {address ?? "Chưa kết nối"}
                </Text>

                <Text size="sm" color="dimmed">
                  Your Balance:
                </Text>
                <Text size="lg" fw={700}>
                  {balance == null ? "—" : `${balance.toFixed(4)} SUI`}
                </Text>

                <Divider my="xs" />

                <Text size="sm" color="dimmed">
                  Treasury Address (Game Pool):
                </Text>
                <Text size="xs" truncate color="blue">
                  {TREASURY_ID}
                </Text>

                <Group mt="sm">
                  {address ? (
                    <Button variant="outline" size="sm">
                      🔗 Connected
                    </Button>
                  ) : (
                    <ConnectModal
                      trigger={<Button size="sm">Connect Wallet</Button>}
                    />
                  )}
                </Group>
              </Stack>
            </Card>

            <Card withBorder>
              <Text fw={700} mb="xs">
                Latest TX
              </Text>
              <Text size="sm" color="dimmed">
                Digest: {txDigest ?? "—"}
              </Text>
              {txDigest && (
                <Anchor href={explorerTxUrl(txDigest)} target="_blank" mt={6}>
                  Open in explorer
                </Anchor>
              )}
            </Card>

            <Card withBorder style={{ maxHeight: 300 }}>
              <Text fw={700} mb="xs">
                History
              </Text>
              <ScrollArea style={{ height: 240 }}>
                <Table striped highlightOnHover>
                  <tbody>
                    {txHistory.length === 0 && (
                      <tr>
                        <td colSpan={3}>
                          <Text color="dimmed">Không có lịch sử</Text>
                        </td>
                      </tr>
                    )}
                    {txHistory.map((t: any) => (
                      <tr key={t.id}>
                        <td style={{ width: 8 }}>
                          <Badge color={t.status === "success" ? "green" : "red"}>
                            {t.status}
                          </Badge>
                        </td>
                        <td>
                          <Text size="sm">{t.game}</Text>
                          <Text size="xs" color="dimmed">
                            {new Date(t.timestamp).toLocaleString()}
                          </Text>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Text size="sm">{t.amount} SUI</Text>
                          {t.digest && (
                            <Anchor href={explorerTxUrl(t.digest)} target="_blank" size="xs">
                              tx
                            </Anchor>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
