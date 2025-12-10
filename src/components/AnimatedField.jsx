import { useEffect, useRef } from "react";

/**
 * AnimatedField (Web3 / Sui style)
 * - Overlay canvas cho farm grid
 * - Glow + particle nhẹ khi plot sẵn sàng
 * - pointerEvents: none (không ảnh hưởng UI)
 */

const dpr = window.devicePixelRatio || 1;

export default function AnimatedField({ containerRef, plots }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particles = useRef([]);
  const lastTime = useRef(0);
  const spawnAcc = useRef(0);

  /* =========================
     🔧 CANVAS SETUP
  ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    const resize = () => {
      const r = container.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    /* =========================
       ✨ PARTICLE HELPERS
    ========================= */
    const spawn = (x, y, color, size = 2, life = 1200) => {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.4 - Math.random() * 0.3,
        size,
        life,
        born: performance.now(),
        color,
      });
    };

    const spawnBackground = (dt, w, h) => {
      spawnAcc.current += dt;
      if (spawnAcc.current < 200) return;
      spawnAcc.current = 0;

      spawn(
        Math.random() * w,
        h + 12,
        "rgba(162,89,255,0.12)",
        1.5,
        5000
      );
    };

    const spawnReadyGlow = () => {
      const nodes = container.querySelectorAll("[data-plot-index]");
      nodes.forEach((el) => {
        const i = Number(el.dataset.plotIndex);
        const plot = plots[i];
        if (!plot || Date.now() < plot.readyAt) return;

        const r = el.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        const cx = r.left - c.left + r.width / 2;
        const cy = r.top - c.top + r.height / 3;

        for (let j = 0; j < 3; j++) {
          spawn(
            cx + (Math.random() - 0.5) * r.width * 0.4,
            cy,
            j % 2
              ? "rgba(0,229,255,0.9)"
              : "rgba(162,89,255,0.9)",
            2 + Math.random() * 2,
            800
          );
        }
      });
    };

    /* =========================
       🎥 RENDER LOOP
    ========================= */
    const render = (t) => {
      const dt = t - (lastTime.current || t);
      lastTime.current = t;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // subtle dark overlay
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(12,10,24,0.6)");
      g.addColorStop(1, "rgba(6,8,16,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      spawnBackground(dt, w, h);
      if (Math.random() < 0.06) spawnReadyGlow();

      const now = performance.now();
      particles.current = particles.current.filter((p) => {
        const life = 1 - (now - p.born) / p.life;
        if (life <= 0) return false;

        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.vy += 0.0006 * dt;

        ctx.beginPath();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 12 * life;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/g, `${life})`);
        ctx.arc(p.x, p.y, p.size * (0.7 + life), 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.globalCompositeOperation = "source-over";
        return true;
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [containerRef, plots]);

  /* =========================
     🎨 CANVAS LAYER
  ========================= */
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        mixBlendMode: "screen",
      }}
    />
  );
}
