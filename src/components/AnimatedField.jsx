import React, { useEffect, useRef } from "react";

/**
 * AnimatedField
 * - containerRef: React ref tới element chứa grid plots (position: relative)
 * - plots: array of plot objects (used to detect ready plots)
 *
 * Canvas overlays the container; pointerEvents set to none so underlying clicks vẫn hoạt động.
 */

export default function AnimatedField({ containerRef, plots }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particles = useRef([]);
  const lastTime = useRef(0);
  const spawnAcc = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    function resize() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * devicePixelRatio);
      canvas.height = Math.floor(rect.height * devicePixelRatio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    // helper: create particle
    function createParticle(x, y, color, size = 1.5, life = 1500) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.05,
        size: size + Math.random() * 1.5,
        life,
        born: performance.now(),
        color,
      });
    }

    // create background gentle particles
    function spawnBackground(dt, w, h) {
      spawnAcc.current += dt;
      // spawn rate scaled by area
      const rate = Math.max(0.8, (w * h) / 80000); // tuned
      const toSpawn = Math.floor(spawnAcc.current * rate * 0.02);
      if (toSpawn > 0) spawnAcc.current = 0;
      for (let i = 0; i < toSpawn; i++) {
        const x = Math.random() * w;
        const y = h + 10;
        const color = `rgba(160, 90, 255, ${0.08 + Math.random() * 0.12})`;
        createParticle(x, y, color, 1 + Math.random() * 2, 4000 + Math.random() * 3000);
      }
    }

    // sparkles on ready plots: compute plot centers from DOM children with [data-plot-index]
    function spawnSparklesOnReady() {
      const container = containerRef.current;
      if (!container) return;
      const nodes = container.querySelectorAll("[data-plot-index]");
      nodes.forEach((el) => {
        const idx = Number(el.getAttribute("data-plot-index"));
        if (Number.isNaN(idx)) return;
        const plot = plots[idx];
        if (plot && Date.now() >= plot.readyAt) {
          // spawn a few sparkles near the center of this element
          const rect = el.getBoundingClientRect();
          const contRect = container.getBoundingClientRect();
          const cx = rect.left - contRect.left + rect.width / 2;
          const cy = rect.top - contRect.top + rect.height / 3;
          const count = 3 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            const color = i % 2 ? "rgba(0,229,255,0.9)" : "rgba(162,89,255,0.95)";
            createParticle(cx + (Math.random() - 0.5) * rect.width * 0.4, cy + (Math.random() - 0.5) * rect.height * 0.2, color, 2 + Math.random() * 2, 800 + Math.random() * 800);
          }
        }
      });
    }

    function render(t) {
      if (!lastTime.current) lastTime.current = t;
      const dt = t - lastTime.current;
      lastTime.current = t;

      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;

      // fade background slightly
      ctx.clearRect(0, 0, w, h);

      // background gradient overlay (subtle)
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(10,8,20,0.6)");
      g.addColorStop(1, "rgba(5,6,12,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // spawn background particles
      spawnBackground(dt, w, h);

      // occasionally spawn sparkles on ready plots
      if (Math.random() < 0.08) spawnSparklesOnReady();

      // update particles
      const now = performance.now();
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        const age = now - p.born;
        const lifeRatio = 1 - age / p.life;
        if (lifeRatio <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        // physics
        p.x += p.vx * (dt * 0.06);
        p.y += p.vy * (dt * 0.06);
        p.vy += 0.0005 * (dt * 0.06); // gravity small

        // draw
        ctx.beginPath();
        const alpha = Math.max(0, Math.min(1, lifeRatio));
        ctx.fillStyle = p.color.replace(/[\d\.]+\)$/g, `${alpha})`) || `rgba(255,255,255,${alpha})`;
        // glow effect
        ctx.shadowBlur = 8 * lifeRatio;
        ctx.shadowColor = p.color;
        ctx.globalCompositeOperation = "lighter";
        ctx.arc(p.x, p.y, p.size * (0.6 + lifeRatio * 0.8), 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = "source-over";
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [containerRef, plots]);

  // render canvas absolutely positioned within container
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        mixBlendMode: "screen",
      }}
    />
  );
}
