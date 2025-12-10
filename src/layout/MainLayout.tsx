import {
  AppShell,
  Burger,
  Button,
  Group,
  Image,
  NavLink,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logoImg from "../assets/logo.png";

/* =========================
   🎨 THEME CONFIG (Sui-like)
========================= */
const UI = {
  gradient: "linear-gradient(135deg,#A259FF,#00E5FF)",
  glass: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  blur: "blur(18px)",
};

/* =========================
   🔥 MAIN LAYOUT
========================= */
export default function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { pathname } = useLocation();

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
          background: "radial-gradient(circle at top,#1a1230 0%,#09080f 80%)",
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <AppShell.Header
        style={{
          backdropFilter: UI.blur,
          background: "rgba(18,18,30,0.6)",
          borderBottom: UI.border,
        } as React.CSSProperties}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            <Group gap={8}>
              <Image src={logoImg} w={38} h={38} />
            </Group>
          </Group>

          {/* Wallet button (mock) */}
          <Button
            radius="md"
            size="sm"
            style={{
              background: UI.gradient,
              boxShadow: "0 0 16px rgba(0,229,255,0.5)",
            } as React.CSSProperties}
          >
            Connect Wallet
          </Button>
        </Group>
      </AppShell.Header>

      {/* ================= SIDEBAR ================= */}
      <AppShell.Navbar
        p="md"
        style={{
          backdropFilter: UI.blur,
          background: "rgba(20,20,35,0.25)",
          borderRight: UI.border,
        } as React.CSSProperties}
      >
        <Divider opacity={0.06} mb="sm" />

        <NavItem label="Trang chủ" to="/" active={pathname === "/"} />
        <NavItem label="Game" to="/game" active={pathname === "/game"} />
        <NavItem label="Nhận thưởng" to="/reward" active={pathname === "/reward"} />
      </AppShell.Navbar>

      {/* ================= CONTENT ================= */}
      <AppShell.Main>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{} as React.CSSProperties}
        >
          <Outlet />
        </motion.div>
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
};

function NavItem({ label, to, active }: NavItemProps) {
  return (
    <motion.div whileHover={{ x: 6 }}>
      <NavLink
        component={Link}
        to={to}
        label={label}
        active={active}
        styles={{
          root: {
            borderRadius: 10,
            marginBottom: 6,
            padding: "10px 14px",
            fontWeight: 500,
            color: active ? "#A259FF" : "#fff",
            background: active
              ? "linear-gradient(90deg,#A259FF22,#00E5FF22)"
              : "transparent",
            transition: "0.25s",
          },
        }}
      />
    </motion.div>
  );
}
