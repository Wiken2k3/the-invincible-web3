"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

/* ===================== 🎨 THEME ===================== */

const theme = {
  bg: "#030014",
  bgGradient: `
    radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.3) 0%, transparent 60%),
    radial-gradient(circle at 100% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 0% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    linear-gradient(180deg, #030014 0%, #090418 100%)
  `,
  glass: "rgba(255, 255, 255, 0.03)",
  glassHover: "rgba(255, 255, 255, 0.07)",
  border: "rgba(255, 255, 255, 0.1)",
  primary: "#22d3ee", // Cyan
  secondary: "#a855f7", // Purple
  accent: "#f472b6", // Pink
  text: "#FFFFFF",
  muted: "#94a3b8",
  glow: "0 0 20px rgba(34, 211, 238, 0.5)",
  success: "#4ade80",
  gold: "#fbbf24",
};

/* ===================== MAIN ===================== */

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <div style={styles.wrapper}>
      <GlobalStyles />
      <div style={styles.background} />
      
      {/* Parallax Background Elements */}
      <motion.div style={{ ...styles.blob, top: "-10%", left: "-10%", y: y1 }} />
      <motion.div style={{ ...styles.blob, top: "40%", right: "-10%", background: theme.secondary, y: y1 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <LiveTicker />
        <Hero />
        <LiveStats />
        <PromoBanner />
        <GameCarousel />
        <Web3Advantages />
        <RewardsSection />
        <Footer />
      </div>
    </div>
  );
}

/* ===================== GLOBAL STYLES (RESPONSIVE) ===================== */

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      width: 100%;
    }

    .responsive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.5rem !important; line-height: 1.2 !important; }
      .hero-desc { font-size: 1rem !important; }
      .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
      .promo-banner { flex-direction: column; text-align: center; padding: 32px 24px !important; }
      .promo-image { display: none; }
      .rewards-panel { flex-direction: column-reverse; text-align: center; padding: 32px 24px !important; }
      .rewards-visual { margin-bottom: 32px; }
      .footer-content { flex-direction: column; align-items: center; text-align: center; }
      .stat-value { font-size: 1.4rem !important; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ===================== LIVE TICKER ===================== */

const LiveTicker = () => (
  <div style={styles.tickerContainer}>
    <motion.div
      style={styles.tickerTrack}
      animate={{ x: ["0%", "-50%"] }}
      transition={{
        duration: 40,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      {[...Array(20)].map((_, i) => (
        <div key={i} style={styles.tickerItem}>
          <span style={{ color: theme.success }}>● WIN</span>
          <span style={{ color: theme.muted }}>User...{1000 + (i % 10)}</span>
          <span style={{ color: theme.primary, fontWeight: "bold" }}>${(Math.random() * 1000).toFixed(2)}</span>
          <span style={{ fontSize: "0.8em" }}>in Slot Machine</span>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ===================== HERO ===================== */

const Hero = () => (
  <Section center pt="140px" pb="80px">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      style={styles.heroBadge}
    >
      <span style={styles.liveDot} /> Live on SUI Mainnet
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="hero-title"
      style={{ ...styles.heroTitle, position: "relative", zIndex: 2 }}
    >
      NEXT GEN <br />
      <span style={styles.gradientText}>CRYPTO CASINO</span>
    </motion.h1>

    <JackpotCounter />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 2 }}
    >
      <PrimaryButton to="/game">Play Now</PrimaryButton>
      <SecondaryButton>View Leaderboard</SecondaryButton>
    </motion.div>
  </Section>
);

const JackpotCounter = () => {
  const [count, setCount] = useState(1240592.45);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.random() * 0.5);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.jackpotContainer}>
      <div style={styles.jackpotLabel}>CURRENT JACKPOT</div>
      <div style={styles.jackpotValue}>${count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
  );
};

/* ===================== LIVE STATS ===================== */

const LiveStats = () => (
  <Section pt="0" pb="60px">
    <div className="stats-grid" style={styles.statsContainer}>
      {[
        ["Total Volume", "$42,891,023", "↗ 12%"],
        ["Active Players", "12,405", "● Live"],
        ["24h Payouts", "$1,204,500", "↗ 5%"],
        ["SUI TPS", "297,000+", "⚡ Fast"],
      ].map(([label, value, badge], i) => (
        <GlassPanel key={i} style={{ textAlign: "center", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: theme.muted, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
            <span style={styles.statBadge}>{badge}</span>
          </div>
          <div className="stat-value" style={{ fontSize: "1.8rem", fontWeight: 800, color: theme.text, textShadow: `0 0 20px ${theme.primary}40` }}>{value}</div>
        </GlassPanel>
      ))}
    </div>
  </Section>
);

/* ===================== PROMO BANNER ===================== */

const PromoBanner = () => (
  <Section>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="promo-banner"
      style={styles.promoBanner}
    >
      <div style={styles.promoContent}>
        <div style={{...styles.promoBadge, background: theme.gold, color: '#000'}}>COMING SOON</div>
        <h2 style={styles.promoTitle}>SUI Summer Tournament</h2>
        <p style={styles.promoDesc}>
          The biggest Web3 betting competition is arriving. $50,000 Prize Pool.
          Prepare your strategies to climb the leaderboard.
        </p>
        <button style={styles.disabledButton}>🔒 Locked</button>
      </div>
      <div className="promo-image" style={styles.promoImage}>
        🏆
      </div>
    </motion.div>
  </Section>
);

/* ===================== GAME CAROUSEL ===================== */

const GameCarousel = () => {
  const games = [
    ["🐎", "Horse Race", "PvP Racing", "Predict the winner in real-time 3D races."],
    ["💣", "Mines", "Strategy", "Navigate the minefield for multipliers."],
    ["🎰", "Slot Machine", "Jackpot", "Classic slots with on-chain RNG."],
    ["🎲", "Tai Xiu", "Dice", "Traditional big/small betting."],
    ["🎡", "Wheel", "Luck", "Spin the wheel for instant prizes."],
    ["🃏", "Poker", "Skill", "Texas Hold'em on-chain."],
  ];

  return (
    <div style={{ padding: "80px 0", background: "rgba(1, 0, 48, 0.2)" }}>
      <SectionTitle title="🎰 Trending Games" subtitle="Swipe to explore" />
      <div style={{ ...styles.carouselWrapper, overflow: "hidden" }}>
        <motion.div
          style={styles.carouselTrack}
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...games, ...games].map(([icon, title, tag, desc], i) => (
            <div key={i} style={styles.carouselItem}>
              <GameCard icon={icon} title={title} tag={tag} desc={desc} index={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};


/* ===================== WEB3 ADVANTAGES ===================== */

const Web3Advantages = () => (
  <Section>
    <SectionTitle title="Why Choose SUI?" subtitle="Next-Gen Blockchain Tech" />
    <div className="responsive-grid">
      {[
        ["⚡", "Lightning Fast", "Sub-second finality means no lag in your gameplay."],
        ["🛡️", "Unbreakable Security", "Audited smart contracts ensure your funds are safe."],
        ["⚖️", "Provably Fair", "Every outcome is verifiable on-chain. No black boxes."],
      ].map(([icon, title, desc], i) => (
        <motion.div
          key={i}
          whileHover={{ y: -5 }}
          style={styles.featureCard}
        >
          <div style={styles.featureIcon}>{icon}</div>
          <h3 style={styles.featureTitle}>{title}</h3>
          <p style={styles.featureDesc}>{desc}</p>
        </motion.div>
      ))}
    </div>
  </Section>
);

/* ===================== REWARDS & NFT ===================== */

const RewardsSection = () => (
  <Section center>
    <GlassPanel className="rewards-panel" style={styles.rewardsPanel}>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{...styles.promoBadge, background: theme.gold, color: '#000'}}>COMING SOON</div>
        <h2 style={{ fontSize: "2rem", marginBottom: 16 }}>
          <span style={{ color: theme.accent }}>Earn</span> While You Play
        </h2>
        <p style={{ color: theme.muted, marginBottom: 24, lineHeight: 1.6 }}>
          Staking $INV tokens will unlock revenue sharing from the casino house edge.
          Exclusive NFTs will grant VIP access, rakeback, and daily airdrops.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <button style={styles.disabledButton}>🔒 Staking Locked</button>
        </div>
      </div>
      <div className="rewards-visual" style={styles.rewardsVisual}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={styles.coinVisual}
        >
          $INV
        </motion.div>
      </div>
    </GlassPanel>
  </Section>
);

/* ===================== FOOTER ===================== */

const Footer = () => (
  <footer style={styles.footer}>
    <div className="container footer-content" style={styles.footerContent}>
      <div>
        <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: theme.text }}>THE INVINCIBLE</h4>
        <p style={{ color: theme.muted, fontSize: "0.9rem", marginTop: 8 }}>
          The premier decentralized casino on SUI.
        </p>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {["Twitter", "Discord", "Telegram", "Docs"].map((link) => (
          <a key={link} href="#" style={{ color: theme.muted, textDecoration: "none" }}>{link}</a>
        ))}
      </div>
    </div>
    <div style={styles.copyright}>
      © 2025 The Invincible. All rights reserved.
    </div>
  </footer>
);

/* ===================== UI COMPONENTS ===================== */

const Section = ({ children, center = false, pt = "100px", pb = "100px" }: any) => (
  <section
    className="container"
    style={{
      paddingTop: pt,
      paddingBottom: pb,
      textAlign: center ? "center" : "left",
      position: "relative",
    }}
  >
    {children}
  </section>
);

const SectionTitle = ({ title, subtitle }: any) => (
  <div style={{ marginBottom: 60, textAlign: "center" }}>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={styles.sectionTitle}
    >
      {title}
    </motion.h2>
    {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
  </div>
);

const GameCard = ({ icon, title, tag, desc, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    style={{ height: "100%" }}
  >
    <Link to="/game" style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ y: -10, boxShadow: `0 20px 40px -10px ${theme.primary}30` }}
        style={styles.gameCard}
      >
        <div style={styles.cardHeader}>
          <span style={{ fontSize: "2.5rem" }}>{icon}</span>
          <span style={styles.tag}>{tag}</span>
        </div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardDesc}>{desc}</p>
        <div style={styles.playText}>Play Now →</div>
      </motion.div>
    </Link>
  </motion.div>
);

const GlassPanel = ({ children, style, className }: any) => (
  <div className={className} style={{ ...styles.glassPanel, ...style }}>{children}</div>
);

const PrimaryButton = ({ to, children }: any) => (
  <Link to={to} style={styles.primaryButton}>
    {children}
  </Link>
);

const SecondaryButton = ({ children }: any) => (
  <button style={styles.secondaryButton}>
    {children}
  </button>
);

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    minHeight: "100vh",
    color: theme.text,
    overflowX: "hidden" as const,
  },
  background: {
    position: "fixed" as const,
    inset: 0,
    background: theme.bg,
    backgroundImage: theme.bgGradient,
    zIndex: 0,
  },
  blob: {
    position: "fixed" as const,
    width: "800px",
    height: "800px",
    background: theme.primary,
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.15,
    zIndex: 0,
  },
  heroTitle: {
    fontSize: "clamp(3rem, 6vw, 5.5rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: 24,
    letterSpacing: "-0.02em",
  },
  gradientText: {
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: `0 0 40px ${theme.primary}50`,
  },
  heroDesc: {
    fontSize: "1.25rem",
    color: theme.muted,
    maxWidth: 600,
    margin: "0 auto 40px",
    lineHeight: 1.6,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(34, 211, 238, 0.05)",
    border: `1px solid ${theme.primary}`,
    borderRadius: 100,
    color: theme.primary,
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: 32,
    backdropFilter: "blur(10px)",
    boxShadow: `0 0 20px ${theme.primary}20`,
  },
  liveDot: {
    width: 8,
    height: 8,
    background: theme.primary,
    borderRadius: "50%",
    marginRight: 10,
    boxShadow: `0 0 10px ${theme.primary}`,
  },
  jackpotContainer: {
    margin: "40px 0 60px",
    textAlign: "center" as const,
    position: "relative" as const,
    zIndex: 2,
  },
  jackpotLabel: {
    fontSize: "1rem",
    color: theme.muted,
    letterSpacing: "4px",
    marginBottom: 8,
    fontWeight: 700,
  },
  jackpotValue: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: 900,
    color: theme.success,
    textShadow: `0 0 30px ${theme.success}40`,
    fontVariantNumeric: "tabular-nums",
  },
  primaryButton: {
    display: "inline-block",
    padding: "16px 32px",
    background: theme.primary,
    color: "#000",
    fontWeight: 700,
    borderRadius: 12,
    textDecoration: "none",
    fontSize: "1.1rem",
    boxShadow: `0 0 20px ${theme.primary}60`,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  disabledButton: {
    display: "inline-block",
    padding: "16px 32px",
    background: "rgba(255, 255, 255, 0.1)",
    color: theme.muted,
    fontWeight: 700,
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    fontSize: "1.1rem",
    cursor: "not-allowed",
    backdropFilter: "blur(4px)",
  },
  secondaryButton: {
    padding: "16px 32px",
    background: "transparent",
    color: theme.text,
    fontWeight: 700,
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    fontSize: "1.1rem",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 24,
    width: "100%",
    position: "relative" as const,
    zIndex: 10,
  },
  statBadge: {
    fontSize: "0.7rem",
    background: "rgba(255,255,255,0.1)",
    padding: "2px 6px",
    borderRadius: 4,
    color: theme.primary,
  },
  glassPanel: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    backdropFilter: "blur(20px)",
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: "3rem",
    fontWeight: 800,
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: theme.muted,
    fontSize: "1.2rem",
  },
  gameCard: {
    background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    padding: 32,
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    cursor: "pointer",
    position: "relative" as const,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  tag: {
    fontSize: "0.75rem",
    padding: "4px 12px",
    borderRadius: 100,
    background: "rgba(255,255,255,0.1)",
    color: theme.primary,
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: 8,
  },
  cardDesc: {
    color: theme.muted,
    lineHeight: 1.5,
    marginBottom: 24,
    flex: 1,
  },
  playText: {
    color: theme.primary,
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  featureCard: {
    padding: 32,
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: 12,
  },
  featureDesc: {
    color: theme.muted,
    lineHeight: 1.6,
  },
  rewardsPanel: {
    padding: 60,
    display: "flex",
    alignItems: "center",
    gap: 60,
    flexWrap: "wrap" as const,
    background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(168, 85, 247, 0.1) 100%)`,
  },
  rewardsVisual: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    minWidth: 300,
  },
  coinVisual: {
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.accent}, ${theme.primary})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 900,
    boxShadow: `0 0 100px ${theme.secondary}60`,
  },
  footer: {
    borderTop: `1px solid ${theme.border}`,
    padding: "80px 24px 40px",
    background: "#02010a",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 40,
    marginBottom: 60,
  },
  copyright: {
    textAlign: "center" as const,
    color: theme.muted,
    fontSize: "0.9rem",
    paddingTop: 40,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  promoBanner: {
    background: `linear-gradient(135deg, ${theme.secondary}40, ${theme.primary}20)`,
    borderRadius: 32,
    padding: "40px 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: `1px solid ${theme.border}`,
    position: "relative" as const,
    overflow: "hidden",
    flexWrap: "wrap" as const,
    gap: 32,
  },
  promoContent: {
    flex: 1,
    minWidth: 300,
    zIndex: 2,
  },
  promoTitle: {
    fontSize: "2.5rem",
    fontWeight: 800,
    marginBottom: 16,
    background: "linear-gradient(to right, #fff, #ccc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  promoDesc: {
    fontSize: "1.1rem",
    color: theme.muted,
    marginBottom: 24,
    maxWidth: 500,
    lineHeight: 1.6,
  },
  promoBadge: {
    display: "inline-block",
    padding: "6px 12px",
    background: theme.accent,
    color: "#fff",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 700,
    marginBottom: 16,
  },
  promoImage: {
    fontSize: "8rem",
    opacity: 0.8,
    filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))",
    transform: "rotate(-10deg)",
  },
  carouselWrapper: {
    width: "100%",
    overflowX: "auto" as const,
    paddingBottom: 20,
    scrollbarWidth: "none" as const, // Firefox
  },
  carouselTrack: {
    display: "flex",
    gap: 24,
    padding: "0 24px",
    width: "max-content",
  },
  carouselItem: {
    width: 320,
    flexShrink: 0,
  },
  tickerContainer: {
    background: "rgba(0,0,0,0.3)",
    borderBottom: `1px solid ${theme.border}`,
    padding: "10px 0",
    overflow: "hidden",
    position: "relative" as const,
    zIndex: 10,
    backdropFilter: "blur(5px)",
  },
  tickerTrack: {
    display: "flex",
    gap: 40,
    whiteSpace: "nowrap" as const,
    width: "max-content",
  },
  tickerItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: "0.9rem",
  },
};
