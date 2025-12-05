"use client";
import { memo } from "react";
import { motion } from "framer-motion";

function FarmTile({ onPlant, seed, index }) {
  return (
    <motion.div
      whileHover={{ scale: seed ? 1.06 : 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      onClick={onPlant}
      style={{
        width: "100%",
        height: "150px",
        borderRadius: "16px",
        background: seed
          ? "linear-gradient(135deg, #18122B, #251E3E)"
          : "rgba(255,255,255,0.04)",
        border: seed
          ? "2px solid rgba(0, 255, 180, 0.6)"
          : "2px dashed rgba(255,255,255,0.15)",
        boxShadow: seed
          ? "0 0 18px rgba(0, 255, 150, 0.28)"
          : "0 0 0 rgba(0,0,0,0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Background glow */}
      {seed && (
        <motion.div
          initial={{ opacity: 0.18 }}
          animate={{ opacity: 0.32 }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            duration: 3,
          }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(0,255,200,0.25), transparent 70%)",
            borderRadius: "16px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Seed image or placeholder */}
      {seed ? (
        <motion.img
          key={`seed-${index}`}
          src={seed.image}
          alt="seed"
          style={{ width: 64, height: 64 }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      ) : (
        <motion.span
          key={`empty-${index}`}
          style={{ opacity: 0.7, color: "#ccc", fontSize: 14 }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.7 }}
        >
          + Trồng cây
        </motion.span>
      )}
    </motion.div>
  );
}

export default memo(FarmTile);
