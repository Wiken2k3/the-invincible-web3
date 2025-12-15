import { motion } from "framer-motion";

export default function Horse({ progress }: { progress: number }) {
  return (
    <motion.div
      animate={{ x: `${progress}%` }}
      transition={{ ease: "linear", duration: 0.3 }}
      style={{
        fontSize: 28,
      }}
    >
      🐎
    </motion.div>
  );
}
