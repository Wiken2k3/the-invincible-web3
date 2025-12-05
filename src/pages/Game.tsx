"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { motion, AnimatePresence } from "framer-motion";

// Giả định các import này là đúng đường dẫn của bạn
// Hãy đảm bảo các file ảnh/component FarmTile tồn tại
import FarmTile from "../components/FarmTile";

// Seed Images
import commonImg from "../assets/seeds/common.png";
import rareImg from "../assets/seeds/rare.png";
import epicImg from "../assets/seeds/epic.png";
import legendaryImg from "../assets/seeds/legendary.png";

/* -------------------------------- EFFECT CONFIG ------------------------------ */
const EFFECT_QUALITY = [
  { id: "normal", label: "Thường", weight: 40, bonus: 0, color: "gray", icon: "🌱" },
  { id: "bronze", label: "Đồng", weight: 30, bonus: 5, color: "#cd7f32", icon: "🥉" },
  { id: "silver", label: "Bạc", weight: 20, bonus: 10, color: "#c0c0c0", icon: "🥈" },
  { id: "gold", label: "Vàng", weight: 8, bonus: 30, color: "#ffd700", icon: "🥇" },
  { id: "diamond", label: "Kim Cương", weight: 2, bonus: 50, color: "#4de1ff", icon: "💎" },
];

function pickEffectQuality() {
  const total = EFFECT_QUALITY.reduce((s, q) => s + q.weight, 0);
  let r = Math.random() * total;
  for (const q of EFFECT_QUALITY) {
    if (r < q.weight) return q;
    r -= q.weight;
  }
  return EFFECT_QUALITY[0];
}

/* ----------------------------- GAME CONFIG ----------------------------- */
const SEED_DEFINITIONS = {
  common: { id: "common", name: "Hạt bình thường", price: 10, growSec: 15, rarity: "Common", airdrop: 1, color: "green", img: commonImg, emoji: "🌱" },
  rare: { id: "rare", name: "Hạt hiếm", price: 35, growSec: 30, rarity: "Rare", airdrop: 3, color: "lime", img: rareImg, emoji: "🌿" },
  epic: { id: "epic", name: "Hạt cực hiếm", price: 120, growSec: 60, rarity: "Epic", airdrop: 8, color: "teal", img: epicImg, emoji: "🌺" },
  legendary: { id: "legendary", name: "Hạt truyền thuyết", price: 400, growSec: 180, rarity: "Legendary", airdrop: 25, color: "yellow", img: legendaryImg, emoji: "🌸" },
};

const MYSTERY_BOX = {
  price: 50,
  minCoinToOpen: 500, // New rule: Need at least 500 coins to access lootboard
};

const STORAGE_KEY = "farm_game_v6_web3_ui_clean";
const NUM_PLOTS = 9;

/* ----------------------- LOAD / SAVE STATE ------------------------ */
function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Tự động thông báo Auto-save
    // showNotification({ color: "gray", title: "💾 Auto-save", message: "Trạng thái trò chơi đã được lưu.", autoClose: 3000 });
  } catch {}
}

/* ----------------------- UTILS ------------------------ */
// Hàm tạo số nguyên ngẫu nhiên duy nhất
function uniqueRandomInts(count, min, max) {
  const set = new Set();
  const range = max - min + 1;
  if (count > range) count = range;
  while (set.size < count) {
    const v = Math.floor(Math.random() * range) + min;
    set.add(v);
  }
  return Array.from(set);
}

/* ----------------------- UI COMPONENTS (Mockup for Glassmorphism/Gradient) ------------------------ */
const glassCardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
};

const gradientButtonStyle = {
  background: "linear-gradient(90deg, #A259FF, #00E5FF)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(90deg, #8a4be6, #00c7e0)",
    transform: "scale(1.03)",
  },
};

const FarmPlotCard = ({ children }) => (
  <Card radius="lg" padding="lg" style={glassCardStyle}>
    {children}
  </Card>
);

const SectionCard = ({ children }) => (
  <Card radius="lg" p="lg" style={{ ...glassCardStyle, background: "rgba(255, 255, 255, 0.03)" }}>
    {children}
  </Card>
);

const HeroBox = ({ children }) => (
  <Box
    style={{
      background:
        "radial-gradient(circle at 20% 10%, rgba(162,89,255,0.1), transparent 30%), radial-gradient(circle at 80% 90%, rgba(0,229,255,0.08), transparent 30%), linear-gradient(180deg,#08060a,#0e0b14)",
      padding: "36px 0",
      borderRadius: 12,
      marginBottom: 18,
    }}
  >
    {children}
  </Box>
);

/* ====================================== MAIN GAME ===================================================== */
export default function GamePage() {
  const persisted = useMemo(() => loadState(), []);
  const [coins, setCoins] = useState(persisted?.coins ?? 100);
  const [airdropPoints, setAirdropPoints] = useState(persisted?.airdropPoints ?? 0);
  const [inventory, setInventory] = useState(persisted?.inventory ?? { common: 2, rare: 0, epic: 0, legendary: 0 });
  const [plots, setPlots] = useState(persisted?.plots ?? Array(NUM_PLOTS).fill(null));

  const [selectedSeed, setSelectedSeed] = useState("common");

  // Plant modal
  const [selectPlantModal, setSelectPlantModal] = useState(false);
  const [activePlotIndex, setActivePlotIndex] = useState(null);

  // Lootboard
  const [isLootboardOpen, setLootboardOpen] = useState(false);
  const [lootBoxes, setLootBoxes] = useState([]); // {id, points, opened, locked}

  // Effects Popups
  const [effectPopup, setEffectPopup] = useState(null);
  const [harvestAllPopup, setHarvestAllPopup] = useState(null);

  /* Rerender progress bars & Auto-save */
  useEffect(() => {
    // Rerender progress bars mỗi giây
    const t = setInterval(() => setPlots((p) => [...p]), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Auto-save: Tránh lưu quá thường xuyên. Thêm debounce/throttle nếu cần cho ứng dụng lớn hơn.
    saveState({ coins, airdropPoints, inventory, plots });
  }, [coins, airdropPoints, inventory, plots]);

  /* ------------------------ BUY SEED ------------------------- */
  const buySeed = useCallback((seedId, amount = 1) => {
    const sd = SEED_DEFINITIONS[seedId];
    if (!sd) return;

    const cost = sd.price * amount;

    if (coins < cost) {
      return showNotification({ color: "red", title: "🚫 Không đủ tiền", message: `Bạn cần ${cost} Coins.`, autoClose: 3000 });
    }

    setCoins((c) => c - cost);
    setInventory((inv) => ({ ...inv, [seedId]: (inv[seedId] || 0) + amount }));

    showNotification({ color: "green", title: "✅ Mua thành công", message: `Bạn đã mua ${amount} ${sd.name}.`, autoClose: 3000 });
  }, [coins]);

  /* ------------------------ PLANT ------------------------- */
  const openSelectPlantModal = useCallback((plotIndex) => {
    setActivePlotIndex(plotIndex);
    setSelectPlantModal(true);
  }, []);

  const confirmPlant = useCallback((seedId) => {
    const i = activePlotIndex;
    if (i === null) return;

    if ((inventory[seedId] || 0) <= 0) {
      showNotification({ color: "orange", title: "🚫 Không còn hạt", message: "Bạn không có hạt này.", autoClose: 3000 });
      return;
    }

    setPlots((prev) => {
      if (prev[i]) {
        showNotification({ color: "yellow", title: "🚫 Ô đã có cây", autoClose: 3000 });
        return prev;
      }

      const sd = SEED_DEFINITIONS[seedId];
      const now = Date.now();
      const copy = prev.slice();
      copy[i] = { seedId, plantedAt: now, readyAt: now + sd.growSec * 1000 };
      return copy;
    });

    setInventory((inv) => ({ ...inv, [seedId]: (inv[seedId] || 0) - 1 }));
    setSelectPlantModal(false);
    setActivePlotIndex(null);

    showNotification({ color: "blue", title: "🌱 Đã trồng", message: `Bạn đã trồng ${SEED_DEFINITIONS[seedId].name}`, autoClose: 3000 });
  }, [activePlotIndex, inventory]);

  /* ------------------------ HARVEST ------------------------- */
  const harvest = useCallback((i) => {
    setPlots((prev) => {
      const p = prev[i];
      if (!p) return prev;

      const now = Date.now();
      if (now < p.readyAt) {
        showNotification({ color: "yellow", title: "⚠️ Cây chưa chín", autoClose: 3000 });
        return prev;
      }

      const sd = SEED_DEFINITIONS[p.seedId];
      const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));
      const quality = pickEffectQuality();
      const bonus = quality.bonus;
      const totalAP = sd.airdrop + bonus;

      setCoins((c) => c + baseReward);
      setAirdropPoints((a) => a + totalAP);

      // Thêm Particle System (Giả lập bằng popup mượt mà)
      setEffectPopup({ seed: sd, base: sd.airdrop, quality, coins: baseReward, bonus: bonus, totalAP });
      setTimeout(() => setEffectPopup(null), 1400);

      showNotification({ color: "green", title: "💰 Thu hoạch thành công!", message: `Nhận +${baseReward} Coins & +${totalAP} AP.`, autoClose: 3000 });

      return prev.map((x, idx) => (idx === i ? null : x));
    });
  }, []);

  /* ------------------------ HARVEST ALL ------------------------- */
  const harvestAll = useCallback(() => {
    let totalCoins = 0;
    let totalAP = 0;
    const details = [];
    const now = Date.now();

    setPlots((prev) => {
      const harvestedIndices = [];
      const newPlots = prev.map((p, i) => {
        if (!p || now < p.readyAt) return p;

        const sd = SEED_DEFINITIONS[p.seedId];
        const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));
        const q = pickEffectQuality();
        const totalAirdrop = sd.airdrop + q.bonus;

        totalCoins += baseReward;
        totalAP += totalAirdrop;

        details.push({ name: sd.name, quality: q.label, bonus: q.bonus, emoji: sd.emoji });
        harvestedIndices.push(i);
        return null; // Harvested
      });

      if (details.length > 0) {
        setCoins((c) => c + totalCoins);
        setAirdropPoints((a) => a + totalAP);

        // Thêm Harvest All Popup
        setHarvestAllPopup({ coins: totalCoins, ap: totalAP, list: details });
        setTimeout(() => setHarvestAllPopup(null), 2500);

        showNotification({ color: "green", title: `🌾 Thu hoạch tất cả!`, message: `Tổng cộng +${totalCoins} Coins & +${totalAP} AP.`, autoClose: 3000 });
      } else {
        showNotification({ color: "orange", title: "⚠️ Không có cây nào sẵn sàng", message: "Hãy đợi cây chín.", autoClose: 3000 });
      }

      return newPlots;
    });
  }, []);

  /* ------------------------ LOOTBOARD ------------------------- */
  const openLootboard = useCallback(() => {
    // Rule 1: Need at least 500 coins to buy Mystery Box
    if (coins < MYSTERY_BOX.minCoinToOpen) {
      return showNotification({
        color: "red",
        title: "🚫 Không đủ Coins để mở Lootboard",
        message: `Bạn cần tối thiểu ${MYSTERY_BOX.minCoinToOpen} Coins.`,
        autoClose: 3000
      });
    }

    // Cost per open = 50 coins
    if (coins < MYSTERY_BOX.price) {
      return showNotification({
        color: "red",
        title: "🚫 Không đủ Coins",
        message: `Bạn cần ${MYSTERY_BOX.price} Coins để mở Mystery Box.`,
        autoClose: 3000
      });
    }

    // Deduct cost
    setCoins((c) => c - MYSTERY_BOX.price);

    // Generate 10 boxes (but user can open ONLY ONE)
    const points = uniqueRandomInts(10, 10, 100);
    const boxes = points.map((pt, idx) => ({
      id: idx,
      points: pt,
      opened: false,
      locked: false,
    }));

    setLootBoxes(boxes);
    setLootboardOpen(true);
  }, [coins]);

  /* ------------------------ OPEN BOX (Only 1 allowed) ------------------------- */
  const openBox = useCallback((idx) => {
    setLootBoxes((prev) => {
      const alreadyOpened = prev.some((b) => b.opened === true);

      if (alreadyOpened) {
        showNotification({
          color: "yellow",
          title: "Bạn chỉ được mở 1 hộp",
          message: "Các hộp khác đã bị khoá.",
          autoClose: 3000
        });
        return prev;
      }

      const copy = prev.slice();
      const box = copy[idx];

      if (!box || box.opened) return prev;

      copy[idx] = { ...box, opened: true };

      // Lock all other boxes
      for (let i = 0; i < copy.length; i++) {
        if (i !== idx) {
          copy[i].locked = true;
        }
      }

      setAirdropPoints((a) => a + box.points);

      showNotification({
        color: "grape",
        title: `🎉 Nhận ${box.points} Airdrop Points`,
        message: "Bạn đã mở Mystery Box!",
        autoClose: 3000
      });

      return copy;
    });
  }, []);

  /* ------------------------ RESET ------------------------- */
  const resetGame = useCallback(() => {
    if (!window.confirm("Bạn có chắc chắn muốn RESET TOÀN BỘ game không?")) return;
    setCoins(100);
    setAirdropPoints(0);
    setInventory({ common: 2, rare: 0, epic: 0, legendary: 0 });
    setPlots(Array(NUM_PLOTS).fill(null));
    setSelectPlantModal(false);
    setActivePlotIndex(null);
    setLootboardOpen(false);
    setLootBoxes([]);
    localStorage.removeItem(STORAGE_KEY);
    showNotification({ color: "red", title: "Game đã reset", message: "Chơi lại từ đầu.", autoClose: 3000 });
  }, []);

  /* ------------------------ HELPERS ------------------------- */
  const plotProgress = useCallback((p) => {
    if (!p) return 0;
    const sd = SEED_DEFINITIONS[p.seedId];
    const total = sd.growSec * 1000;
    const elapsed = Date.now() - p.plantedAt;
    return Math.min(100, Math.round((elapsed / total) * 100));
  }, []);

  /* ------------------------ RENDER ------------------------- */

  return (
    <Container size="xl" py="lg">

      {/* HERO & STATS - Tích hợp Gradient Background động */}
      <HeroBox>
        <Group position="apart" align="center" px="md">
          <Group spacing="xs">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <Title order={2} style={{ color: "#fff" }}>🌾 Farming Airdrop Game (2025)</Title>
              <Text color="dimmed" size="md">— Play • Earn • Claim</Text>
            </motion.div>
          </Group>

          <Group spacing="md">
            <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: "pointer" }}>
              <Badge color="yellow" variant="filled" size="xl" radius="md">💰 COINS: {coins}</Badge>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: "pointer" }}>
              <Badge color="teal" variant="filled" size="xl" radius="md">✨ AIRDROP: {airdropPoints}</Badge>
            </motion.div>

            <Button
              size="md"
              radius="xl"
              style={gradientButtonStyle} // Gradient button with hover effect
              onClick={openLootboard}
            >
              🎁 Mở 1 MYSTERY BOX ({MYSTERY_BOX.price} Coins)
            </Button>

            {/* <Button variant="outline" onClick={resetGame}>Reset</Button> */}
          </Group>
        </Group>
      </HeroBox>

      {/* MAIN CONTENT GRID - Responsive grid layout */}
      <Grid gutter="xl">

        {/* LEFT FIELD (7/12) */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <FarmPlotCard>
            <Group position="apart" mb="md">
              <Title order={4} style={{ color: "#fff" }}>🪴 Khu đất trồng trọt (9 ô)</Title>
              <Button size="sm" color="green" onClick={harvestAll}>🌾 Thu hoạch tất cả</Button>
            </Group>

            {/* Farm Grid - Responsive grid layout (Mantine SimpleGrid) */}
            <SimpleGrid
              cols={{ base: 2, xs: 3, sm: 3, md: 3 }}
              spacing="lg"
            >
              {plots.map((p, i) => {
                const seedDef = p ? SEED_DEFINITIONS[p.seedId] : null;
                const ready = p && Date.now() >= p.readyAt;
                const progress = plotProgress(p);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <FarmTile
                      seed={seedDef ? { id: seedDef.id, image: seedDef.img, name: seedDef.name, emoji: seedDef.emoji } : null}
                      index={i}
                      onPlant={() => (p ? harvest(i) : openSelectPlantModal(i))}
                      ready={ready}
                    />

                    <Stack spacing={4} mt={8}>
                      <Group position="apart">
                        <Text size="xs" color="dimmed" fw={500}>Ô #{i + 1}</Text>
                        {p ? (
                          <Text size="xs" fw={700} color={ready ? "green" : "blue"}>
                            {ready ? "✅ Sẵn sàng" : `${seedDef.emoji} Đang lớn`}
                          </Text>
                        ) : (
                          <Text size="xs" color="gray">Trống</Text>
                        )}
                      </Group>

                      {p && (
                        <Progress
                          size="lg"
                          value={progress}
                          radius="xl"
                          color={ready ? "teal" : "blue"}
                          style={{ transition: "width 1s ease-out" }} // Animated Progress bars
                        />
                      )}
                    </Stack>
                  </motion.div>
                );
              })}
            </SimpleGrid>
          </FarmPlotCard>
        </Grid.Col>

        {/* RIGHT SHOP & INVENTORY (5/12) */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>

            {/* SHOP */}
            <SectionCard>
              <Title order={5} mb="sm">🛒 Cửa hàng hạt giống</Title>

              <Select
                label="Chọn loại hạt"
                value={selectedSeed}
                onChange={(v) => setSelectedSeed(v)}
                data={Object.values(SEED_DEFINITIONS).map((s) => ({
                  value: s.id,
                  label: `${s.emoji} ${s.name} — ${s.price} Coins`,
                }))}
                mb="md"
              />

              <Group>
                <Button size="sm" style={gradientButtonStyle} onClick={() => buySeed(selectedSeed, 1)}>Mua 1</Button>
                <Button size="sm" color="green" variant="outline" onClick={() => buySeed(selectedSeed, 5)}>Mua 5</Button>
                <Button size="sm" color="green" variant="outline" onClick={() => buySeed(selectedSeed, 10)}>Mua 10</Button>
              </Group>
            </SectionCard>

            {/* INVENTORY */}
            <SectionCard>
              <Title order={6}>📦 Túi đồ</Title>
              <SimpleGrid cols={2} spacing="sm" mt="md">
                {Object.values(SEED_DEFINITIONS).map((sd) => (
                  <Card
                    key={sd.id}
                    p="sm"
                    radius="md"
                    withBorder
                    component={motion.div}
                    whileHover={{ scale: 1.05, rotate: 1 }} // Hover effect: Scale up, rotate
                    style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}
                  >
                    <Image src={sd.img} height={44} width={44} alt={sd.name} />
                    <div style={{ flex: 1 }}>
                      <Text fw={700}>{sd.emoji} {sd.name}</Text>
                      <Text size="xs" color="dimmed">Stock: **{inventory[sd.id] || 0}**</Text>
                    </div>
                    <Button
                      size="xs"
                      variant="filled"
                      disabled={(inventory[sd.id] || 0) <= 0}
                      onClick={() => {
                        // Tự động tìm ô trống gần nhất để trồng
                        const empty = plots.findIndex((pp) => !pp);
                        if (empty === -1) {
                          showNotification({ color: "orange", title: "Hết ô trống", autoClose: 3000 });
                          return;
                        }
                        setActivePlotIndex(empty);
                        confirmPlant(sd.id);
                      }}
                    >
                      Trồng
                    </Button>
                  </Card>
                ))}
              </SimpleGrid>
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* PLANT MODAL - Modal system mượt mà với backdrop blur (Mantine handles blur) */}
      <Modal
        opened={selectPlantModal}
        onClose={() => setSelectPlantModal(false)}
        centered
        title={`Chọn hạt để trồng vào Ô #${activePlotIndex + 1}`}
        styles={{ modal: { ...glassCardStyle } }}
      >
        <SimpleGrid cols={2}>
          {Object.values(SEED_DEFINITIONS).map((sd) => {
            const cnt = inventory[sd.id] || 0;
            return (
              <Card key={sd.id} p="sm" radius="md" withBorder>
                <Group position="apart" align="center">
                  <Group>
                    <Image src={sd.img} height={48} width={48} alt={sd.name} />
                    <div>
                      <Text fw={700}>{sd.emoji} {sd.name}</Text>
                      <Text size="xs" color="dimmed">{sd.rarity} • Grow {sd.growSec}s</Text>
                    </div>
                  </Group>
                  <Stack spacing={4} align="flex-end">
                    <Text size="sm">Stock: {cnt}</Text>
                    <Button
                      size="xs"
                      disabled={cnt <= 0}
                      onClick={() => confirmPlant(sd.id)}
                      style={cnt <= 0 ? {} : gradientButtonStyle}
                    >
                      Trồng
                    </Button>
                  </Stack>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Modal>

      {/* LOOTBOARD MODAL (UPDATED LOGIC) */}
      <Modal
        opened={isLootboardOpen}
        onClose={() => setLootboardOpen(false)}
        title="🎁 Mystery Box — Chọn 1 hộp duy nhất"
        size="xl"
        centered
        styles={{ modal: { ...glassCardStyle } }}
      >
        <Text size="sm" color="dimmed" mb="md">
          Bạn đã tốn **{MYSTERY_BOX.price} Coins** để mở Lootboard. Chỉ được mở duy nhất **1 hộp** để nhận **Airdrop Points**!
        </Text>

        <Box style={{ overflowX: "auto" }}>
          <Group spacing="lg" wrap="nowrap" py="sm">
            {lootBoxes.map((box, idx) => (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: box.opened ? 1 : 1.05, rotate: box.opened ? 0 : 2 }} // Hover effect: Scale up, rotate slightly
                style={{ minWidth: 120, height: 180 }}
              >
                <Button
                  fullWidth
                  radius="md"
                  disabled={box.locked || box.opened}
                  onClick={() => openBox(idx)}
                  style={{
                    height: "100%",
                    // Thêm gradient cho box chưa mở
                    background: box.opened
                      ? "linear-gradient(180deg, #e6fffa, #d1fae5)"
                      : box.locked
                        ? "#1f2937"
                        : "linear-gradient(180deg, #371d5b, #1d0f2c)", // Gradient box
                    color: box.opened ? "#04505a" : "#fff",
                    fontSize: 18,
                    fontWeight: 700,
                    boxShadow: box.opened ? "0 4px 15px rgba(4, 80, 90, 0.4)" : box.locked ? "none" : "0 4px 15px rgba(162, 89, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {box.opened
                    ? `+${box.points} AP`
                    : box.locked
                      ? "🔒 Đã khoá"
                      : "❓ Mở hộp"}
                </Button>
              </motion.div>
            ))}
          </Group>
        </Box>

        <Divider my="md" />
        <Group position="right">
          <Button variant="outline" onClick={() => { setLootboardOpen(false); setLootBoxes([]); }}>
            Đóng
          </Button>
        </Group>
      </Modal>

      {/* EFFECT POPUP - Visual feedback/Particle System (Single harvest) */}
      <AnimatePresence>
        {effectPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              right: 20,
              top: 24,
              zIndex: 999,
              background: "linear-gradient(180deg, #1f0b35, #0b1220)",
              color: "#fff",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(162, 89, 255, 0.6)",
              minWidth: 240,
              border: `1px solid ${effectPopup.quality.color}`,
              textAlign: "center"
            }}
          >
            <Title order={5} style={{ color: effectPopup.quality.color }}>{effectPopup.quality.icon} {effectPopup.quality.label} Quality!</Title>
            <Text size="sm">💰 +{effectPopup.coins} Coins</Text>
            <Text size="sm">✨ +{effectPopup.totalAP} AP (Bonus: {effectPopup.bonus})</Text>
            <Text size="xs" color="dimmed" mt={4}>Thu hoạch {effectPopup.seed.name}</Text>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HARVEST ALL POPUP - Visual feedback (Harvest All) */}
      <AnimatePresence>
        {harvestAllPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              top: 28,
              zIndex: 998,
              background: "linear-gradient(180deg, #072a1e, #0b1b2a)",
              color: "#fff",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,229,255,0.4)",
              minWidth: 320,
              textAlign: "center"
            }}
          >
            <Title order={4}>🎉 Thu hoạch {harvestAllPopup.list.length} cây!</Title>
            <Text size="lg" fw={700} mt={4}>💰 +{harvestAllPopup.coins} Coins • ✨ +{harvestAllPopup.ap} AP</Text>
            <Divider my="sm" variant="dotted" color="gray" />
            <Stack spacing={2} align="flex-start">
              {/* Thêm danh sách chi tiết */}
              {harvestAllPopup.list.slice(0, 3).map((item, index) => (
                <Text size="xs" key={index}>
                  {item.emoji} {item.name}: **+{item.bonus} AP** ({item.quality})
                </Text>
              ))}
              {harvestAllPopup.list.length > 3 && (
                <Text size="xs" color="dimmed">...và {harvestAllPopup.list.length - 3} loại khác.</Text>
              )}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}