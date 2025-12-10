"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import React from "react";
import game from "../assets/game.png";

/* ===================== 🎨 THEME (MATCH FARM TILE) ===================== */

const theme = {
  bg: "#050B18",
  glassBg: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.12)",
  activeBorder: "rgba(0,229,255,0.55)",
  glow: "rgba(0,229,255,0.35)",
  primary: "#00E5FF",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.65)",
};

/* ===================== MAIN ===================== */

export default function Home() {
  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      <BackgroundGlow />
      <Hero />
      <About />
      <Features />
      <Preview />
      <Airdrop />
      <Roadmap />
      <Footer />
    </div>
  );
}

/* ===================== 🌌 BACKGROUND ===================== */

const BackgroundGlow = () => (
  <>
    <motion.div
      animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.2, 1] }}
      transition={{ duration: 16, repeat: Infinity }}
      style={styles.bgGlowTop as React.CSSProperties}
    />
    <motion.div
      animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.3, 1] }}
      transition={{ duration: 18, repeat: Infinity }}
      style={styles.bgGlowBottom as React.CSSProperties}
    />
  </>
);

/* ===================== SECTIONS ===================== */

const Hero = () => (
  <Section center={true} full={true}>
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={styles.heroTitle}
    >
      Play. Earn. Own.
      <br />
      Web3 Gaming on Sui
    </motion.h1>

    <p style={styles.heroDesc}>
      A next-gen on-chain game where your assets truly belong to you.
    </p>

    <PrimaryButton to="/game" full={false}>Start Playing</PrimaryButton>
  </Section>
);

const About = () => (
  <Section center={false} full={false}>
    <SectionTitle title="What is Invincible?" />
    <p style={styles.textCenter as React.CSSProperties}>
      Invincible is a Web3 gaming ecosystem built on Sui.
      Grow assets, earn rewards, and own NFTs permanently on-chain.
    </p>
  </Section>
);

const Features = () => (
  <Section center={false} full={false}>
    <SectionTitle title="Why Invincible?" />
    <Grid>
      {[
        ["⚡", "Fast Transactions", "Near-zero latency on Sui"],
        ["💎", "True Ownership", "NFTs owned by players"],
        ["🎮", "Real Gameplay", "Skill-based progression"],
        ["🚀", "Early Rewards", "Airdrop for pioneers"],
      ].map(([icon, title, desc]) => (
        <GlassCard key={title as string}>
          <h3 style={styles.cardTitle}>
            {icon} {title}
          </h3>
          <p style={styles.cardDesc}>{desc}</p>
        </GlassCard>
      ))}
    </Grid>
  </Section>
);

const Preview = () => (
  <Section center={false} full={false}>
    <SectionTitle title="Game Preview" />
    <GlassCard>
      <img src={game} alt="preview" style={styles.previewImg} />
      <PrimaryButton full={true} to="/game">
        Play Game
      </PrimaryButton>
    </GlassCard>
  </Section>
);

const Airdrop = () => (
  <Section center={false} full={false}>
    <SectionTitle title="Early Access Airdrop" />
    <GlassCard>
      <p style={styles.centerSoft as React.CSSProperties}>
        Connect wallet early to receive exclusive NFTs and tokens.
      </p>
      <PrimaryButton full={true} to="/reward">
        Join Airdrop
      </PrimaryButton>
    </GlassCard>
  </Section>
);

const Roadmap = () => (
  <Section center={false} full={false}>
    <SectionTitle title="Roadmap 2025" />
    <Grid>
      {[
        ["Q1", "Alpha Gameplay"],
        ["Q2", "NFT System"],
        ["Q3", "Token & Airdrop"],
        ["Q4", "Marketplace & DAO"],
      ].map(([q, text]) => (
        <GlassCard key={q as string}>
          <h3 style={styles.roadmapQ}>{q}</h3>
          <p style={styles.cardDesc}>{text}</p>
        </GlassCard>
      ))}
    </Grid>
  </Section>
);

const Footer = () => (
  <footer style={styles.footer as React.CSSProperties}>
    © 2025 Invincible — Built on Sui
  </footer>
);

/* ===================== UI PRIMITIVES ===================== */

interface SectionProps {
  children: React.ReactNode;
  center: boolean;
  full: boolean;
}

const Section = ({ children, center, full }: SectionProps) => (
  <section
    style={{
      padding: full ? "140px 24px" : "96px 24px",
      maxWidth: 1200,
      margin: "0 auto",
      textAlign: (center ? "center" : "left") as "center" | "left",
    }}
  >
    {children}
  </section>
);

interface SectionTitleProps {
  title: string;
}

const SectionTitle = ({ title }: SectionTitleProps) => (
  <h2 style={styles.sectionTitle as React.CSSProperties}>{title}</h2>
);

interface GridProps {
  children: React.ReactNode;
}

const Grid = ({ children }: GridProps) => <div style={styles.grid}>{children}</div>;

interface GlassCardProps {
  children: React.ReactNode;
}

const GlassCard = ({ children }: GlassCardProps) => (
  <motion.div
    whileHover={{ y: -6, boxShadow: `0 0 22px ${theme.glow}` }}
    transition={{ type: "spring", stiffness: 200 }}
    style={styles.card}
  >
    {children}
  </motion.div>
);

interface PrimaryButtonProps {
  children: React.ReactNode;
  full: boolean;
  to: string;
}

const PrimaryButton = ({ children, full, to }: PrimaryButtonProps) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
    <Link
      to={to}
      style={{
        ...styles.button,
        width: full ? "100%" : "auto",
        textAlign: "center" as const,
      }}
    >
      {children}
    </Link>
  </motion.div>
);

/* ===================== 🎨 STYLES ===================== */

const styles = {
  heroTitle: {
    fontSize: "clamp(3rem,6vw,4.5rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    textShadow: `0 0 32px ${theme.glow}`,
  },
  heroDesc: {
    maxWidth: 620,
    margin: "28px auto",
    fontSize: "1.1rem",
    color: theme.textMuted,
  },
  sectionTitle: {
    fontSize: "2.3rem",
    textAlign: "center" as const,
    fontWeight: 800,
    marginBottom: 48,
  },
  textCenter: {
    maxWidth: 720,
    margin: "0 auto",
    textAlign: "center" as const,
    color: theme.textMuted,
  },
  centerSoft: {
    textAlign: "center" as const,
    color: theme.textMuted,
    marginBottom: 22,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 24,
  },
  card: {
    background: theme.glassBg,
    border: `1px solid ${theme.glassBorder}`,
    borderRadius: 20,
    padding: 28,
    backdropFilter: "blur(18px)",
  },
  cardTitle: { fontSize: "1.25rem", marginBottom: 12 },
  cardDesc: { color: theme.textMuted },
  roadmapQ: {
    fontSize: "2rem",
    color: theme.primary,
    marginBottom: 8,
  },
  previewImg: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 20,
  },
  button: {
    display: "inline-block",
    padding: "15px 42px",
    borderRadius: 14,
    fontWeight: 700,
    background: theme.primary,
    color: "#000",
    textDecoration: "none",
  },
  footer: {
    padding: "48px 24px",
    textAlign: "center" as const,
    color: theme.textMuted,
    borderTop: `1px solid ${theme.glassBorder}`,
  },
  bgGlowTop: {
    position: "fixed" as const,
    width: 600,
    height: 600,
    background: theme.glow,
    borderRadius: "50%",
    filter: "blur(160px)",
    top: "-10%",
    left: "-10%",
    zIndex: -1,
  },
  bgGlowBottom: {
    position: "fixed" as const,
    width: 500,
    height: 500,
    background: theme.glow,
    borderRadius: "50%",
    filter: "blur(180px)",
    bottom: "-10%",
    right: "-10%",
    zIndex: -1,
  },
};
