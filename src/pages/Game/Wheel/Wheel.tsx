import { motion } from "framer-motion";
import { WHEEL_ITEMS } from "./wheel.config";

export default function Wheel({ rotate = 0 }: { rotate?: number }) {
  const sliceDeg = 360 / WHEEL_ITEMS.length;

  return (
    <motion.div
      animate={{ rotate }}
      transition={{ duration: 3.5, ease: "easeOut" }}
      style={{
        width: 260,
        height: 260,
        borderRadius: "50%",
        border: "8px solid #0ea5e9",
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      {WHEEL_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "50%",
            height: "50%",
            background: item.color,
            transform: `rotate(${sliceDeg * i}deg)`,
            transformOrigin: "100% 100%",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />
      ))}

      {/* Tâm vòng quay */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 16,
          height: 16,
          background: "#0ea5e9",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </motion.div>
  );
}
