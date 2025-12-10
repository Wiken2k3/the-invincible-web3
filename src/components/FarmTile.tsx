"use client";

import { memo } from "react";
import { motion } from "framer-motion";

/* =======================
   🎨 UI THEME (SUI STYLE)
======================= */
const theme = {
  glassBg: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.12)",
  activeBorder: "rgba(0,229,255,0.65)",
  glow: "rgba(0,229,255,0.35)",
  textMuted: "rgba(255,255,255,0.65)",
};

/* =======================
   🧱 MAIN TILE
======================= */
function FarmTile({ onPlant, seed, index }) {
  const hasSeed = Boolean(seed);

  return (
    <motion.div
      whileHover={{ scale: hasSeed ? 1.06 : 1.035 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      onClick={onPlant}
      style={{
        ...styles.tile,
        background: hasSeed ? styles.activeBg : theme.glassBg,
        border: hasSeed
          ? `2px solid ${theme.activeBorder}`
          : `2px dashed ${theme.glassBorder}`,
        boxShadow: hasSeed
          ? `0 0 20px ${theme.glow}`
          : "none",
      }}
    >
      {/* 🌌 Glow animation when planted */}
      {hasSeed && <GlowOverlay />}

      {/* 🌱 Seed or Empty State */}
      {hasSeed ? (
        <SeedImage seed={seed} index={index} />
      ) : (
        <EmptyState />
      )}
    </motion.div>
  );
}

export default memo(FarmTile);

/* =======================
   🌱 SUB COMPONENTS
======================= */

const GlowOverlay = () => (
  <motion.div
    initial={{ opacity: 0.18 }}
    animate={{ opacity: 0.35 }}
    transition={{
      repeat: Infinity,
      repeatType: "mirror",
      duration: 3,
      ease: "easeInOut",
    }}
    style={styles.glow}
  />
);

const SeedImage = ({ seed, index }) => (
  <motion.img
    key={`seed-${index}`}
    src={seed.image}
    alt="seed"
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 14 }}
    style={styles.seed}
  />
);

const EmptyState = () => (
  <motion.span
    key="empty"
    initial={{ opacity: 0.4 }}
    animate={{ opacity: 0.7 }}
    transition={{ duration: 1.2, yoyo: Infinity }}
    style={styles.empty}
  >
    ＋ Plant
  </motion.span>
);

/* =======================
   🎨 STYLES
======================= */

const styles = {
  tile: {
    width: "100%",
    height: 150,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
    backdropFilter: "blur(14px)",
  },

  activeBg: "linear-gradient(135deg,#0b1020,#121a35)",

  glow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top, rgba(0,229,255,0.35), transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  seed: {
    width: 64,
    height: 64,
    zIndex: 1,
  },

  empty: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.textMuted,
    zIndex: 1,
    letterSpacing: 0.2,
  },
};
