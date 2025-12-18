import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { SYMBOLS } from "./symbols";
import type { SymbolType } from "./symbols";

interface ReelProps {
  finalSymbol: SymbolType | null;
  spinning: boolean;
  delay: number;
}

export default function Reel({ finalSymbol, spinning, delay }: ReelProps) {
  const controls = useAnimation();
  // Tạo dải băng ảo gồm 30 icon ngẫu nhiên để tạo hiệu ứng trượt dài
  const [strip] = useState(() => 
    [...Array(30)].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  );

  useEffect(() => {
    if (spinning) {
      // Quay vô tận khi đang đợi transaction
      controls.start({
        y: [0, -1500],
        transition: { duration: 0.5, repeat: Infinity, ease: "linear" }
      });
    } else if (finalSymbol) {
      // Dừng lại tại icon mục tiêu với hiệu ứng nảy nhẹ (backOut)
      controls.start({
        y: 0,
        transition: { 
          duration: 2, 
          delay: delay, 
          ease: [0.45, 0.05, 0.55, 0.95] // Hiệu ứng mượt mà
        }
      });
    }
  }, [spinning, finalSymbol, controls, delay]);

  return (
    <div style={{ 
      width: 90, height: 100, overflow: 'hidden', 
      background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid #444' 
    }}>
      <motion.div animate={controls} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Kết quả thực tế sẽ nằm ở đây khi y = 0 */}
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
          {finalSymbol?.icon || "❓"}
        </div>
        {/* Dải băng icon giả để tạo hiệu ứng thị giác */}
        {strip.map((s, i) => (
          <div key={i} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            {s.icon}
          </div>
        ))}
      </motion.div>
    </div>
  );
}