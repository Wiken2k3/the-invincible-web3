import { motion } from "framer-motion";

export default function Dice({ value }: { value: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
      style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        background: "#0ea5e9",
        color: "#fff",
        fontSize: 32,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {value}
    </motion.div>
  );
}
