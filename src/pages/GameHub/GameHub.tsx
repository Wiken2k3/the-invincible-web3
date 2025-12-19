import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { games } from "./games.config";
import React from "react";

/* ===================== 🎨 THEME ===================== */
const theme = {
  bg: "#030014",
  bgGradient: `
    radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.3) 0%, transparent 60%),
    radial-gradient(circle at 100% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 0% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    linear-gradient(180deg, #030014 0%, #090418 100%)
  `,
  border: "rgba(255, 255, 255, 0.1)",
  primary: "#22d3ee",
  secondary: "#a855f7",
  text: "#ffffff",
  muted: "#94a3b8",
};

/* ===================== ASSETS MAPPING ===================== */
const getGameAssets = (key: string) => {
  const k = (key || "").toLowerCase();
  if (k.includes("horse")) return { icon: "🐎", desc: "PvP Racing", tag: "POPULAR" };
  if (k.includes("mine")) return { icon: "💣", desc: "Strategic Sweeping", tag: "STRATEGY" };
  if (k.includes("slot")) return { icon: "🎰", desc: "Jackpot Spins", tag: "CLASSIC" };
  if (k.includes("tai") || k.includes("sic") || k.includes("dice")) return { icon: "🎲", desc: "Big Small Betting", tag: "TRADITIONAL" };
  if (k.includes("wheel")) return { icon: "🎡", desc: "Spin to Win", tag: "LUCK" };
  if (k.includes("poker")) return { icon: "🃏", desc: "Texas Hold'em", tag: "SKILL" };
  if (k.includes("plinko")) return { icon: "🎱", desc: "Ball Drop", tag: "NEW" };
  if (k.includes("baccarat")) return { icon: "🎴", desc: "Banker vs Player", tag: "LIVE" };
  if (k.includes("blackjack")) return { icon: "♠️", desc: "Beat the Dealer", tag: "TABLE" };
  return { icon: "🎮", desc: "Play to Earn", tag: "GAME" };
};

export default function GameHub() {
  return (
    <div style={styles.wrapper}>
      <GlobalStyles />
      <div style={styles.background} />
      
      <div style={styles.container}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             style={styles.title}
           >
             Game <span style={styles.gradientText}>Center</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             style={styles.subtitle}
           >
             Explore our collection of decentralized games. Fair, fast, and fun.
           </motion.p>
        </div>

        <div style={styles.grid}>
          {games.map((game: any, i: number) => {
            const { icon, desc, tag } = getGameAssets(game.key || game.name);
            return (
              <GameCard 
                key={game.key || i} 
                game={game} 
                icon={icon} 
                desc={desc} 
                tag={tag} 
                index={i} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
    body { margin: 0; font-family: 'Inter', sans-serif; }
  `}</style>
);

const GameCard = ({ game, icon, desc, tag, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{ height: "100%" }}
  >
    <Link to={game.path} style={{ textDecoration: "none", height: "100%", display: "block" }}>
      <motion.div
        whileHover={{ y: -10, boxShadow: `0 20px 20px -10px ${theme.primary}30` }}
        style={styles.card}
      >
        <div style={styles.cardHeader}>
          <span style={{ fontSize: "3rem" }}>{icon}</span>
          <span style={styles.tag}>{tag}</span>
        </div>
        <h3 style={styles.cardTitle}>{game.name}</h3>
        <p style={styles.cardDesc}>{desc}</p>
        <div style={styles.playBtn}>
          Play Now
          <span style={{ marginLeft: 8 }}>→</span>
        </div>
      </motion.div>
    </Link>
  </motion.div>
);

const styles = {
  wrapper: {
    minHeight: "50vh",
    color: theme.text,
    fontFamily: "'Inter', sans-serif",
    position: "relative" as const,
  },
  background: {
    position: "fixed" as const,
    inset: 0,
    background: theme.bg,
    backgroundImage: theme.bgGradient,
    zIndex: 0,
  },
  container: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: 1400,
    margin: "0 auto",
    padding: "40px 24px 60px",
  },
  title: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: 900,
    marginBottom: 16,
  },
  gradientText: {
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: theme.muted,
    fontSize: "1.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 32,
  },
  card: {
    background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    padding: 32,
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  tag: {
    fontSize: "0.75rem",
    padding: "6px 12px",
    borderRadius: 100,
    background: "rgba(34, 211, 238, 0.1)",
    color: theme.primary,
    fontWeight: 700,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: 8,
    color: theme.text,
  },
  cardDesc: {
    color: theme.muted,
    lineHeight: 1.5,
    marginBottom: 32,
    flex: 1,
  },
  playBtn: {
    marginTop: "auto",
    color: theme.primary,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    fontSize: "1rem",
  },
};
