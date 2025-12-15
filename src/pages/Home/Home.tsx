"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import React from "react";

/* ===================== 🎨 THEME ===================== */

const theme = {
  bg: `
    radial-gradient(circle at 20% 30%, rgba(162, 89, 255, 0.12), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 229, 255, 0.1), transparent 50%),
    linear-gradient(180deg, #0a0f1a 0%, #0f172a 50%, #0b1020 100%)
  `,
  glass: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.12)",
  glow: "rgba(162, 89, 255, 0.45)",
  primary: "#A259FF",
  secondary: "#00E5FF",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",
};

/* ===================== MAIN ===================== */

export default function Home() {
  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      <Hero />
      <FeaturedGames />
      <WhyPlay />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ===================== HERO ===================== */

const Hero = () => (
  <Section center full>
    <motion.h1
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={styles.heroTitle}
    >
      Web3 Game Arena
      <br />
      <span style={{ color: theme.secondary }}>Play • Bet • Earn</span>
    </motion.h1>

    <p style={styles.heroDesc}>
      A collection of on-chain mini games built on Sui.
      Fair play, instant rewards, true ownership.
    </p>

    <PrimaryButton to="/game">Enter Game Hub</PrimaryButton>
  </Section>
);

/* ===================== FEATURED GAMES ===================== */

const FeaturedGames = () => (
  <Section center={false}>
    <SectionTitle title="🔥 Featured Games" />
    <Grid>
      {[
        ["🐎", "Horse Race", "Predict & win"],
        ["🎲", "Tài Xỉu", "Classic betting"],
        ["🎰", "Slot Machine", "Spin & earn"],
        ["💣", "Mine", "Risk & reward"],
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

/* ===================== WHY ===================== */

const WhyPlay = () => (
  <Section center={false}>
    <SectionTitle title="Why The Invincible?" />
    <Grid>
      {[
        ["⚡ Instant Result", "Fast confirmation on Sui"],
        ["🔒 Fair & Transparent", "On-chain randomness"],
        ["💰 Real Rewards", "Win tokens & NFTs"],
        ["🧠 Skill + Luck", "Not just pure gamble"],
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

/* ===================== HOW IT WORKS ===================== */

const HowItWorks = () => (
  <Section center={false}>
    <SectionTitle title="How It Works" />
    <Grid>
      {[
        ["🔗", "Connect Wallet"],
        ["🎮", "Choose a Game"],
        ["💸", "Place Your Bet"],
        ["🏆", "Win & Claim"],
      ].map(([icon, text]) => (
        <GlassCard key={text as string}>
          <h3 style={{ fontSize: "1.4rem", textAlign: "center" }}>
            {icon} {text}
          </h3>
        </GlassCard>
      ))}
    </Grid>
  </Section>
);

/* ===================== CTA ===================== */

const FinalCTA = () => (
  <Section center>
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <PrimaryButton to="/game">Start Playing Now</PrimaryButton>
    </motion.div>
  </Section>
);

/* ===================== FOOTER ===================== */

const Footer = () => (
  <footer style={styles.footer}>
    © 2025 The Invincible — Web3 Game Hub on Sui
  </footer>
);

/* ===================== UI PRIMITIVES ===================== */

const Section = ({
  children,
  center = false,
  full = false,
}: {
  children: React.ReactNode;
  center?: boolean;
  full?: boolean;
}) => (
  <section
    style={{
      padding: full ? "140px 24px" : "96px 24px",
      maxWidth: 1200,
      margin: "0 auto",
      textAlign: center ? "center" : "left",
    }}
  >
    {children}
  </section>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 style={styles.sectionTitle}>{title}</h2>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={styles.grid}>{children}</div>
);

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ y: -6, boxShadow: `0 0 26px ${theme.glow}` }}
    style={styles.card}
  >
    {children}
  </motion.div>
);

const PrimaryButton = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} style={styles.button}>
    {children}
  </Link>
);

/* ===================== STYLES ===================== */

const styles = {
  heroTitle: {
    fontSize: "clamp(3rem,6vw,4.5rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    textShadow: `0 0 30px ${theme.glow}`,
  },
  heroDesc: {
    maxWidth: 640,
    margin: "32px auto",
    fontSize: "1.1rem",
    color: theme.muted,
  },
  sectionTitle: {
    fontSize: "2.3rem",
    fontWeight: 800,
    marginBottom: 48,
    textAlign: "center" as const,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 24,
  },
  card: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    borderRadius: 20,
    padding: 28,
    backdropFilter: "blur(18px)",
  },
  cardTitle: {
    fontSize: "1.3rem",
    marginBottom: 10,
  },
  cardDesc: {
    color: theme.muted,
  },
  button: {
    display: "inline-block",
    padding: "16px 44px",
    borderRadius: 14,
    fontWeight: 800,
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
    color: "#000",
    textDecoration: "none",
    boxShadow: `0 6px 24px ${theme.glow}`,
  },
  footer: {
    padding: "48px 24px",
    textAlign: "center" as const,
    color: theme.muted,
    borderTop: `1px solid ${theme.border}`,
  },
};
