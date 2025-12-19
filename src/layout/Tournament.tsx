"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Button, Avatar, Badge, Progress } from "@mantine/core";

/* ===================== 🎨 THEME ===================== */

const theme = {
  bg: "#030014",
  glass: "rgba(255, 255, 255, 0.03)",
  glassHover: "rgba(255, 255, 255, 0.07)",
  border: "rgba(255, 255, 255, 0.1)",
  primary: "#22d3ee", // Cyan
  secondary: "#a855f7", // Purple
  accent: "#f472b6", // Pink
  text: "#ffffff",
  muted: "#94a3b8",
  gold: "#fbbf24",
  silver: "#e2e8f0",
  bronze: "#d97706",
  success: "#4ade80",
  glow: "0 0 20px rgba(34, 211, 238, 0.3)",
};

/* ===================== MAIN COMPONENT ===================== */

export default function Tournament() {
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    // Giả lập call API
    setTimeout(() => {
      setJoined(true);
      notifications.show({
        title: '🎉 Welcome to the Arena!',
        message: 'You have successfully joined the SUI Summer Tournament. Good luck!',
        color: 'cyan',
        autoClose: 4000,
        withCloseButton: true,
        styles: (theme) => ({
          root: {
            backgroundColor: '#0f172a',
            borderColor: '#22d3ee',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
          },
          title: { color: '#ffffff', fontWeight: 700 },
          description: { color: '#94a3b8' },
        }),
      });
    }, 500);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.background} />
      
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* HEADER SECTION */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              size="lg" 
              variant="gradient" 
              gradient={{ from: 'cyan', to: 'purple' }}
              style={{ marginBottom: 16 }}
            >
              LIVE EVENT
            </Badge>
            <h1 style={styles.title}>
              SUI Summer <span style={styles.gradientText}>Tournament</span>
            </h1>
            <p style={styles.subtitle}>
              Compete against the best players on SUI. Climb the ranks and win your share of the $50,000 prize pool.
            </p>
          </motion.div>

          <CountdownTimer targetDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: 40 }}
          >
            {!joined ? (
              <Button 
                size="xl" 
                radius="md"
                onClick={handleJoin}
                style={styles.joinButton}
              >
                🚀 Join Tournament
              </Button>
            ) : (
              <div style={styles.joinedBadge}>
                ✅ You are participating
              </div>
            )}
          </motion.div>
        </div>

        {/* STATS GRID */}
        <div style={styles.statsGrid}>
          <StatCard icon="💰" label="Prize Pool" value="$50,000" sub="USDC + SUI" />
          <StatCard icon="👥" label="Participants" value="1,245" sub="+120 today" />
          <StatCard icon="🏆" label="Top Prize" value="$15,000" sub="For 1st Place" />
        </div>

        {/* LEADERBOARD */}
        <div style={styles.leaderboardContainer}>
          <div style={styles.leaderboardHeader}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>🏆 Live Leaderboard</h2>
            <div style={{ color: theme.muted, fontSize: "0.9rem" }}>Updates in real-time</div>
          </div>
          
          <LeaderboardTable />
        </div>
      </div>
    </div>
  );
}

/* ===================== SUB COMPONENTS ===================== */

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.timerContainer}>
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} style={styles.timerBox}>
          <div style={styles.timerValue}>{value < 10 ? `0${value}` : value}</div>
          <div style={styles.timerLabel}>{unit.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    style={styles.statCard}
  >
    <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{icon}</div>
    <div style={{ color: theme.muted, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: "2rem", fontWeight: 800, color: theme.primary, margin: "4px 0" }}>{value}</div>
    <div style={{ color: theme.text, opacity: 0.6, fontSize: "0.85rem" }}>{sub}</div>
  </motion.div>
);

const LeaderboardTable = () => {
  const data = [
    { rank: 1, name: "CryptoKing.sui", score: "452,900", prize: "$15,000", avatar: "🦁" },
    { rank: 2, name: "SuiWhale.move", score: "389,120", prize: "$10,000", avatar: "🐋" },
    { rank: 3, name: "LuckyStrike", score: "310,450", prize: "$5,000", avatar: "🍀" },
    { rank: 4, name: "MoonWalker", score: "280,000", prize: "$2,500", avatar: "👨‍🚀" },
    { rank: 5, name: "DiamondHands", score: "210,500", prize: "$1,000", avatar: "💎" },
    { rank: 6, name: "AlphaBet", score: "198,200", prize: "$500", avatar: "🅰️" },
    { rank: 7, name: "DegensOnly", score: "150,100", prize: "$250", avatar: "🎲" },
  ];

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={{ ...styles.th, width: "10%" }}>Rank</th>
            <th style={{ ...styles.th, width: "40%" }}>Player</th>
            <th style={{ ...styles.th, width: "25%" }}>Score</th>
            <th style={{ ...styles.th, width: "25%", textAlign: "right" }}>Est. Prize</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <motion.tr 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={styles.tableRow}
            >
              <td style={styles.td}>
                <RankBadge rank={item.rank} />
              </td>
              <td style={styles.td}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar color="cyan" radius="xl">{item.avatar}</Avatar>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                </div>
              </td>
              <td style={styles.td}>
                <span style={{ color: theme.primary, fontWeight: 700 }}>{item.score}</span>
                <div style={{ width: "80%", marginTop: 6 }}>
                   <Progress value={Math.max(20, 100 - index * 10)} size="xs" color={index < 3 ? "yellow" : "cyan"} />
                </div>
              </td>
              <td style={{ ...styles.td, textAlign: "right", color: theme.success, fontWeight: 700 }}>
                {item.prize}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RankBadge = ({ rank }: { rank: number }) => {
  let color = theme.muted;
  let bg = "rgba(255,255,255,0.1)";
  let icon = `#${rank}`;

  if (rank === 1) { color = theme.gold; bg = "rgba(251, 191, 36, 0.2)"; icon = "🥇"; }
  if (rank === 2) { color = theme.silver; bg = "rgba(226, 232, 240, 0.2)"; icon = "🥈"; }
  if (rank === 3) { color = theme.bronze; bg = "rgba(180, 83, 9, 0.2)"; icon = "🥉"; }

  return (
    <div style={{ 
      width: 36, height: 36, borderRadius: "50%", 
      background: bg, color: color, 
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: rank <= 3 ? "1.2rem" : "0.9rem"
    }}>
      {icon}
    </div>
  );
};

/* ===================== STYLES ===================== */

const styles = {
  wrapper: {
    minHeight: "100vh",
    color: theme.text,
    fontFamily: "'Inter', sans-serif",
  },
  background: {
    position: "fixed" as const,
    inset: 0,
    background: theme.bg,
    backgroundImage: `
      radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.15) 0%, transparent 60%),
      linear-gradient(180deg, #030014 0%, #0f172a 100%)
    `,
    zIndex: 0,
  },
  title: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: 900,
    marginBottom: 16,
    lineHeight: 1.1,
  },
  gradientText: {
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: `0 0 40px ${theme.primary}50`,
  },
  subtitle: {
    color: theme.muted,
    fontSize: "1.1rem",
    maxWidth: 600,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  joinButton: {
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
    boxShadow: theme.glow,
    border: "none",
    fontWeight: 700,
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  joinedBadge: {
    display: "inline-block",
    padding: "12px 24px",
    background: "rgba(34, 211, 238, 0.1)",
    border: `1px solid ${theme.primary}`,
    borderRadius: 12,
    color: theme.primary,
    fontWeight: 700,
  },
  timerContainer: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginTop: 40,
    flexWrap: "wrap" as const,
  },
  timerBox: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    padding: "16px 24px",
    borderRadius: 16,
    minWidth: 100,
    backdropFilter: "blur(10px)",
  },
  timerValue: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: theme.text,
    fontVariantNumeric: "tabular-nums",
  },
  timerLabel: {
    fontSize: "0.8rem",
    color: theme.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
    marginBottom: 60,
  },
  statCard: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    padding: 32,
    borderRadius: 24,
    textAlign: "center" as const,
  },
  leaderboardContainer: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    overflow: "hidden",
    backdropFilter: "blur(20px)",
  },
  leaderboardHeader: {
    padding: "24px 32px",
    borderBottom: `1px solid ${theme.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.2)",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 600,
  },
  tableHeaderRow: {
    textAlign: "left" as const,
    color: theme.muted,
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  th: {
    padding: "20px 32px",
    fontWeight: 600,
  },
  tableRow: {
    borderBottom: `1px solid ${theme.border}`,
  },
  td: {
    padding: "20px 32px",
    color: theme.text,
  },
};