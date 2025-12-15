import { motion } from "framer-motion";
import { Text, Group } from "@mantine/core";

export default function DiceRoll({ dices }: { dices: number[] }) {
  return (
    <Group gap="lg" justify="center" mt={20}>
      {dices.map((d, i) => (
        <motion.div
          key={i}
          animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6 }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {d}
        </motion.div>
      ))}
    </Group>
  );
}
