"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSuiClient } from "@mysten/dapp-kit";
import { useWallet } from "../../hooks/useWallet";
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
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.1)",
  primary: "#22d3ee",
  secondary: "#a855f7",
  text: "#ffffff",
  muted: "#94a3b8",
  success: "#4ade80",
  error: "#f87171",
  glow: "0 0 20px rgba(34, 211, 238, 0.3)",
};

export default function Reward() {
  const { address } = useWallet();
  const client = useSuiClient();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const data = await client.queryTransactionBlocks({
        filter: { FromAddress: address },
        options: {
          showEffects: true,
          showBalanceChanges: true,
          showInput: true,
        },
        order: "descending",
        limit: 20,
      });
      setTransactions(data.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [address]);

  const shorten = (str: string) => `${str.slice(0, 6)}...${str.slice(-4)}`;

  const formatTime = (ts: string | number | undefined) => {
    if (!ts) return "-";
    return new Date(Number(ts)).toLocaleString("vi-VN");
  };

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
             My <span style={styles.gradientText}>Activity</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             style={styles.subtitle}
           >
             Track your betting history, rewards, and gas usage on SUI.
           </motion.p>
        </div>

        {/* STATS SUMMARY */}
        <div style={styles.statsGrid}>
           <StatCard 
             label="Transactions" 
             value={transactions.length} 
             sub="Last 20 fetched" 
             icon="📝" 
             delay={0.1}
           />
           <StatCard 
             label="Wallet Status" 
             value={address ? "Connected" : "Disconnected"} 
             sub={address ? "Ready to play" : "Connect to view"} 
             icon="💳" 
             delay={0.2}
             active={!!address}
           />
           <StatCard 
             label="Network" 
             value="SUI Mainnet" 
             sub="Live Status" 
             icon="🌐" 
             delay={0.3}
           />
        </div>

        <div style={styles.glassPanel}>
          <div style={styles.panelHeader}>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>📜 Transaction History</h3>
            <button 
              onClick={fetchHistory} 
              disabled={loading || !address}
              style={styles.refreshButton}
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {!address ? (
            <div style={{ padding: 60, textAlign: "center", color: theme.muted }}>
              Please connect your wallet to view your history.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Digest</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Gas Fee (SUI)</th>
                    <th style={{...styles.th, textAlign: "right"}}>Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 40, textAlign: "center", color: theme.muted }}>
                        Loading transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 40, textAlign: "center", color: theme.muted }}>
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx, index) => {
                      const success = tx.effects?.status?.status === "success";
                      const gasUsed = tx.effects?.gasUsed;
                      const totalGas = gasUsed 
                        ? (Number(gasUsed.computationCost) + Number(gasUsed.storageCost) - Number(gasUsed.storageRebate)) / 1e9 
                        : 0;

                      return (
                        <motion.tr 
                          key={tx.digest}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          style={styles.tableRow}
                        >
                          <td style={styles.td}>
                            <span 
                              style={{ color: theme.primary, cursor: "pointer", fontFamily: "monospace" }}
                              onClick={() => navigator.clipboard.writeText(tx.digest)}
                              title="Click to copy"
                            >
                              {shorten(tx.digest)}
                            </span>
                          </td>
                          <td style={styles.td}>{formatTime(tx.timestampMs)}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: success ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)",
                              color: success ? theme.success : theme.error,
                              border: `1px solid ${success ? theme.success : theme.error}`
                            }}>
                              {success ? "Success" : "Failed"}
                            </span>
                          </td>
                          <td style={{...styles.td, color: theme.muted}}>
                            -{totalGas.toFixed(5)}
                          </td>
                          <td style={{...styles.td, textAlign: "right"}}>
                            <a 
                              href={`https://suiscan.xyz/testnet/tx/${tx.digest}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={styles.link}
                            >
                              View ↗
                            </a>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
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

const StatCard = ({ label, value, sub, icon, delay, active }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      ...styles.statCard,
      border: active ? `1px solid ${theme.primary}` : styles.statCard.border,
      boxShadow: active ? theme.glow : "none"
    }}
  >
    <div style={{ fontSize: "2rem", marginBottom: 12 }}>{icon}</div>
    <div style={{ color: theme.muted, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: theme.text, margin: "4px 0" }}>{value}</div>
    <div style={{ fontSize: "0.8rem", color: active ? theme.primary : theme.muted, opacity: 0.8 }}>{sub}</div>
  </motion.div>
);

const styles = {
  wrapper: {
    minHeight: "100vh",
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px 24px 80px",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
    marginBottom: 40,
  },
  statCard: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    padding: 24,
    backdropFilter: "blur(10px)",
  },
  glassPanel: {
    background: theme.glass,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    backdropFilter: "blur(20px)",
    overflow: "hidden",
  },
  panelHeader: {
    padding: "24px 32px",
    borderBottom: `1px solid ${theme.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(0,0,0,0.2)",
  },
  refreshButton: {
    background: "rgba(255,255,255,0.1)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "background 0.2s",
  },
  tableWrapper: {
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    minWidth: 800,
  },
  tableHeaderRow: {
    textAlign: "left" as const,
    color: theme.muted,
    fontSize: "0.9rem",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    background: "rgba(255,255,255,0.02)",
  },
  th: {
    padding: "20px 32px",
    fontWeight: 600,
  },
  tableRow: {
    borderBottom: `1px solid ${theme.border}`,
    transition: "background 0.2s",
  },
  td: {
    padding: "20px 32px",
    color: theme.text,
    fontSize: "0.95rem",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 100,
    fontSize: "0.8rem",
    fontWeight: 600,
    display: "inline-block",
  },
  link: {
    color: theme.primary,
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
};
