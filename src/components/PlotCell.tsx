import { Card, Text, Image } from "@mantine/core";
import { motion } from "framer-motion";

export default function PlotCell({ plant }) {
  // plant = null | { rarity: "Common", icon: "...", progress: 0-100 }

  const borderGlow = {
    Common: "0 0 10px rgba(0,255,100,0.4)",
    Rare: "0 0 10px rgba(0,150,255,0.4)",
    Epic: "0 0 12px rgba(200,0,255,0.5)",
    Legendary: "0 0 15px rgba(255,180,0,0.6)",
  };

  return (
    <Card
      radius="md"
      withBorder
      h={140}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: plant ? borderGlow[plant.rarity] : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {!plant ? (
        <Text size="xs" c="gray.4" ta="center" mt={50}>
          Trống (click để trồng)
        </Text>
      ) : (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            filter: ["brightness(0.8)", "brightness(1.2)", "brightness(1)"],
          }}
          transition={{ duration: 0.8 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Image src={plant.icon} w={60} />
        </motion.div>
      )}

      {/* Progress bar (growth) */}
      {plant && (
        <div
          style={{
            width: `${plant.progress}%`,
            height: 4,
            background: "linear-gradient(90deg, #A259FF, #00E5FF)",
            position: "absolute",
            bottom: 0,
            left: 0,
            transition: "0.3s",
          }}
        />
      )}
    </Card>
  );
}
