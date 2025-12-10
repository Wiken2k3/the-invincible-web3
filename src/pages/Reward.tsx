
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
const STORAGE_KEY = "farm_game_v6_web3_ui_clean";

// Ngày mở claim (mock)
const CLAIM_START_DATE = new Date("2025-03-01T00:00:00Z");

// Tỉ lệ quy đổi (fake – sau này map từ smart contract)
const AIRDROP_RATE = 0.1; // 1 AP = 0.1 TOKEN

/* ================= GLASS STYLE ================= */
const glassCardStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

/* ================= PAGE ================= */
export default function RewardPage() {
  const [airdropPoints, setAirdropPoints] = useState(0);

  /* ---------- Load AP from Game ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      setAirdropPoints(Number(data.airdropPoints || 0));
    } catch {}
  }, []);

  /* ---------- Claim Status ---------- */
  const now = new Date();
  const isClaimOpen = now >= CLAIM_START_DATE;

  const estimatedToken = useMemo(
    () => (airdropPoints * AIRDROP_RATE).toFixed(2),
    [airdropPoints]
  );

  const progressToClaim = Math.min(
    100,
    (now.getTime() / CLAIM_START_DATE.getTime()) * 100
  );

  /* ================= RENDER ================= */
  return (
    <Container size="sm" py="xl">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Title order={2} c="white">🎁 Airdrop Rewards</Title>
        <Text c="dimmed" mt={4}>
          Kết nối Web3 — Claim Token trên Sui (Coming Soon)
        </Text>
      </motion.div>

      {/* MAIN CARD */}
      <Card radius="lg" mt="xl" p="xl" style={glassCardStyle}>
        <Stack spacing="lg">

          {/* AIRDROP POINTS */}
          <Group position="apart">
            <Text fw={600}>✨ Airdrop Points</Text>
            <Badge size="xl" color="teal" variant="filled">
              {airdropPoints} AP
            </Badge>
          </Group>

          <Divider />

          {/* ESTIMATE */}
          <Group position="apart">
            <Text fw={600}>🪙 Ước tính Token nhận được</Text>
            <Text size="lg" fw={800} c="cyan">
              {estimatedToken} INV
            </Text>
          </Group>

          <Text size="xs" c="dimmed">
            * Con số chỉ mang tính minh họa. Số token chính thức sẽ được xác định khi mở claim.
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
                : `⏳ Claim sẽ mở từ ngày ${CLAIM_START_DATE.toLocaleDateString("vi-VN")}`}
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
                opacity: 0.5,
                cursor: "not-allowed",
              },
            }}
          >
            🚫 Claim chưa mở
          </Button>

          <Text size="xs" c="dimmed" ta="center">
            Bạn chỉ cần chơi game và tích AP.  
            Khi đến thời gian, nút này sẽ tự động mở.
          </Text>

        </Stack>
      </Card>
    </Container>
  );
}
