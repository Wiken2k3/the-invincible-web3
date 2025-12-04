// ============================================
//   FARMING GAME — FULL VERSION (Plant-select + Lootboard Carousel flip F3)
// ============================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Title,
  Text,
  Button,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  Box,
  Progress,
  NumberInput,
  Modal,
  Select,
  SimpleGrid,
  Container,
  Image,
  Center,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";

// Seed Images (ensure these exist)
import commonImg from "../assets/seeds/common.png";
import rareImg from "../assets/seeds/rare.png";
import epicImg from "../assets/seeds/epic.png";
import legendaryImg from "../assets/seeds/legendary.png";

/* -----------------------------------------
    EFFECT QUALITY CONFIG (HARVEST BONUS)
------------------------------------------ */

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

/* -----------------------------
   GAME CONFIG
----------------------------- */

const SEED_DEFINITIONS = {
  common: {
    id: "common",
    name: "Hạt bình thường",
    price: 10,
    growSec: 15,
    rarity: "Common",
    airdrop: 1,
    color: "green",
    img: commonImg,
  },
  rare: {
    id: "rare",
    name: "Hạt hiếm",
    price: 35,
    growSec: 30,
    rarity: "Rare",
    airdrop: 3,
    color: "lime",
    img: rareImg,
  },
  epic: {
    id: "epic",
    name: "Hạt cực hiếm",
    price: 120,
    growSec: 60,
    rarity: "Epic",
    airdrop: 8,
    color: "teal",
    img: epicImg,
  },
  legendary: {
    id: "legendary",
    name: "Hạt truyền thuyết",
    price: 400,
    growSec: 180,
    rarity: "Legendary",
    airdrop: 25,
    color: "yellow",
    img: legendaryImg,
  },
};

const MYSTERY_BOX = {
  price: 50,
  // distribution kept for older behavior if needed
  distribution: [
    { seed: "common", weight: 60 },
    { seed: "rare", weight: 25 },
    { seed: "epic", weight: 10 },
    { seed: "legendary", weight: 5 },
  ],
};

const STORAGE_KEY = "farm_game_v4"; // bump to keep compatibility safe

/* -----------------------
   LOAD / SAVE STATE
------------------------ */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/* -----------------------
   UTILS
------------------------ */

function uniqueRandomInts(count, min, max) {
  // Generate `count` unique integers between min and max inclusive.
  const set = new Set();
  const range = max - min + 1;
  if (count > range) count = range;
  while (set.size < count) {
    const v = Math.floor(Math.random() * range) + min;
    set.add(v);
  }
  return Array.from(set);
}

function randFromDistribution(dist) {
  const total = dist.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of dist) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return dist[0];
}

/* ======================================
            MAIN GAME COMPONENT
====================================== */

export default function GamePage() {
  const persisted = useMemo(() => loadState(), []);
  const [coins, setCoins] = useState(persisted?.coins ?? 100);
  const [airdropPoints, setAirdropPoints] = useState(persisted?.airdropPoints ?? 0);
  const [inventory, setInventory] = useState(
    persisted?.inventory ?? { common: 2, rare: 0, epic: 0, legendary: 0 }
  );
  const [plots, setPlots] = useState(persisted?.plots ?? Array(9).fill(null));
  const [selectedSeed, setSelectedSeed] = useState("common");
  const [isMysteryModalOpen, setMysteryModalOpen] = useState(false);

  /* New: plant selection modal */
  const [selectPlantModal, setSelectPlantModal] = useState(false);
  const [activePlotIndex, setActivePlotIndex] = useState(null);

  /* New: lootboard carousel modal */
  const [isLootboardOpen, setLootboardOpen] = useState(false);
  const [lootBoxes, setLootBoxes] = useState([]); // { id, points, opened }

  /* POPUP FOR EFFECT */
  const [effectPopup, setEffectPopup] = useState(null);
  const [harvestAllPopup, setHarvestAllPopup] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setPlots((p) => [...p]), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveState({ coins, airdropPoints, inventory, plots });
  }, [coins, airdropPoints, inventory, plots]);

  /* ------------------------
        BUY SEED
  ------------------------- */
  function buySeed(seedId, amount = 1) {
    const sd = SEED_DEFINITIONS[seedId];
    const cost = sd.price * amount;

    if (coins < cost)
      return showNotification({
        color: "red",
        title: "Không đủ tiền",
        message: `Bạn cần ${cost} Coins.`,
      });

    setCoins((c) => c - cost);
    setInventory((inv) => ({ ...inv, [seedId]: inv[seedId] + amount }));

    showNotification({
      color: "green",
      title: "Mua thành công",
      message: `Bạn đã mua ${amount} ${sd.name}.`,
    });
  }

  /* ------------------------
        PLANT (via modal selection)
  ------------------------- */

  function openSelectPlantModal(plotIndex) {
    setActivePlotIndex(plotIndex);
    setSelectPlantModal(true);
  }

  function confirmPlant(seedId) {
    const i = activePlotIndex;
    if (i === null) return;
    if (inventory[seedId] <= 0) {
      showNotification({ color: "orange", title: "Không còn hạt", message: "Bạn không có hạt này." });
      return;
    }
    // plant
    setPlots((prev) => {
      if (prev[i]) {
        showNotification({ color: "yellow", title: "Ô đã có cây" });
        return prev;
      }
      const sd = SEED_DEFINITIONS[seedId];
      const now = Date.now();
      const copy = prev.slice();
      copy[i] = { seedId, plantedAt: now, readyAt: now + sd.growSec * 1000 };
      return copy;
    });
    setInventory((inv) => ({ ...inv, [seedId]: inv[seedId] - 1 }));
    setSelectPlantModal(false);
    setActivePlotIndex(null);
    showNotification({ color: "green", title: "Đã trồng", message: `Bạn đã trồng ${SEED_DEFINITIONS[seedId].name}` });
  }

  /* ------------------------
        HARVEST
  ------------------------- */
  function harvest(i) {
    setPlots((prev) => {
      const p = prev[i];
      if (!p) return prev;

      const now = Date.now();
      if (now < p.readyAt) {
        showNotification({ color: "yellow", title: "Cây chưa chín" });
        return prev;
      }

      const sd = SEED_DEFINITIONS[p.seedId];
      const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));

      const quality = pickEffectQuality();
      const bonus = quality.bonus;

      setCoins((c) => c + baseReward);
      setAirdropPoints((a) => a + sd.airdrop + bonus);

      // SHOW POPUP
      setEffectPopup({
        seed: sd,
        base: sd.airdrop,
        quality,
        coins: baseReward,
        bonus,
      });
      setTimeout(() => setEffectPopup(null), 1400);

      return prev.map((x, idx) => (idx === i ? null : x));
    });
  }

  /* ------------------------
     HARVEST ALL (Popup Tổng)
  ------------------------- */
  function harvestAll() {
    let totalCoins = 0;
    let totalAP = 0;
    const details = [];

    const now = Date.now();

    setPlots((prev) => {
      const newPlots = prev.map((p) => {
        if (!p || now < p.readyAt) return p;

        const sd = SEED_DEFINITIONS[p.seedId];
        const baseReward = Math.round(sd.price * (0.6 + Math.random() * 0.8));
        const q = pickEffectQuality();

        totalCoins += baseReward;
        totalAP += sd.airdrop + q.bonus;

        details.push({
          name: sd.name,
          quality: q.label,
          bonus: q.bonus,
        });

        return null;
      });

      if (details.length > 0) {
        setCoins((c) => c + totalCoins);
        setAirdropPoints((a) => a + totalAP);

        setHarvestAllPopup({
          coins: totalCoins,
          ap: totalAP,
          list: details,
        });
        setTimeout(() => setHarvestAllPopup(null), 2200);
      }

      return newPlots;
    });
  }

  /* ------------------------
      LOOTBOARD (Mystery Box Carousel style B)
  ------------------------- */

  function openLootboard() {
    // Pay price first
    if (coins < MYSTERY_BOX.price) {
      return showNotification({ color: "red", title: "Không đủ Coins", message: `Cần ${MYSTERY_BOX.price} Coins để mở Lootboard.` });
    }
    setCoins((c) => c - MYSTERY_BOX.price);

    // create 10 unique random integers 10..100
    const points = uniqueRandomInts(10, 10, 100);
    const boxes = points.map((pt, idx) => ({ id: idx, points: pt, opened: false }));
    setLootBoxes(boxes);
    setLootboardOpen(true);
  }

  function openBox(idx) {
    setLootBoxes((prev) => {
      const copy = prev.slice();
      const box = copy[idx];
      if (!box || box.opened) return prev;
      copy[idx] = { ...box, opened: true };
      // grant points (AP)
      setAirdropPoints((a) => a + box.points);
      showNotification({ color: "green", title: `Mở hộp +${box.points} AP`, message: `Bạn nhận ${box.points} Airdrop Points` });
      return copy;
    });
  }

  /* ------------------------
      RESET GAME
  ------------------------- */
  function resetGame() {
    setCoins(100);
    setAirdropPoints(0);
    setInventory({ common: 2, rare: 0, epic: 0, legendary: 0 });
    setPlots(Array(9).fill(null));
    setSelectPlantModal(false);
    setActivePlotIndex(null);
    setLootboardOpen(false);
    setLootBoxes([]);
    showNotification({ color: "orange", title: "Game đã reset" });
  }

  function plotProgress(p) {
    if (!p) return 0;
    const sd = SEED_DEFINITIONS[p.seedId];
    const total = sd.growSec * 1000;
    const elapsed = Date.now() - p.plantedAt;
    return Math.min(100, Math.round((elapsed / total) * 100));
  }

  /* ======================================
              RENDER UI
  ====================================== */

  return (
    <Container size="xl" style={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <Group position="apart" mb="xl">
        <Title order={1} style={{ color: "#2d6a4f", fontWeight: 800 }}>
          🌾 Farm Garden
        </Title>

        <Group>
          <Text>💰 {coins}</Text>
          <Text>🌟 {airdropPoints} AP</Text>

          <Button color="green" onClick={openLootboard}>
            🎁 Mystery Boxes
          </Button>

          <Button variant="outline" onClick={resetGame}>
            Reset
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg">
        {/* FIELD */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card p="lg" radius="lg" style={{ background: "#f2e9d8" }}>
            <Title order={3} mb="md" style={{ color: "#774936" }}>
              🪵 Khu đất trồng trọt
            </Title>

            <SimpleGrid cols={3} spacing="md">
              {plots.map((p, i) => {
                const sd = p && SEED_DEFINITIONS[p.seedId];
                const ready = p && Date.now() >= p.readyAt;

                return (
                  <Card key={i} p="md" radius="md" style={{ background: "#fff6eb" }}>
                    <Text size="xs" c="brown">
                      Ô #{i + 1}
                    </Text>

                    {p ? (
                      <>
                        <Image src={sd.img} height={55} mt="xs" />
                        <Text fw={700}>{sd.name}</Text>
                        <Badge color={sd.color}>{sd.rarity}</Badge>

                        <Progress value={plotProgress(p)} mt="sm" />
                        <Text size="xs">{ready ? "🌿 Sẵn sàng!" : `${plotProgress(p)}%`}</Text>

                        <Button fullWidth size="xs" mt="sm" onClick={() => harvest(i)}>
                          Thu hoạch
                        </Button>
                      </>
                    ) : (
                      <>
                        <Text mt="lg" c="gray">
                          Ô trống
                        </Text>
                        <Button
                          fullWidth
                          size="xs"
                          mt="sm"
                          onClick={() => {
                            // open plant selection modal for this plot
                            openSelectPlantModal(i);
                          }}
                        >
                          Trồng hạt
                        </Button>
                      </>
                    )}
                  </Card>
                );
              })}
            </SimpleGrid>

            <Button mt="lg" color="green" fullWidth onClick={harvestAll}>
              🌾 Thu hoạch tất cả
            </Button>
          </Card>
        </Grid.Col>

        {/* RIGHT SIDE */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="lg">
            {/* SHOP */}
            <Card p="md" radius="lg" style={{ background: "#eaf4e2" }}>
              <Title order={4}>🛒 Shop — Hạt giống</Title>

              <Group mt="md" align="end">
                <Select
                  value={selectedSeed}
                  onChange={setSelectedSeed}
                  data={Object.values(SEED_DEFINITIONS).map((s) => ({
                    value: s.id,
                    label: `${s.name} — ${s.price} Coins`,
                  }))}
                  style={{ flex: 1 }}
                />

                <NumberInput
                  value={1}
                  readOnly
                  hideControls
                  style={{ width: 80 }}
                />

                <Button color="green" onClick={() => buySeed(selectedSeed, 1)}>
                  Mua 1
                </Button>
              </Group>
            </Card>

            {/* INVENTORY */}
            <Card p="md" radius="lg" style={{ background: "#eaf4e2" }}>
              <Title order={4}>🎒 Túi đồ</Title>

              <Stack mt="md">
                {Object.values(SEED_DEFINITIONS).map((sd) => (
                  <Group key={sd.id} position="apart">
                    <Group>
                      <Image src={sd.img} height={40} />
                      <div>
                        <Text fw={700}>{sd.name}</Text>
                        <Badge color={sd.color}>{sd.rarity}</Badge>
                      </div>
                    </Group>

                    <Group>
                      <Text fw={700}>{inventory[sd.id]}</Text>
                      <Button
                        size="xs"
                        onClick={() => {
                          const empty = plots.findIndex((p) => !p);
                          if (empty === -1)
                            return showNotification({ color: "orange", title: "Hết ô trống" });
                          // open plant modal and auto-select this seed for convenience
                          setActivePlotIndex(empty);
                          setSelectPlantModal(true);
                          setSelectedSeed(sd.id);
                        }}
                      >
                        Auto
                      </Button>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Card>

            {/* AIRDROP */}
            <Card p="md" radius="lg" style={{ background: "#fffbe6" }}>
              <Title order={4}>✨ Airdrop Points</Title>
              <Text mt="xs">Tổng điểm: {airdropPoints}</Text>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* ------------------------------
            Plant selection modal
         ------------------------------ */}
      <Modal
        opened={selectPlantModal}
        onClose={() => {
          setSelectPlantModal(false);
          setActivePlotIndex(null);
        }}
        title="Chọn hạt để trồng"
        centered
      >
        <Text size="sm" c="dimmed" mb="sm">
          Chọn loại hạt bạn muốn trồng vào ô #{activePlotIndex !== null ? activePlotIndex + 1 : ""}
        </Text>

        <Stack>
          {Object.values(SEED_DEFINITIONS).map((sd) => {
            const count = inventory[sd.id] ?? 0;
            return (
              <Card key={sd.id} withBorder p="xs" radius="md" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Group>
                  <Image src={sd.img} height={36} />
                  <div>
                    <Text fw={700}>{sd.name}</Text>
                    <Text size="xs" c="dimmed">{sd.rarity} • Grow {sd.growSec}s</Text>
                  </div>
                </Group>

                <Group>
                  <Text>{count}</Text>
                  <Button
                    size="xs"
                    disabled={count <= 0}
                    onClick={() => confirmPlant(sd.id)}
                  >
                    Trồng
                  </Button>
                </Group>
              </Card>
            );
          })}
        </Stack>
      </Modal>

      {/* ------------------------------
            Lootboard (Carousel flip)
         ------------------------------ */}
      <Modal
        opened={isLootboardOpen}
        onClose={() => {
          setLootboardOpen(false);
          setLootBoxes([]);
        }}
        size="xl"
        centered
      >
        <Title order={4}>🎁 Mystery Lootboard</Title>
        <Text size="sm" c="dimmed" mt="xs">Click từng hộp để mở và nhận số điểm AP. Mỗi hộp chỉ mở 1 lần.</Text>

        <Box mt="md" style={{ overflowX: "auto", padding: "12px 6px" }}>
          <div style={{ display: "flex", gap: 16, padding: "8px 6px" }}>
            {lootBoxes.map((box, idx) => (
              <div
                key={box.id}
                onClick={() => openBox(idx)}
                style={{
                  perspective: 800,
                  width: 140,
                  height: 180,
                }}
              >
                <div
                  className={`flip-card ${box.opened ? "flipped" : ""} ${!box.opened ? "glow" : ""}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    cursor: box.opened ? "default" : "pointer",
                    borderRadius: 12,
                  }}
                >
                  {/* front */}
                  <div className="flip-card-inner" style={{ width: "100%", height: "100%", borderRadius: 12 }}>
                    <div className="flip-card-front" style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#2b6e2b",
                      color: "#fff",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                      fontWeight: 700,
                      fontSize: 20,
                      userSelect: "none",
                    }}>
                      Hộp
                    </div>

                    {/* back */}
                    <div className="flip-card-back" style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 12,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fff",
                      color: "#222",
                      boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
                      transformStyle: "preserve-3d"
                    }}>
                      <Text fw={800} size="xl" style={{ marginBottom: 8 }}>{box.points} AP</Text>
                      <Text size="xs" c="dimmed">Đã mở</Text>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Box>

        <Divider my="sm" />
        <Group position="apart">
          <Text size="sm" c="dimmed">Giá mở Lootboard: {MYSTERY_BOX.price} Coins</Text>
          <Button variant="outline" onClick={() => { setLootboardOpen(false); setLootBoxes([]); }}>Đóng</Button>
        </Group>
      </Modal>

      {/* ------------------------------
            Single effect popup (harvest)
         ------------------------------ */}
      <Modal opened={!!effectPopup} onClose={() => setEffectPopup(null)} centered withCloseButton={false} radius="lg">
        {effectPopup && (
          <Box style={{ textAlign: "center", animation: "bounce 0.4s ease" }}>
            <Text size="xl">
              {effectPopup.quality.icon} {effectPopup.quality.label}!
            </Text>
            <Text>Cây: {effectPopup.seed.name}</Text>
            <Text>+{effectPopup.coins} Coins</Text>
            <Text>+{effectPopup.base + effectPopup.bonus} AP</Text>
          </Box>
        )}
      </Modal>

      {/* Harvest all popup */}
      <Modal opened={!!harvestAllPopup} onClose={() => setHarvestAllPopup(null)} centered radius="lg" withCloseButton={false}>
        {harvestAllPopup && (
          <Box style={{ animation: "bounce 0.4s ease" }}>
            <Title order={4}>🌾 Thu hoạch tất cả!</Title>

            <Text mt="xs">+{harvestAllPopup.coins} Coins</Text>
            <Text>+{harvestAllPopup.ap} AP</Text>

            <Box mt="md">
              {harvestAllPopup.list.map((i, idx) => (
                <Text key={idx}>
                  {i.name} — {i.quality} {i.bonus ? `(Bonus +${i.bonus})` : ""}
                </Text>
              ))}
            </Box>
          </Box>
        )}
      </Modal>
    </Container>
  );
}

/* ------------------------
   STYLES (flip + glow + bounce)
   appended to head at runtime
------------------------ */
(function injectStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
/* bounce used for small popups */
@keyframes bounce {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}

/* flip-card base */
.flip-card {
  perspective: 900px;
}
.flip-card .flip-card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 700ms cubic-bezier(.2,.9,.3,1);
  border-radius: 12px;
}
.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

/* front/back faces */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}
.flip-card-back {
  transform: rotateY(180deg);
}

/* glow for unopened boxes (F3 behavior) */
.flip-card.glow .flip-card-front {
  box-shadow: 0 10px 30px rgba(100,200,255,0.12);
  transition: box-shadow 220ms ease, transform 220ms ease;
}
.flip-card.glow:hover .flip-card-front {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 46px rgba(100,200,255,0.18);
}

/* small responsive tweaks */
@media (max-width: 700px) {
  .flip-card { width: 120px !important; height: 150px !important; }
}
`;
  document.head.appendChild(style);
})();
