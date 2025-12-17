"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  Divider,
  Loader,
  Box,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";

/* ================= TYPES ================= */
type TxItem = {
  digest: string;
  timestampMs?: number;
  status?: string;
};

/* ================= PAGE ================= */
export default function RewardPage() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<TxItem[]>([]);

  /* ---------- Fetch Transactions ---------- */
  useEffect(() => {
    if (!account?.address) return;

    const fetchTxs = async () => {
      setLoading(true);
      try {
        // some versions of the Sui client expose different methods; cast to any
        const res = await (suiClient as any).getTransactionBlocks({
          filter: {
            FromAddress: account.address,
          },
          options: {
            showEffects: true,
            showInput: true,
          },
          limit: 20,
        });

        setTxs(
          res.data.map((tx) => ({
            digest: tx.digest,
            timestampMs: tx.timestampMs,
            status: tx.effects?.status.status,
          }))
        );
      } catch (err) {
        console.error("Fetch tx error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTxs();
  }, [account, suiClient]);

  /* ================= RENDER ================= */
  return (
    <Container size="md" py="xl">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title order={2} ta="center" fw={800} c="#22c55e">
          📜 Lịch sử giao dịch
        </Title>
        <Text ta="center" c="dimmed" mt={6}>
          Giao dịch SUI phát sinh từ các game
        </Text>
      </motion.div>

      <Divider my="lg" />

      {/* NO WALLET */}
      {!account && (
        <Card radius="lg" p="xl" ta="center">
          <Text fw={600}>🔑 Vui lòng kết nối ví để xem lịch sử</Text>
        </Card>
      )}

      {/* LOADING */}
      {loading && (
        <Group justify="center" mt="xl">
          <Loader color="green" />
        </Group>
      )}

      {/* TX LIST */}
      {account && !loading && (
        <Stack gap="md">
          {txs.length === 0 && (
            <Text ta="center" c="dimmed">
              Chưa có giao dịch nào
            </Text>
          )}

          {txs.map((tx) => (
            <motion.div
              key={tx.digest}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                radius="lg"
                p="md"
                style={{
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(34,197,94,0.25)",
                }}
              >
                <Group justify="space-between">
                  <Box>
                    <Text size="sm" fw={700}>
                      Tx Hash
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tx.digest.slice(0, 10)}...
                    </Text>
                  </Box>

                  <Badge
                    color={tx.status === "success" ? "green" : "red"}
                    variant="filled"
                  >
                    {tx.status}
                  </Badge>
                </Group>

                <Divider my={8} />

                <Text size="xs" c="dimmed">
                  {tx.timestampMs
                    ? new Date(tx.timestampMs).toLocaleString("vi-VN")
                    : "—"}
                </Text>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}
    </Container>
  );
}
