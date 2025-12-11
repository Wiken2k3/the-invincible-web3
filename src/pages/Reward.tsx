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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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
          Kết nối Web3 — Claim Token trên Sui (Coming Soon)
        </Text>
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card radius="lg" mt="xl" p="xl" style={glassCardStyle}>
          <Stack gap="lg">
            {/* AIRDROP POINTS */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Group justify="space-between" align="center">
                <Text fw={700} size="lg" c="#d1fae5">✨ Airdrop Points</Text>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
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
                </motion.div>
              </Group>
            </motion.div>

            <Divider color="rgba(144, 238, 144, 0.2)" />

            {/* ESTIMATE */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Group justify="space-between" align="center">
                <Text fw={700} size="lg" c="#d1fae5">🪙 Ước tính Token</Text>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Text size="xl" fw={900} c="#22c55e" style={{ fontSize: "1.8rem" }}>
                    {estimatedToken} INV
                  </Text>
                </motion.div>
              </Group>
            </motion.div>

            <Text size="xs" c="rgba(209, 250, 229, 0.6)" ta="center">
              * Con số minh họa. Số token thực tế sẽ được xác định khi mở claim.
            </Text>

            <Divider color="rgba(144, 238, 144, 0.2)" />

            {/* CLAIM STATUS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box>
                <Text size="sm" mb={8} fw={600} c="#d1fae5">
                  Trạng thái Claim
                </Text>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                >
                  <Progress
                    value={isClaimOpen ? 100 : progressToClaim}
                    radius="xl"
                    size="lg"
                    striped={!isClaimOpen}
                    animated={!isClaimOpen}
                    color={isClaimOpen ? "green" : "#22c55e"}
                    style={{
                      boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                    }}
                  />
                </motion.div>

                <motion.div
                  animate={!isClaimOpen ? { opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 2, repeat: !isClaimOpen ? Infinity : 0 }}
                >
                  <Text size="sm" mt={8} c={isClaimOpen ? "#22c55e" : "rgba(209, 250, 229, 0.8)"} fw={600} ta="center">
                    {isClaimOpen
                      ? "✅ Claim đã mở - Sẵn sàng nhận thưởng!"
                      : `⏳ Claim sẽ mở từ ${CLAIM_START_DATE.toLocaleDateString("vi-VN")}`}
                  </Text>
                </motion.div>
              </Box>
            </motion.div>

            {/* CLAIM BUTTON - LOCKED STATE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card
                p="lg"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(139, 69, 19, 0.15) 0%, 
                      rgba(160, 82, 45, 0.12) 100%
                    )
                  `,
                  border: "2px solid rgba(160, 82, 45, 0.3)",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(139, 69, 19, 0.2)",
                }}
              >
                <Stack gap="md" align="center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Text size="3xl">🔒</Text>
                  </motion.div>
                  
                  <Text fw={700} size="lg" c="#f59e0b" ta="center">
                    Claim Token đang bị khóa
                  </Text>
                  
                  <Text size="sm" c="rgba(209, 250, 229, 0.9)" ta="center" lh={1.6}>
                    ⏳ Chờ đến ngày dự kiến: 
                    <br />
                    <strong style={{ fontSize: "1.1rem", color: "#f59e0b" }}>
                      {CLAIM_START_DATE.toLocaleDateString("vi-VN", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </strong>
                  </Text>
                  
                  <Text size="xs" c="rgba(209, 250, 229, 0.7)" ta="center" mt="xs">
                    Nút Claim sẽ tự động mở khi đến thời điểm airdrop.
                    <br />
                    Hiện tại bạn chỉ có thể tích lũy AP bằng cách chơi game.
                  </Text>
                </Stack>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Text size="sm" c="rgba(209, 250, 229, 0.7)" ta="center" mt="md">
                🌾 Tiếp tục chơi game để tích lũy thêm Airdrop Points!
                <br />
                💡 Càng nhiều AP, phần thưởng càng lớn khi claim mở.
              </Text>
            </motion.div>
          </Stack>
        </Card>
      </motion.div>
    </Container>
  );
}
