import { motion } from "framer-motion";
import { Box, Text } from "@mantine/core";

export default function Horse({
  progress,
  highlight,
  name,
  id,
}: {
  progress: number;
  highlight?: boolean;
  name?: string;
  id?: number;
}) {
  const pct = Math.min(Math.max(progress, 0), 100);

  return (
    <Box style={{ position: "relative", height: 56, display: "flex", alignItems: "center" }}>
      <Box
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 18,
          height: 12,
          background: "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 100%)",
          borderRadius: 8,
        }}
      />

      <Box style={{ width: 60, textAlign: "left", paddingLeft: 6, zIndex: 3 }}>
        <Text size="xs" c={highlight ? "green" : "gray"} fw={700}>
          {id}. {name}
        </Text>
      </Box>

      <Box style={{ position: "relative", flex: 1, height: 56 }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 6, background: "linear-gradient(180deg,#fff,#eee)", opacity: 0.06 }} />

        <motion.div
          animate={{ x: `calc(${pct}% - 20px)`, y: [0, -6, 0] }}
          transition={{ x: { ease: "linear", duration: 0.12 }, y: { repeat: Infinity, duration: 0.6 } }}
          style={{
            position: "absolute",
            top: 6,
            left: 0,
            fontSize: 30,
            transform: "translateX(0)",
            zIndex: 4,
            textShadow: "0 2px 6px rgba(0,0,0,0.4)",
            filter: highlight ? "drop-shadow(0 6px 8px rgba(34,197,94,0.25))" : undefined,
          }}
        >
          🐎
        </motion.div>
      </Box>
    </Box>
  );
}
