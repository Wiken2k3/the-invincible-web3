import { useEffect, useRef } from "react";
import { WHEEL_ITEMS } from "./wheel.config";

export default function WheelCanvas({
  angle,
}: {
  angle: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 300;
    const center = size / 2;
    const arc = (2 * Math.PI) / WHEEL_ITEMS.length;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    WHEEL_ITEMS.forEach((item, i) => {
      ctx.beginPath();
      ctx.fillStyle = item.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, center, i * arc, (i + 1) * arc);
      ctx.fill();

      ctx.save();
      ctx.rotate(i * arc + arc / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(item.label, 90, 5);
      ctx.restore();
    });

    ctx.restore();
  }, [angle]);

  return <canvas ref={ref} width={300} height={300} />;
}
