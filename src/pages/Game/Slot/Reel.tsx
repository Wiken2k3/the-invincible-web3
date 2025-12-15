import { motion } from "framer-motion";

export default function Reel({ icon }: { icon: string }) {
  return (
    <motion.div
      animate={{ y: [0, -80, 0] }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        width: 90,
        height: 90,
        fontSize: 48,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(14,165,233,0.4)",
      }}
    >
      {icon}
    </motion.div>
  );
}
    