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
  ScrollArea,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useWallet } from "../../hooks/useWallet";
import { ConnectModal } from "@mysten/dapp-kit";

/* ================= CONFIG ================= */
const TX_STORAGE_KEY = "invincible_tx_history";

/* ================= TYPES ================= */
type TxItem = {
  id: string;
  game: string;
  amount: number;
  status: "success" | "failed";
  digest?: string;
  timestamp: number;
};

/* ================= GLASS STYLE ================= */
const glassCardStyle: React.CSSProperties = {
  background: "rgba(15,23,42,0.65)",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(34,197,94,0.25)",
  borderRadius: 16,
};

/* ================= PAGE ================= */
export default function TransactionHistory() {
  const { address } = useWallet();
  const shortAddr = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  const [txs, setTxs] = useState<TxItem[]>([]);

  /* ---------- Load tx history ---------- */
  useEffect(() => {
    if (!address) return;

    try {
      const raw = localStorage.getItem(TX_STORAGE_KEY);
      if (!raw) {
        setTxs([]);
        return;
      }

      const parsed: TxItem[] = JSON.parse(raw);
      setTxs(parsed.reverse());
    } catch {
      setTxs([]);
    }
  }, [address]);

  /* ================= RENDER ================= */
  return (
    <Container size="md" py="xl">
      {/* ---------- HEADER ---------- */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title order={2} fw={900} c="#22c55e" ta="center">
          📜 Transaction History
        </Title>
        <Text ta="center" c="rgba(209,250,229,0.75)" mt={6}>
          Lịch sử giao dịch & đặt cược trong game
        </Text>
      </motion.div>

      <Divider my="lg" />

      {/* ---------- WALLET ---------- */}
      {!address ? (
        <ConnectModal
          trigger={
            <Card p="lg" style={glassCardStyle}>
              <Text ta="center" fw={700} c="#f59e0b">
                🔑 Kết nối ví để xem lịch sử
              </Text>
            </Card>
          }
        />
      ) : (
        <Card p="md" mb="lg" style={glassCardStyle}>
          <Text ta="center" fw={700} c="#22c55e">
            Ví: {shortAddr}
          </Text>
        </Card>
      )}

      {/* ---------- TX LIST ---------- */}
      <Card p="lg" style={glassCardStyle}>
        <Stack gap="sm">
          <Text fw={800} c="#d1fae5">
            🧾 Giao dịch gần đây
          </Text>

          <Divider opacity={0.2} />

          {txs.length === 0 ? (
            <Text ta="center" c="rgba(209,250,229,0.6)">
              Chưa có giao dịch nào
            </Text>
          ) : (
            <ScrollArea h={420}>
              <Stack gap="sm">
                {txs.map((tx) => (
                  <motion.div
                    key={tx.id}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      p="md"
                      radius="md"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Group justify="space-between">
                        <Text fw={700}>{tx.game}</Text>

                        <Badge
                          color={tx.status === "success" ? "green" : "red"}
                        >
                          {tx.status.toUpperCase()}
                        </Badge>
                      </Group>

                      <Text size="sm" c="gray.4">
                        💰 {tx.amount} SUI
                      </Text>

                      {tx.digest && (
                        <Text size="xs" c="gray.5">
                          Tx: {tx.digest.slice(0, 10)}...
                        </Text>
                      )}

                      <Text size="xs" c="gray.6">
                        ⏱{" "}
                        {new Date(tx.timestamp).toLocaleString("vi-VN")}
                      </Text>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea>
          )}
        </Stack>
      </Card>
    </Container>
  );
}
