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
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const gradientButtonStyle = {
  background: "linear-gradient(90deg, #A259FF, #00E5FF)",
  transition: "0.2s",
};

const FarmPlotCard = ({ children }: { children: React.ReactNode }) => <Card radius="lg" p="lg" style={glassCardStyle}>{children}</Card>;
const SectionCard = ({ children }: { children: React.ReactNode }) => <Card radius="lg" p="lg" style={glassCardStyle}>{children}</Card>;

const HeroBox = ({ children }: { children: React.ReactNode }) => (
  <Box
    style={{
      background:
        "radial-gradient(circle at 20% 10%, rgba(162,89,255,0.12), transparent 35%), radial-gradient(circle at 80% 90%, rgba(0,229,255,0.12), transparent 40%), linear-gradient(180deg,#0a0812,#111827)",
      padding: "32px 0",
      borderRadius: 12,
      marginBottom: 20,
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

  /* -------------------------------- AUTO UPDATE PROGRESS ------------------------------ */
  useEffect(() => {
    const t = setInterval(() => setPlots((p: (Plot | null)[]) => [...p]), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    saveState({ coins, airdropPoints, inventory, plots });
  }, [coins, airdropPoints, inventory, plots]);

  /* -------------------------------- BUY SEED ------------------------------ */
  const buySeed = useCallback((seedId: string, amount = 1) => {
    const sd = SEED_DEFINITIONS[seedId];
    if (!sd) return;

    const cost = sd.price * amount;
    if (coins < cost)
      return showNotification({ color: "red", title: "Không đủ Coins", message: `Cần ${cost} Coins` });

    setCoins((c: number) => c - cost);
    setInventory((inv: Record<string, number>) => ({ ...inv, [seedId]: (inv[seedId] || 0) + amount }));

    showNotification({ color: "green", title: "Mua thành công!", message: `Đã mua ${amount} ${sd.name}` });
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
      setTimeout(() => setEffectPopup(null), 1400);

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
      setTimeout(() => setHarvestAllPopup(null), 2600);

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
  return (
    <Container size="xl" py="lg">

      {/* ---------------- HERO ---------------- */}
      <HeroBox>
        <Group justify="space-between" px="md">
          <div>
            <Title order={2} fw={800} c="white">🌾 Farming Airdrop Game</Title>
            <Text size="sm" c="gray">Play • Earn • Claim</Text>
          </div>

          <Group>
            <Badge size="lg" color="yellow">💰 {coins}</Badge>
            <Badge size="lg" color="teal">✨ {airdropPoints}</Badge>

            <Button radius="xl" style={gradientButtonStyle} onClick={openLootboard}>
              🎁 Mở Mystery Box
            </Button>
          </Group>
        </Group>
      </HeroBox>

      {/* ---------------- MAIN GRID ---------------- */}
      <Grid gutter="xl">

        {/* LEFT FARM */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <FarmPlotCard>
            <Group justify="space-between" mb="sm">
              <Title order={4} c="white"> Khu trồng trọt</Title>
              <Button color="green" size="sm" onClick={harvestAll}>🌾 Harvest All</Button>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg">
              {plots.map((p: Plot | null, i: number) => {
                const def = p ? SEED_DEFINITIONS[p.seedId] : null;
                const ready = p && Date.now() >= p.readyAt;
                const progress = plotProgress(p);

                return (
                  <div key={i}>
                    <FarmTile
                      seed={def ? { id: def.id, image: def.img, name: def.name, emoji: def.emoji } : null}
                      index={i}
                      ready={!!ready}
                      onPlant={() => p ? harvest(i) : openSelectPlantModal(i)}
                    />

                    <Text size="xs" mt={6} c="gray">
                      {p ? (ready ? "✅ Sẵn sàng" : `${def?.emoji} Đang lớn`) : "Trống"}
                    </Text>

                    {p && (
                      <Progress
                        mt={5}
                        radius="xl"
                        size="sm"
                        value={progress}
                        color={ready ? "teal" : "blue"}
                      />
                    )}
                  </div>
                );
              })}
            </SimpleGrid>
          </FarmPlotCard>
        </Grid.Col>

        {/* RIGHT PANEL */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>

            {/* SHOP */}
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

              <Group>
                <Button style={gradientButtonStyle} onClick={() => buySeed(selectedSeed, 1)}>Mua 1</Button>
                <Button variant="outline" onClick={() => buySeed(selectedSeed, 5)}>Mua 5</Button>
                <Button variant="outline" onClick={() => buySeed(selectedSeed, 10)}>Mua 10</Button>
              </Group>
            </SectionCard>

            {/* INVENTORY */}
            <SectionCard>
              <Title order={6} c="white">📦 Túi đồ</Title>

              <SimpleGrid cols={2} mt="md">
                {Object.values(SEED_DEFINITIONS).map((sd) => (
                  <Card
                    key={sd.id}
                    p="sm"
                    component={motion.div}
                    whileHover={{ scale: 1.04 }}
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Group>
                      <Image src={sd.img} width={42} />
                      <div>
                        <Text fw={700}>{sd.emoji} {sd.name}</Text>
                        <Text size="xs" c="gray">Stock: {inventory[sd.id] ?? 0}</Text>
                      </div>
                    </Group>

                    <Button
                      mt="xs"
                      size="xs"
                      disabled={(inventory[sd.id] ?? 0) <= 0}
                      onClick={() => {
                        const empty = plots.findIndex((p: Plot | null) => !p);
                        if (empty === -1) return showNotification({ color: "orange", title: "Không còn ô trống!", message: "" });

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
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            style={{
              position: "fixed",
              right: 20,
              top: 20,
              padding: 16,
              background: "#0b1220",
              borderRadius: 12,
              color: "#fff",
              border: `1px solid ${effectPopup.quality.color}`,
              zIndex: 2000,
            }}
          >
            <Title order={5} c={effectPopup.quality.color}>
              {effectPopup.quality.icon} {effectPopup.quality.label}
            </Title>
            <Text>💰 +{effectPopup.coins} Coins</Text>
            <Text>✨ +{effectPopup.totalAP} AP</Text>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {harvestAllPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              left: "50%",
              top: 20,
              transform: "translateX(-50%)",
              background: "#0c1725",
              color: "white",
              padding: 20,
              borderRadius: 12,
              zIndex: 2000,
              border: "1px solid #4de1ff",
            }}
          >
            <Title order={4}>🌾 Harvest All!</Title>
            <Text fw={700} mt={4}>💰 {harvestAllPopup.coins} Coins — ✨ {harvestAllPopup.ap} AP</Text>

            {harvestAllPopup.list.slice(0, 3).map((x: HarvestDetail, i: number) => (
              <Text key={i} size="xs">{x.emoji} {x.name} +{x.bonus} ({x.quality})</Text>
            ))}

            {harvestAllPopup.list.length > 3 && (
              <Text size="xs" c="gray">...và {harvestAllPopup.list.length - 3} cây khác</Text>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </Container>
  );
}