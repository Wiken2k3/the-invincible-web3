"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Button,
  Group,
  Stack,
  Divider,
  Progress,
  Box,
} from "@mantine/core";
import { motion } from "framer-motion";

// 🟢 Import Hook Connect Wallet
import { useWallet } from "../../hooks/useWallet";
import { ConnectModal } from "@mysten/dapp-kit";

/* ================= CONFIG ================= */
const STORAGE_KEY = "farm_game_v7_fixed"; // sync với Game

const CLAIM_START_DATE = new Date("2025-03-01T00:00:00Z");
const AIRDROP_RATE = 0.1;

/* ================= GLASS STYLE ================= */
const glassCardStyle: React.CSSProperties = {
  background: `
    radial-gradient(circle at top, rgba(34, 197, 94, 0.08), transparent 50%),
    radial-gradient(circle at bottom, rgba(14, 165, 233, 0.06), transparent 50%),
    rgba(15, 23, 42, 0.6)
  `,
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(144, 238, 144, 0.25)",
  boxShadow: "0 8px 32px rgba(14, 165, 233, 0.12)",
};

/* ================= PAGE ================= */
export default function RewardPage() {
  const [airdropPoints, setAirdropPoints] = useState<number>(0);

  // 🟢 Wallet hook
  const { address } = useWallet();
  const shortAddr = address ? `${address.slice(0, 3)}...${address.slice(-3)}` : "";

  /* ---------- Load AP từ Game ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      setAirdropPoints(Number(data.airdropPoints ?? 0));
    } catch {
      setAirdropPoints(0);
    }
  }, []);

  /* ---------- Time & Claim Status ---------- */
  const now = new Date();
  const isClaimOpen = now >= CLAIM_START_DATE;

  const estimatedToken = useMemo(
    () => (airdropPoints * AIRDROP_RATE).toFixed(2),
    [airdropPoints]
  );

  const progressToClaim = useMemo(() => {
    const pct =
      (now.getTime() / CLAIM_START_DATE.getTime()) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [now]);

  /* ================= RENDER ================= */
  return (
    <Container size="sm" py="xl">

      {/* ---------------- HEADER ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Title order={2} c="#22c55e" fw={800} ta="center">
            🎁 Airdrop Rewards
          </Title>
        </motion.div>
        <Text c="rgba(209, 250, 229, 0.8)" mt={8} ta="center" size="md">
          Claim token bằng ví Sui – Coming soon
        </Text>
      </motion.div>

      {/* ---------------- MAIN CARD ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card radius="lg" mt="xl" p="xl" style={glassCardStyle}>
          <Stack gap="lg">

            {/* ---------------- AIRDROP POINTS ---------------- */}
            <Group justify="space-between" align="center">
              <Text fw={700} size="lg" c="#d1fae5">✨ Airdrop Points</Text>
              <Badge 
                size="xl" 
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  padding: "8px 20px",
                }}
              >
                {airdropPoints} AP
              </Badge>
            </Group>

            <Divider color="rgba(144, 238, 144, 0.2)" />

            {/* ---------------- TOKEN ESTIMATE ---------------- */}
            <Group justify="space-between">
              <Text fw={700} size="lg" c="#d1fae5">🪙 Ước tính Token</Text>
              <Text size="xl" fw={900} c="#22c55e" style={{ fontSize: "1.8rem" }}>
                {estimatedToken} INV
              </Text>
            </Group>

            <Text size="xs" c="rgba(209, 250, 229, 0.6)" ta="center">
              * Con số minh họa, sẽ thay đổi khi mở claim chính thức.
            </Text>

            <Divider color="rgba(144, 238, 144, 0.2)" />

            {/* ---------------- CLAIM STATUS ---------------- */}
            <Box>
              <Text size="sm" mb={8} fw={600} c="#d1fae5">
                Trạng thái Claim
              </Text>

              <Progress
                value={isClaimOpen ? 100 : progressToClaim}
                radius="xl"
                size="lg"
                striped={!isClaimOpen}
                animated={!isClaimOpen}
                color={isClaimOpen ? "green" : "#22c55e"}
              />

              <Text
                size="sm"
                mt={8}
                c={isClaimOpen ? "#22c55e" : "rgba(209, 250, 229, 0.8)"}
                fw={600}
                ta="center"
              >
                {isClaimOpen
                  ? "✅ Claim đã mở!"
                  : `⏳ Claim mở từ ${CLAIM_START_DATE.toLocaleDateString("vi-VN")}`}
              </Text>
            </Box>

            {/* ---------------- CONNECT WALLET ---------------- */}
            {address ? (
              <Card
                p="md"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 12,
                }}
              >
                <Text ta="center" fw={700} c="#22c55e">
                  🔑 Đã kết nối: {shortAddr}
                </Text>
              </Card>
            ) : (
              <ConnectModal
                walletFilter={(wallet) => {
                  // Slush Wallet sẽ tự động xuất hiện nếu đã cài đặt extension
                  return true;
                }}
                trigger={
                  <Button
                    fullWidth
                    size="lg"
                    radius="md"
                    mt="sm"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    🟢 Kết nối ví để Claim
                  </Button>
                }
              />
            )}

            {/* ---------------- CLAIM BUTTON ---------------- */}
            <Button
              fullWidth
              radius="md"
              size="lg"
              disabled={!isClaimOpen || !address}
              style={{
                background: isClaimOpen && address
                  ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : "rgba(160,82,45,0.25)",
                color: "#fff",
                fontWeight: 800,
                marginTop: 12,
              }}
            >
              {address
                ? isClaimOpen
                  ? "🎉 Claim Token"
                  : "🔒 Claim chưa mở"
                : "🔑 Hãy kết nối ví trước"}
            </Button>

            <Text size="sm" c="rgba(209, 250, 229, 0.7)" ta="center" mt="md">
              🌾 Tiếp tục chơi game để tích lũy thêm Airdrop Points!
            </Text>
          </Stack>
        </Card>
      </motion.div>
    </Container>
  );
}
