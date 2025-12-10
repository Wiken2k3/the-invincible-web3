import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import game from "../assets/game.png";

/* ===================== THEME ===================== */

const theme = {
  bg: "#050B18",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.12)",
  primary: "#00D4FF",
  glow: "rgba(0,212,255,0.6)",
  text: "#FFFFFF",
  textSoft: "rgba(255,255,255,0.7)",
};

/* ===================== MAIN ===================== */

export default function Home() {
  return (
    <div style={{ background: theme.bg, color: theme.text, overflow: "hidden" }}>
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

/* ===================== BACKGROUND ===================== */

const BackgroundGlow = () => (
  <>
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
      transition={{ duration: 12, repeat: Infinity }}
      style={{
        position: "fixed",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: theme.glow,
        filter: "blur(160px)",
        top: "-10%",
        left: "-10%",
        zIndex: -1,
      }}
    />
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
      transition={{ duration: 14, repeat: Infinity }}
      style={{
        position: "fixed",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: theme.glow,
        filter: "blur(180px)",
        bottom: "-10%",
        right: "-10%",
        zIndex: -1,
      }}
    />
  </>
);

/* ===================== SECTIONS ===================== */

const Hero = () => (
  <Section center full>
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
      A next-generation play-to-earn game where your time,
      skills, and assets are truly owned on-chain.
    </p>

    <PrimaryButton to="/game">Start Playing</PrimaryButton>
  </Section>
);

const About = () => (
  <Section>
    <SectionTitle title="What is Invincible?" />
    <p style={styles.textCenter}>
      Invincible is a Web3 gaming ecosystem built on the Sui blockchain.
      Players grow in-game assets, earn rewards, and claim NFTs that
      live permanently in their wallets.
    </p>
  </Section>
);

const Features = () => (
  <Section>
    <SectionTitle title="Why Invincible?" />
    <Grid>
      {[
        ["⚡", "Fast Transactions", "Powered by Sui for instant gameplay"],
        ["💎", "True Ownership", "NFTs and assets belong to players"],
        ["🎮", "Real Gameplay", "Skill-based, not farming simulators"],
        ["🚀", "Early Airdrop", "Rewards for early adopters"],
      ].map(([icon, title, desc]) => (
        <Card key={title}>
          <h3 style={styles.cardTitle}>
            {icon} {title}
          </h3>
          <p style={styles.cardDesc}>{desc}</p>
        </Card>
      ))}
    </Grid>
  </Section>
);

const Preview = () => (
  <Section>
    <SectionTitle title="Game Preview" />
    <Card>
      <img
        src={game}
        alt="Game preview"
        style={{ width: "100%", borderRadius: 16, marginBottom: 20 }}
      />
      <PrimaryButton full to="/game">
        Play Game
      </PrimaryButton>
    </Card>
  </Section>
);

const Airdrop = () => (
  <Section>
    <SectionTitle title="Early Access Airdrop" />
    <Card>
      <p style={styles.centerSoft}>
        Connect your wallet early to receive exclusive NFT
        and token rewards when the game launches.
      </p>
      <PrimaryButton full to="/reward">
        Join Airdrop
      </PrimaryButton>
    </Card>
  </Section>
);

const Roadmap = () => (
  <Section>
    <SectionTitle title="Roadmap 2025" />
    <Grid>
      {[
        ["Q1", "Alpha Gameplay Release"],
        ["Q2", "NFT & Lootbox System"],
        ["Q3", "Token Launch & Airdrop"],
        ["Q4", "Marketplace & DAO"],
      ].map(([q, text]) => (
        <Card key={q}>
          <h3 style={styles.roadmapQ}>{q}</h3>
          <p style={styles.cardDesc}>{text}</p>
        </Card>
      ))}
    </Grid>
  </Section>
);

const Footer = () => (
  <div style={styles.footer}>
    © 2025 Invincible — Web3 Gaming built on Sui
  </div>
);

/* ===================== UI ===================== */

const Section = ({ children, center, full }) => (
  <section
    style={{
      padding: full ? "140px 24px" : "100px 24px",
      maxWidth: 1200,
      margin: "0 auto",
      textAlign: center ? "center" : "left",
    }}
  >
    {children}
  </section>
);

const SectionTitle = ({ title }) => (
  <h2 style={styles.sectionTitle}>{title}</h2>
);

const Grid = ({ children }) => (
  <div style={styles.grid}>{children}</div>
);

const Card = ({ children }) => (
  <motion.div whileHover={{ y: -8 }} style={styles.card}>
    {children}
  </motion.div>
);

const PrimaryButton = ({ children, full, to }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
    <Link
      to={to}
      style={{
        ...styles.button,
        width: full ? "100%" : "auto",
        display: "inline-block",
        textAlign: "center",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  </motion.div>
);

/* ===================== STYLES ===================== */

const styles = {
  heroTitle: {
    fontSize: "clamp(3rem, 6vw, 4.5rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    textShadow: "0 0 30px rgba(0,212,255,0.35)",
  },
  heroDesc: {
    maxWidth: 640,
    margin: "32px auto",
    fontSize: "1.15rem",
    color: theme.textSoft,
  },
  sectionTitle: {
    fontSize: "2.3rem",
    textAlign: "center",
    fontWeight: 800,
    marginBottom: 48,
  },
  textCenter: {
    maxWidth: 720,
    margin: "0 auto",
    textAlign: "center",
    color: theme.textSoft,
  },
  centerSoft: {
    textAlign: "center",
    marginBottom: 24,
    color: theme.textSoft,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
    gap: 24,
  },
  card: {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 20,
    padding: 28,
    backdropFilter: "blur(20px)",
  },
  cardTitle: {
    fontSize: "1.3rem",
    marginBottom: 12,
  },
  cardDesc: {
    color: theme.textSoft,
  },
  roadmapQ: {
    fontSize: "2rem",
    color: theme.primary,
    marginBottom: 8,
  },
  button: {
    padding: "16px 42px",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: "1.05rem",
    color: "#000",
    background: theme.primary,
  },
  footer: {
    padding: "48px 24px",
    textAlign: "center",
    color: theme.textSoft,
    borderTop: `1px solid ${theme.border}`,
  },
};
