// =========================
//  GAMEPAGE V7 (FINAL FIX)
// =========================

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Title,
  Text,
  Button,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  Container,
  Image,
  Progress,
  Modal,
  SimpleGrid,
  Select,
  Box,
  Stepper,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";

import FarmTile from "../components/FarmTile";

// Seeds
import commonImg from "../assets/seeds/common.png";
import rareImg from "../assets/seeds/rare.png";
import epicImg from "../assets/seeds/epic.png";
import legendaryImg from "../assets/seeds/legendary.png";

/* -------------------------------- TYPES ------------------------------ */
interface EffectQuality {
  id: string;
  label: string;
  weight: number;
  bonus: number;
  color: string;
  icon: string;
}

interface SeedDefinition {
  id: string;
  name: string;
  price: number;
  growSec: number;
  rarity: string;
  airdrop: number;
  color: string;
  img: string;
  emoji: string;
}

interface Plot {
  seedId: string;
  plantedAt: number;
  readyAt: number;
}

interface GameState {
  coins: number;
  airdropPoints: number;
  inventory: Record<string, number>;
  plots: (Plot | null)[];
}

interface EffectPopup {
  seed: SeedDefinition;
  coins: number;
  bonus: number;
  totalAP: number;
  quality: EffectQuality;
}

interface HarvestDetail {
  name: string;
  emoji: string;
  bonus: number;
  quality: string;
}

interface HarvestAllPopup {
  coins: number;
  ap: number;
  list: HarvestDetail[];
}

interface LootBox {
  id: number;
  points: number;
  opened: boolean;
  locked: boolean;
}

/* -------------------------------- EFFECT CONFIG ------------------------------ */
const EFFECT_QUALITY: EffectQuality[] = [
  { id: "normal", label: "Thường", weight: 40, bonus: 0, color: "#888", icon: "🌱" },
  { id: "bronze", label: "Đồng", weight: 30, bonus: 5, color: "#cd7f32", icon: "🥉" },
  { id: "silver", label: "Bạc", weight: 20, bonus: 10, color: "#c0c0c0", icon: "🥈" },
  { id: "gold", label: "Vàng", weight: 8, bonus: 30, color: "#ffd700", icon: "🥇" },
  { id: "diamond", label: "Kim Cương", weight: 2, bonus: 50, color: "#4de1ff", icon: "💎" },
];

function pickEffectQuality(): EffectQuality {
  const total = EFFECT_QUALITY.reduce((s, q) => s + q.weight, 0);
  let r = Math.random() * total;
  for (const q of EFFECT_QUALITY) {
    if (r < q.weight) return q;
    r -= q.weight;
  }
  return EFFECT_QUALITY[0];
}

/* -------------------------------- GAME DATA ------------------------------ */
const SEED_DEFINITIONS: Record<string, SeedDefinition> = {
  common: { id: "common", name: "Hạt bình thường", price: 10, growSec: 15, rarity: "Common", airdrop: 1, color: "green", img: commonImg, emoji: "🌱" },
  rare: { id: "rare", name: "Hạt hiếm", price: 35, growSec: 30, rarity: "Rare", airdrop: 3, color: "lime", img: rareImg, emoji: "🌿" },
  epic: { id: "epic", name: "Hạt cực hiếm", price: 120, growSec: 60, rarity: "Epic", airdrop: 8, color: "teal", img: epicImg, emoji: "🌺" },
  legendary: { id: "legendary", name: "Hạt truyền thuyết", price: 400, growSec: 180, rarity: "Legendary", airdrop: 25, color: "yellow", img: legendaryImg, emoji: "🌸" },
};

const MYSTERY_BOX = { price: 50, minCoinToOpen: 500 };
const STORAGE_KEY = "farm_game_v7_fixed";
const NUM_PLOTS = 9;

/* -------------------------------- LOAD / SAVE ------------------------------ */
function loadState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/* -------------------------------- UTILS ------------------------------ */
function uniqueRandomInts(count: number, min: number, max: number): number[] {
  const set = new Set<number>();
  const range = max - min + 1;
  while (set.size < count && set.size < range) {
    set.add(Math.floor(Math.random() * range) + min);
  }
  return [...set];
}

/* -------------------------------- STYLES ------------------------------ */
const glassCardStyle = {
  background: "rgba(34, 139, 34, 0.08)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(144, 238, 144, 0.2)",
  boxShadow: "0 4px 20px rgba(34, 139, 34, 0.1)",
};

const gradientButtonStyle = {
  background: "linear-gradient(135deg, #22c55e, #16a34a, #15803d)",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
};

const helpButtonStyle = {
  background: "linear-gradient(135deg, #f59e0b, #d97706)",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
};

const FarmPlotCard = ({ children }: { children: React.ReactNode }) => <Card radius="lg" p="lg" style={glassCardStyle}>{children}</Card>;
const SectionCard = ({ children }: { children: React.ReactNode }) => <Card radius="lg" p="lg" style={glassCardStyle}>{children}</Card>;

const HeroBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    style={{
      background: `
        radial-gradient(circle at 20% 10%, rgba(34, 197, 94, 0.08), transparent 35%),
        radial-gradient(circle at 80% 90%, rgba(14, 165, 233, 0.06), transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05), transparent 50%),
        linear-gradient(180deg, #0a0f1a 0%, #0f172a 50%, #1a1f2e 100%)
      `,
      padding: "32px 0",
      borderRadius: 16,
      marginBottom: 20,
      border: "1px solid rgba(144, 238, 144, 0.25)",
      boxShadow: "0 8px 32px rgba(14, 165, 233, 0.12)",
    }}
  >
    {children}
  </Box>
);

/* ============================================================================================
    MAIN GAME
============================================================================================ */
export default function GamePage() {
  const persisted = useMemo(() => loadState(), []);
  const [coins, setCoins] = useState(persisted?.coins ?? 100);
  const [airdropPoints, setAirdropPoints] = useState(persisted?.airdropPoints ?? 0);
  const [inventory, setInventory] = useState(persisted?.inventory ?? { common: 2, rare: 0, epic: 0, legendary: 0 });
  const [plots, setPlots] = useState(persisted?.plots ?? Array(NUM_PLOTS).fill(null));

  const [selectedSeed, setSelectedSeed] = useState("common");

  const [selectPlantModal, setSelectPlantModal] = useState(false);
  const [activePlotIndex, setActivePlotIndex] = useState<number | null>(null);

  const [isLootboardOpen, setLootboardOpen] = useState(false);
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);

  const [effectPopup, setEffectPopup] = useState<EffectPopup | null>(null);
  const [harvestAllPopup, setHarvestAllPopup] = useState<HarvestAllPopup | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);

  /* -------------------------------- AUTO UPDATE PROGRESS ------------------------------ */
  useEffect(() => {
    const t = setInterval(() => setPlots((p: (Plot | null)[]) => [...p]), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    saveState({ coins, airdropPoints, inventory, plots });
  }, [coins, airdropPoints, inventory, plots]);

  /* -------------------------------- WELCOME MODAL ------------------------------ */
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("has_seen_welcome");
    if (!hasSeenWelcome) {
      setTimeout(() => setShowWelcomeModal(true), 500);
    }
  }, []);

  /* -------------------------------- BUY SEED ------------------------------ */
  const buySeed = useCallback((seedId: string, amount = 1) => {
    const sd = SEED_DEFINITIONS[seedId];
    if (!sd) return;

    const cost = sd.price * amount;
    if (coins < cost)
      return showNotification({ color: "red", title: "Không đủ Coins", message: `Cần ${cost} Coins` });

    setCoins((c: number) => c - cost);
    setInventory((inv: Record<string, number>) => ({ ...inv, [seedId]: (inv[seedId] || 0) + amount }));

    showNotification({ 
      color: "green", 
      title: "Mua thành công!", 
      message: `Đã mua ${amount} ${sd.name}`,
      autoClose: 2000,
    });
  }, [coins]);

  /* -------------------------------- PLANT ------------------------------ */
  const openSelectPlantModal = useCallback((i: number) => {
    setActivePlotIndex(i);
    setSelectPlantModal(true);
  }, []);

  const confirmPlant = useCallback((seedId: string) => {
    if (activePlotIndex === null) return;
    if ((inventory[seedId] ?? 0) <= 0)
      return showNotification({ color: "orange", title: "Không đủ hạt giống", message: "" });

    setPlots((prev: (Plot | null)[]) => {
      if (prev[activePlotIndex]) return prev;

      const sd = SEED_DEFINITIONS[seedId];
      if (!sd) return prev;
      const now = Date.now();
      const clone = [...prev];
      clone[activePlotIndex] = {
        seedId,
        plantedAt: now,
        readyAt: now + sd.growSec * 1000,
      };
      return clone;
    });

    setInventory((inv: Record<string, number>) => ({ ...inv, [seedId]: inv[seedId] - 1 }));
    setSelectPlantModal(false);

    showNotification({ color: "blue", title: "Đã trồng!", message: "Hãy chờ cây lớn." });
  }, [activePlotIndex, inventory]);

  /* -------------------------------- HARVEST ------------------------------ */
  const harvest = useCallback((i: number) => {
    setPlots((prev: (Plot | null)[]) => {
      const p = prev[i];
      if (!p) return prev;

      const now = Date.now();
      if (now < p.readyAt) {
        showNotification({ color: "yellow", title: "Cây chưa chín", message: "" });
        return prev;
      }

      const sd = SEED_DEFINITIONS[p.seedId];
      if (!sd) return prev;
      const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));

      const q = pickEffectQuality();
      const totalAP = sd.airdrop + q.bonus;

      setCoins((c: number) => c + baseReward);
      setAirdropPoints((a: number) => a + totalAP);

      setEffectPopup({
        seed: sd,
        coins: baseReward,
        bonus: q.bonus,
        totalAP,
        quality: q,
      });
      setTimeout(() => setEffectPopup(null), 2000);

      return prev.map((x: Plot | null, idx: number) => (idx === i ? null : x));
    });
  }, []);

  /* -------------------------------- HARVEST ALL ------------------------------ */
  const harvestAll = useCallback(() => {
    const now = Date.now();
    let totalCoins = 0;
    let totalAP = 0;
    const details: HarvestDetail[] = [];

    setPlots((prev: (Plot | null)[]) => {
      const updated = prev.map((p: Plot | null) => {
        if (!p || now < p.readyAt) return p;

        const sd = SEED_DEFINITIONS[p.seedId];
        if (!sd) return p;
        const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));

        const q = pickEffectQuality();
        const ap = sd.airdrop + q.bonus;

        totalCoins += baseReward;
        totalAP += ap;
        details.push({ name: sd.name, emoji: sd.emoji, bonus: q.bonus, quality: q.label });

        return null;
      });

      if (details.length === 0) {
        showNotification({ color: "orange", title: "Không có cây chín.", message: "" });
        return prev;
      }

      setCoins((c: number) => c + totalCoins);
      setAirdropPoints((a: number) => a + totalAP);

      setHarvestAllPopup({ coins: totalCoins, ap: totalAP, list: details });
      setTimeout(() => setHarvestAllPopup(null), 3000);

      return updated;
    });
  }, []);

  /* -------------------------------- LOOTBOARD ------------------------------ */
  const openLootboard = useCallback(() => {
    if (coins < MYSTERY_BOX.minCoinToOpen)
      return showNotification({ color: "red", title: "Cần 500 Coins để mở!", message: "" });

    if (coins < MYSTERY_BOX.price) return showNotification({ color: "red", title: "Không đủ Coins!", message: "" });

    setCoins((c: number) => c - MYSTERY_BOX.price);

    const points = uniqueRandomInts(10, 10, 100);
    setLootBoxes(points.map((pt: number, i: number) => ({ id: i, points: pt, opened: false, locked: false })));

    setLootboardOpen(true);
  }, [coins]);

  const openBox = useCallback((idx: number) => {
    setLootBoxes((prev: LootBox[]) => {
      const opened = prev.some((b: LootBox) => b.opened);
      if (opened) return prev;

      const copy = [...prev];
      copy[idx] = { ...copy[idx], opened: true };

      for (let i = 0; i < copy.length; i++) if (i !== idx) copy[i].locked = true;

      setAirdropPoints((a: number) => a + copy[idx].points);

      showNotification({ color: "grape", title: `+${copy[idx].points} AP!`, message: "" });

      return copy;
    });
  }, []);

  /* -------------------------------- PROGRESS ------------------------------ */
  const plotProgress = (p: Plot | null): number => {
    if (!p) return 0;
    const sd = SEED_DEFINITIONS[p.seedId];
    if (!sd) return 0;
    const total = sd.growSec * 1000;
    const elapsed = Date.now() - p.plantedAt;
    return Math.min(100, Math.floor((elapsed / total) * 100));
  };

  /* ============================================================================================
      RENDER
  ============================================================================================ */
  const welcomeSteps = [
    {
      title: "Chào mừng đến với The Invincible! 🌾",
      content: "Đây là game farming Web3 trên Sui. Bạn sẽ trồng cây, thu hoạch và kiếm Coins cùng Airdrop Points!",
    },
    {
      title: "Cách chơi cơ bản 📖",
      content: "1. Mua hạt giống từ cửa hàng\n2. Trồng vào các ô trống\n3. Chờ cây lớn (thời gian tùy loại hạt)\n4. Thu hoạch để nhận Coins và AP!",
    },
    {
      title: "Hệ thống hạt giống 🌱",
      content: "• Common (🌱): 10 Coins, 15s, +1 AP\n• Rare (🌿): 35 Coins, 30s, +3 AP\n• Epic (🌺): 120 Coins, 60s, +8 AP\n• Legendary (🌸): 400 Coins, 180s, +25 AP",
    },
    {
      title: "Mystery Box & Bonus 🎁",
      content: "• Mở Mystery Box với 50 Coins để nhận AP ngẫu nhiên\n• Mỗi lần thu hoạch có thể nhận bonus chất lượng (Thường → Kim Cương)\n• Bonus càng cao, AP nhận được càng nhiều!",
    },
    {
      title: "Sẵn sàng bắt đầu! 🚀",
      content: "Bạn đã có 100 Coins và 2 hạt Common để bắt đầu. Hãy trồng và thu hoạch để kiếm thêm Coins!",
    },
  ];

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("has_seen_welcome", "true");
  };

  const handleWelcomeNext = () => {
    if (welcomeStep < welcomeSteps.length - 1) {
      setWelcomeStep(welcomeStep + 1);
    } else {
      handleWelcomeClose();
    }
  };

  return (
    <Container size="xl" py="lg">
      {/* ---------------- WELCOME MODAL ---------------- */}
      <Modal
        opened={showWelcomeModal}
        onClose={handleWelcomeClose}
        centered
        size="lg"
        title={
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Group gap="sm">
              <Text size="xl">🌾</Text>
              <Title order={3} c="#22c55e">Hướng dẫn chơi game</Title>
            </Group>
          </motion.div>
        }
        styles={{
          content: {
            background: "linear-gradient(135deg, #0f2027 0%, #1a3a2e 50%, #2d5a3d 100%)",
            border: "2px solid rgba(144, 238, 144, 0.3)",
            boxShadow: "0 8px 32px rgba(34, 139, 34, 0.3)",
          },
          header: {
            background: "rgba(34, 197, 94, 0.1)",
            borderBottom: "2px solid rgba(144, 238, 144, 0.2)",
          },
          body: {
            padding: "24px",
          },
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={welcomeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Stack gap="lg">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Title order={4} c="#22c55e" ta="center" fw={700}>
                  {welcomeSteps[welcomeStep].title}
                </Title>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card
                  p="lg"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(144, 238, 144, 0.3)",
                    borderRadius: 12,
                  }}
                >
                  <Text size="md" c="#d1fae5" style={{ whiteSpace: "pre-line" }} ta="center" lh={1.8}>
                    {welcomeSteps[welcomeStep].content}
                  </Text>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Stepper
                  active={welcomeStep}
                  onStepClick={setWelcomeStep}
                  color="#22c55e"
                  size="sm"
                  styles={{
                    stepBody: {
                      cursor: "pointer",
                    },
                    step: {
                      "&[data-progress]": {
                        borderColor: "#22c55e",
                      },
                    },
                  }}
                >
                  {welcomeSteps.map((_, index) => (
                    <Stepper.Step 
                      key={index} 
                      label={`Bước ${index + 1}`}
                      icon={index === welcomeStep ? "🌱" : index < welcomeStep ? "✅" : "⭕"}
                    />
                  ))}
                </Stepper>
              </motion.div>

              <Group justify="space-between" mt="md">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="subtle"
                    onClick={handleWelcomeClose}
                    style={{ 
                      color: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        background: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Đóng
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    style={gradientButtonStyle}
                    onClick={handleWelcomeNext}
                    radius="xl"
                    size="md"
                  >
                    {welcomeStep < welcomeSteps.length - 1 ? "Tiếp theo →" : "Bắt đầu chơi! 🎮"}
                  </Button>
                </motion.div>
              </Group>
            </Stack>
          </motion.div>
        </AnimatePresence>
      </Modal>

      {/* ---------------- HERO ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <HeroBox>
          <Group justify="space-between" px="md">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Title order={2} fw={800} c="white">🌾 Farming Airdrop Game</Title>
              <Text size="sm" c="gray">Play • Earn • Claim</Text>
            </motion.div>

            <Group gap="md">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Badge 
                  size="lg" 
                  style={{ 
                    fontSize: "1rem", 
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    color: "#1a1a1a",
                    fontWeight: 700,
                  }}
                >
                  💰 {coins}
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Badge 
                  size="lg" 
                  style={{ 
                    fontSize: "1rem", 
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  ✨ {airdropPoints}
                </Badge>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button radius="xl" style={helpButtonStyle} onClick={() => setShowWelcomeModal(true)}>
                  📖 Hướng dẫn
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button radius="xl" style={gradientButtonStyle} onClick={openLootboard}>
                  🎁 Mystery Box
                </Button>
              </motion.div>
            </Group>
          </Group>
        </HeroBox>
      </motion.div>

      {/* ---------------- MAIN GRID ---------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid gutter="xl">
          {/* LEFT FARM */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <FarmPlotCard>
                <Group justify="space-between" mb="sm">
                  <Title order={4} c="white">🪴 Khu trồng trọt</Title>
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button 
                      size="sm" 
                      onClick={harvestAll}
                      style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      🌾 Thu hoạch tất cả
                    </Button>
                  </motion.div>
                </Group>

                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg">
                  {plots.map((p: Plot | null, i: number) => {
                    const def = p ? SEED_DEFINITIONS[p.seedId] : null;
                    const ready = p && Date.now() >= p.readyAt;
                    const progress = plotProgress(p);

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <FarmTile
                          seed={def ? { id: def.id, image: def.img, name: def.name, emoji: def.emoji } : null}
                          index={i}
                          ready={!!ready}
                          onPlant={() => p ? harvest(i) : openSelectPlantModal(i)}
                        />

                        <motion.div
                          animate={ready ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 1, repeat: ready ? Infinity : 0 }}
                        >
                          <Text size="xs" mt={6} c="gray" ta="center">
                            {p ? (ready ? "✅ Sẵn sàng" : `${def?.emoji} Đang lớn`) : "Trống"}
                          </Text>
                        </motion.div>

                        {p && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                          >
                            <Progress
                              mt={5}
                              radius="xl"
                              size="sm"
                              value={progress}
                              color={ready ? "teal" : "blue"}
                              animated={!ready}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </SimpleGrid>
              </FarmPlotCard>
            </motion.div>
          </Grid.Col>

          {/* RIGHT PANEL */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Stack gap="lg">
                {/* SHOP */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <SectionCard>
                    <Title order={5} c="white">🛒 Cửa hàng</Title>

                    <Select
                      label="Chọn hạt"
                      value={selectedSeed}
                      onChange={(v) => v && setSelectedSeed(v)}
                      data={Object.values(SEED_DEFINITIONS).map((s) => ({
                        value: s.id,
                        label: `${s.emoji} ${s.name} — ${s.price} Coins`,
                      }))}
                      my="md"
                    />

                    <Group gap="sm">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button style={gradientButtonStyle} onClick={() => buySeed(selectedSeed, 1)}>
                          Mua 1
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button variant="outline" onClick={() => buySeed(selectedSeed, 5)}>
                          Mua 5
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button variant="outline" onClick={() => buySeed(selectedSeed, 10)}>
                          Mua 10
                        </Button>
                      </motion.div>
                    </Group>
                  </SectionCard>
                </motion.div>

                {/* INVENTORY */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <SectionCard>
                    <Title order={6} c="white">📦 Túi đồ</Title>

                    <SimpleGrid cols={2} mt="md" spacing="sm">
                      {Object.values(SEED_DEFINITIONS).map((sd, idx) => (
                        <motion.div
                          key={sd.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Card
                            p="sm"
                            style={{
                              border: "1px solid rgba(255,255,255,0.15)",
                              background: "rgba(255,255,255,0.03)",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <Group gap="xs">
                              <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Image src={sd.img} width={42} alt={sd.name} />
                              </motion.div>
                              <div style={{ flex: 1 }}>
                                <Text fw={700} size="sm">{sd.emoji} {sd.name}</Text>
                                <Text size="xs" c="gray">Hiện có: {inventory[sd.id] ?? 0}</Text>
                              </div>
                            </Group>

                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                mt="xs"
                                size="xs"
                                fullWidth
                                disabled={(inventory[sd.id] ?? 0) <= 0}
                                style={gradientButtonStyle}
                                onClick={() => {
                                  const empty = plots.findIndex((p: Plot | null) => !p);
                                  if (empty === -1) {
                                    showNotification({ 
                                      color: "orange", 
                                      title: "Không còn ô trống!", 
                                      message: "Hãy thu hoạch cây hiện có để giải phóng ô" 
                                    });
                                    return;
                                  }

                                  setActivePlotIndex(empty);
                                  confirmPlant(sd.id);
                                }}
                              >
                                Trồng
                              </Button>
                            </motion.div>
                          </Card>
                        </motion.div>
                      ))}
                    </SimpleGrid>
                  </SectionCard>
                </motion.div>
              </Stack>
            </motion.div>
          </Grid.Col>
        </Grid>
      </motion.div>

      {/* ---------------- PLANT MODAL ---------------- */}
      <Modal
        opened={selectPlantModal}
        onClose={() => setSelectPlantModal(false)}
        centered
        title={`Trồng vào ô #${activePlotIndex !== null ? activePlotIndex + 1 : ""}`}
      >
        <SimpleGrid cols={2}>
          {Object.values(SEED_DEFINITIONS).map((sd) => {
            const stock = inventory[sd.id] ?? 0;

            return (
              <Card key={sd.id} p="sm" radius="md" style={glassCardStyle}>
                <Group>
                  <Image src={sd.img} width={48} />
                  <div>
                    <Text fw={600}>{sd.emoji} {sd.name}</Text>
                    <Text size="xs" c="gray">{sd.rarity} — {sd.growSec}s</Text>
                  </div>
                </Group>

                <Group justify="space-between" mt="xs">
                  <Text size="sm">Stock: {stock}</Text>

                  <Button
                    size="xs"
                    disabled={stock <= 0}
                    style={stock > 0 ? gradientButtonStyle : {}}
                    onClick={() => confirmPlant(sd.id)}
                  >
                    Trồng
                  </Button>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Modal>

      {/* ---------------- LOOTBOARD ---------------- */}
      <Modal
        opened={isLootboardOpen}
        onClose={() => setLootboardOpen(false)}
        size="xl"
        centered
        title="🎁 Mystery Box — Chọn 1 hộp"
      >
        <Group wrap="nowrap" gap="lg" style={{ overflowX: "auto" }}>
          {lootBoxes.map((box: LootBox, i: number) => (
            <motion.div key={box.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                onClick={() => openBox(i)}
                disabled={box.locked || box.opened}
                style={{
                  width: 120,
                  height: 160,
                  background: box.opened
                    ? "linear-gradient(180deg,#d1fae5,#a7f3d0)"
                    : box.locked
                      ? "#222"
                      : "linear-gradient(180deg,#3f1d66,#1b0e2e)",
                }}
              >
                {box.opened ? `+${box.points} AP` : box.locked ? "Locked" : "❓ Mở"}
              </Button>
            </motion.div>
          ))}
        </Group>
      </Modal>

      {/* ---------------- EFFECT POPUPS ---------------- */}
      <AnimatePresence>
        {effectPopup && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              boxShadow: `0 0 30px ${effectPopup.quality.color}40`,
            }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{
              position: "fixed",
              right: 20,
              top: 20,
              padding: 20,
              background: "linear-gradient(135deg, #0f2027, #1a3a2e)",
              borderRadius: 16,
              color: "#fff",
              border: `2px solid ${effectPopup.quality.color}`,
              zIndex: 2000,
              minWidth: 200,
              boxShadow: `0 8px 32px ${effectPopup.quality.color}40`,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              <Title order={5} c={effectPopup.quality.color} mb="xs">
                {effectPopup.quality.icon} {effectPopup.quality.label}
              </Title>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text size="lg" fw={600}>💰 +{effectPopup.coins} Coins</Text>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Text size="lg" fw={600} c={effectPopup.quality.color}>
                ✨ +{effectPopup.totalAP} AP
              </Text>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {harvestAllPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              boxShadow: "0 0 40px rgba(77, 225, 255, 0.4)",
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{
              position: "fixed",
              left: "50%",
              top: 20,
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #0f2027, #1a3a2e, #2d5a3d)",
              color: "white",
              padding: 24,
              borderRadius: 16,
              zIndex: 2000,
              border: "2px solid #22c55e",
              minWidth: 300,
              maxWidth: 400,
              boxShadow: "0 8px 32px rgba(34, 197, 94, 0.4)",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Title order={4} ta="center" mb="md">🌾 Harvest All!</Title>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text fw={700} size="xl" ta="center" mb="md">
                💰 {harvestAllPopup.coins} Coins — ✨ {harvestAllPopup.ap} AP
              </Text>
            </motion.div>

            <Stack gap="xs" mt="md">
              {harvestAllPopup.list.slice(0, 3).map((x: HarvestDetail, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Text size="sm">{x.emoji} {x.name} +{x.bonus} ({x.quality})</Text>
                </motion.div>
              ))}

              {harvestAllPopup.list.length > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Text size="sm" c="gray" ta="center" mt="xs">
                    ...và {harvestAllPopup.list.length - 3} cây khác
                  </Text>
                </motion.div>
              )}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

    </Container>
  );
}