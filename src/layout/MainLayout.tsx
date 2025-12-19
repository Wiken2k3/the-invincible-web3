import {
  AppShell,
  Burger,
  Button,
  Group,
  Image,
  NavLink,
  Divider,
  Badge,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import logoImg from "../assets/logo.png";

// 🔥 Import Web3 (Sui Wallet)
import { useWallet } from "../hooks/useWallet";
import { ConnectModal } from "@mysten/dapp-kit";

/* =========================
   🎨 THEME CONFIG
========================= */
const theme = {
  bg: "#030014",
  glass: "rgba(20, 20, 30, 0.6)",
  glassBorder: "rgba(255, 255, 255, 0.08)",
  primary: "#22d3ee", // Cyan
  secondary: "#a855f7", // Purple
  accent: "#f472b6", // Pink
  text: "#ffffff",
  glow: "0 0 15px rgba(34, 211, 238, 0.3)",
  muted: "#94a3b8",
  success: "#4ade80",
};

/* =========================
   🔥 MAIN LAYOUT
========================= */
export default function MainLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();

  // 🔥 WALLET HOOK
  const { address, logout } = useWallet();
  const shortAddr = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null;

  /* Sidebar Auto Close */
  useEffect(() => {
    const handleCloseSidebar = () => {
      if (window.innerWidth < 768) close();
    };
    window.addEventListener("closeSidebar", handleCloseSidebar);
    return () => window.removeEventListener("closeSidebar", handleCloseSidebar);
  }, [close]);

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      styles={{
        main: {
          background: theme.bg,
          color: theme.text,
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <AppShell.Header
        style={{
          backdropFilter: "blur(12px)",
          background: theme.glass,
          borderBottom: `1px solid ${theme.glassBorder}`,
          zIndex: 100,
        }}
      >
        <Group h="100%" px="md" justify="space-between"> 
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={theme.primary} />

            <Group gap={8}>
              <Image src={logoImg} w={38} h={38} />
              <Box visibleFrom="sm">
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
                  <span style={{ color: theme.text }}>INVINCIBLE</span>
                  <span style={{ color: theme.primary }}>.SUI</span>
                </div>
              </Box>
            </Group>
          </Group>

          {/* 🔥 WALLET BUTTON */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {address ? (
              <Group gap="xs">
                <Button
                  radius="md"
                  size="sm"
                  style={{
                    background: "rgba(34, 211, 238, 0.1)",
                    border: `1px solid ${theme.primary}`,
                    color: theme.primary,
                    fontWeight: 700,
                    boxShadow: theme.glow,
                  }}
                >
                  🔑 {shortAddr}
                </Button>

                <Button
                  radius="md"
                  size="sm"
                  variant="outline"
                  color="red"
                  onClick={logout}
                >
                  Logout
                </Button>
              </Group>
            ) : (
              <ConnectModal
                // Slush Wallet sẽ tự động xuất hiện nếu đã cài đặt extension
                // Có thể filter wallets bằng cách uncomment dòng dưới:
                // walletFilter={(wallet) => wallet.name === 'Slush Wallet'}
                trigger={
                  <Button
                    radius="md"
                    size="sm"
                    style={{
                      background: theme.primary,
                      color: "#000",
                      boxShadow: theme.glow,
                      border: "none",
                      fontWeight: 700,
                    }}
                  >
                    ☀️ Connect Wallet
                  </Button>
                }
              />
            )}
          </motion.div>
        </Group>
      </AppShell.Header>

      {/* ================= SIDEBAR ================= */}
      <AppShell.Navbar
        p="md"
        style={{
          backdropFilter: "blur(12px)",
          background: theme.glass,
          borderRight: `1px solid ${theme.glassBorder}`,
        }}
      >
        <Divider opacity={0.06} mb="sm" />

        <NavItem label="🏠 Home" to="/" active={pathname === "/"} />
        <NavItem label="🎮 Games" to="/game" active={pathname === "/game"} />
        <NavItem label="🏆 Tournament" to="/tournament" active={pathname === "/tournament"} badge="SOON" disabled />
        <NavItem label="💰 History" to="/reward" active={pathname === "/reward"} />
        
        <Divider my="sm" color="rgba(255,255,255,0.1)" />
        
        <div style={{ padding: "0 10px", marginTop: "auto" }}>
           <div style={{ fontSize: "0.75rem", color: theme.muted, marginBottom: 8 }}>LIVE STATS</div>
           <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
             <span style={{ color: theme.text }}>SUI Price</span>
             <span style={{ color: theme.success }}>$1.85 (+2%)</span>
           </div>
        </div>
      </AppShell.Navbar>

      {/* ================= CONTENT ================= */}
      <AppShell.Main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </AppShell.Main>
    </AppShell>
  );
}

/* =========================
   🌟 NAV ITEM
========================= */

type NavItemProps = {
  label: string;
  to: string;
  active: boolean;
  badge?: string;
  disabled?: boolean;
};

function NavItem({ label, to, active, badge, disabled }: NavItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      notifications.show({
        title: 'Coming Soon 🚧',
        message: 'The Tournament Arena is currently under construction. Stay tuned!',
        color: 'yellow',
        autoClose: 3000,
      });
      return;
    }
    if (window.innerWidth < 768) {
      window.dispatchEvent(new Event("closeSidebar"));
    }
  };

  return (
    <motion.div whileHover={{ x: 6 }} whileTap={{ scale: 0.98 }}>
      <NavLink
        component={Link}
        to={to}
        label={label}
        active={active}
        rightSection={badge && <Badge size="xs" variant="filled" color="yellow" style={{color: 'black'}}>{badge}</Badge>}
        onClick={handleClick}
        styles={{
          root: {
            borderRadius: 10,
            marginBottom: 6,
            padding: "10px 14px",
            fontWeight: 500,
            color: disabled ? "rgba(255,255,255,0.3)" : (active ? "#000" : theme.muted),
            cursor: disabled ? "not-allowed" : "pointer",
            background: active
              ? theme.primary
              : "transparent",
            transition: "0.25s",
            position: "relative",
            overflow: "hidden",
            boxShadow: active ? theme.glow : "none",

            "&::before": active
              ? {
                  content: '""', // Remove side bar, use full fill
                  display: "none",
                }
              : {},
            "&:hover": disabled ? {} : {
              background: active ? theme.primary : "rgba(255,255,255,0.05)",
              color: active ? "#000" : theme.text,
            }
          },
        }}
      />
    </motion.div>
  );
}
