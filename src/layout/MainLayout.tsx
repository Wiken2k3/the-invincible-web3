import {
  AppShell,
  Burger,
  Button,
  Group,
  Text,
  Image,
  NavLink,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logoImg from "../assets/logo.png";

/* ================================
   🎨 UI CONSTANTS
================================ */
const headerStyle = {
  backdropFilter: "blur(15px)",
  background: "rgba(18, 18, 30, 0.55)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const navbarStyle = {
  backdropFilter: "blur(20px)",
  background: "rgba(20, 20, 30, 0.18)",
  borderRight: "1px solid rgba(255,255,255,0.05)",
  paddingTop: "14px",
};

const gradientText = {
  background: "linear-gradient(90deg,#A259FF,#00E5FF,#A259FF)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

const walletBtnShadow = {
  base: "0 0 12px rgba(0, 229, 255, 0.45)",
  hover: "0 0 18px rgba(0, 229, 255, 0.85)",
};

/* ================================
   🔥 LAYOUT
================================ */
export default function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      styles={{
        main: {
          background:
            "radial-gradient(circle at top, #1A122E 0%, #09080F 80%)",
          color: "#fff",
        },
      }}
    >
      {/* HEADER */}
      <AppShell.Header style={headerStyle}>
        <Group justify="space-between" px="md" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            {/* LOGO + TEXT */}
            <Group gap="xs" style={{ alignItems: "center" }}>
              <Image
                src={logoImg}
                height={42}
                width={42}
                radius="md"
                style={{ objectFit: "contain" }}
              />

              {/* <Text fw={800} size="lg" style={gradientText}>
                THE INVINCIBLE
              </Text> */}
            </Group>
          </Group>

          {/* CONNECT WALLET */}
          <Button
            size="sm"
            radius="md"
            style={{
              background: "linear-gradient(135deg,#A259FF,#00E5FF)",
              boxShadow: walletBtnShadow.base,
              transition: "0.25s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = walletBtnShadow.hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = walletBtnShadow.base)
            }
          >
            Connect Wallet
          </Button>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar style={navbarStyle}>
        {/* <Text fw={700} size="lg" mb="xs" style={{ opacity: 0.85 }}>
          Navigation
        </Text> */}

        <Divider opacity={0.08} my="xs" />

        {/* NAV ITEMS */}
        <div style={{ marginTop: "10px" }}>
          <AnimatedNav
            label="Trang chủ"
            to="/"
            active={location.pathname === "/"}
          />
          <AnimatedNav
            label="Game"
            to="/game"
            active={location.pathname === "/game"}
          />
          <AnimatedNav
            label="Nhận thưởng"
            to="/reward"
            active={location.pathname === "/reward"}
          />
        </div>
      </AppShell.Navbar>

      {/* PAGE CONTENT */}
      <AppShell.Main>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
}

/* ================================
   🌟 Animated NavLink
================================ */
function AnimatedNav({ label, to, active }) {
  return (
    <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.18 }}>
      <NavLink
        label={label}
        component={Link}
        to={to}
        active={active}
        styles={{
          root: {
            padding: "9px 12px",
            borderRadius: "10px",
            color: active ? "#A259FF" : "#fff",
            background: active
              ? "linear-gradient(90deg,#A259FF33,#00E5FF33)"
              : "transparent",
            transition: "0.25s",
            marginBottom: "6px",
          },
        }}
      />
    </motion.div>
  );
}
