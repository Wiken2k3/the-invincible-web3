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

/* ================= CONFIG ================= */
const STORAGE_KEY = "farm_game_v7_fixed"; // ✅ sync với Game

// Ngày mở claim (mock)
const CLAIM_START_DATE = new Date("2025-03-01T00:00:00Z");

// Tỉ lệ quy đổi (mock – sau này map smart contract)
const AIRDROP_RATE = 0.1; // 1 AP = 0.1 TOKEN

/* ================= GLASS STYLE ================= */
const glassCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

/* ================= PAGE ================= */
export default function RewardPage() {
  const [airdropPoints, setAirdropPoints] = useState<number>(0);

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
  const now = useMemo(() => new Date(), []);
  const isClaimOpen = now >= CLAIM_START_DATE;

  const estimatedToken = useMemo(
    () => (airdropPoints * AIRDROP_RATE).toFixed(2),
    [airdropPoints]
  );

  const progressToClaim = useMemo(() => {
    const pct = (now.getTime() / CLAIM_START_DATE.getTime()) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [now]);

  /* ================= RENDER ================= */
  return (
    <Container size="sm" py="xl">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title order={2} c="white">
          🎁 Airdrop Rewards
        </Title>
        <Text c="dimmed" mt={4}>
          Kết nối Web3 — Claim Token trên Sui (Coming Soon)
        </Text>
      </motion.div>

      {/* MAIN CARD */}
      <Card radius="lg" mt="xl" p="xl" style={glassCardStyle}>
        <Stack gap="lg">

          {/* AIRDROP POINTS */}
          <Group justify="space-between">
            <Text fw={600}>✨ Airdrop Points</Text>
            <Badge size="xl" color="teal">
              {airdropPoints} AP
            </Badge>
          </Group>

          <Divider />

          {/* ESTIMATE */}
          <Group justify="space-between">
            <Text fw={600}>🪙 Ước tính Token</Text>
            <Text size="lg" fw={800} c="cyan">
              {estimatedToken} INV
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            * Con số minh họa. Số token thực tế sẽ được xác định khi mở claim.
          </Text>

          <Divider />

          {/* CLAIM STATUS */}
          <Box>
            <Text size="sm" mb={6} c="dimmed">
              Trạng thái Claim
            </Text>

            <Progress
              value={isClaimOpen ? 100 : progressToClaim}
              radius="xl"
              size="lg"
              striped={!isClaimOpen}
              animated={!isClaimOpen}
              color={isClaimOpen ? "green" : "blue"}
            />

            <Text size="xs" mt={6} c="dimmed">
              {isClaimOpen
                ? "✅ Claim đã mở"
                : `⏳ Claim sẽ mở từ ${CLAIM_START_DATE.toLocaleDateString("vi-VN")}`}
            </Text>
          </Box>

          {/* CLAIM BUTTON */}
          <Button
            size="lg"
            radius="xl"
            disabled
            fullWidth
            styles={{
              root: {
                background: "linear-gradient(90deg,#A259FF,#00E5FF)",
                opacity: 0.55,
                cursor: "not-allowed",
              },
            }}
          >
            🚫 Claim chưa mở
          </Button>

          <Text size="xs" c="dimmed" ta="center">
            Chỉ cần chơi game & tích AP.  
            Khi tới thời điểm, nút Claim sẽ tự động mở.
          </Text>

        </Stack>
      </Card>
    </Container>
  );
}
