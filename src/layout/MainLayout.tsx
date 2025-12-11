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
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
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
  const [opened, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();

  // Tự động đóng sidebar khi chuyển route trên mobile
  useEffect(() => {
    if (opened && window.innerWidth < 768) {
      // Delay nhỏ để animation mượt hơn
      const timer = setTimeout(() => {
        close();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, opened, close]);

  // Lắng nghe event để đóng sidebar từ NavItem
  useEffect(() => {
    const handleCloseSidebar = () => {
      if (opened && window.innerWidth < 768) {
        close();
      }
    };
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, [opened, close]);

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
          background: `
            radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, #0a0f1a 0%, #0f172a 50%, #1a1f2e 100%)
          `,
        },
      }}
    >
      {/* ================= HEADER ================= */}
      <AppShell.Header
        style={{
          backdropFilter: UI.blur,
          background: "rgba(15, 23, 42, 0.85)",
          borderBottom: "1px solid rgba(14, 165, 233, 0.2)",
          boxShadow: "0 4px 20px rgba(14, 165, 233, 0.1)",
        } as React.CSSProperties}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            <Group gap={8}>
              <Image src={logoImg} w={38} h={38} />
            </Group>
          </Group>

          {/* Wallet button - Màu mặt trời */}
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(245, 158, 11, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              radius="md"
              size="sm"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
                color: "#fff",
                fontWeight: 700,
              } as React.CSSProperties}
            >
              ☀️ Connect Wallet
            </Button>
          </motion.div>
        </Group>
      </AppShell.Header>

      {/* ================= SIDEBAR ================= */}
      <AppShell.Navbar
        p="md"
        style={{
          backdropFilter: UI.blur,
          background: `
            linear-gradient(180deg, 
              rgba(139, 69, 19, 0.2) 0%, 
              rgba(160, 82, 45, 0.15) 50%,
              rgba(139, 69, 19, 0.1) 100%
            )
          `,
          borderRight: "2px solid rgba(160, 82, 45, 0.3)",
          boxShadow: "4px 0 20px rgba(139, 69, 19, 0.15)",
        } as React.CSSProperties}
      >
        <Divider opacity={0.06} mb="sm" />

        <NavItem label="Trang chủ" to="/" active={pathname === "/"} />
        <NavItem label="Game" to="/game" active={pathname === "/game"} />
        <NavItem label="Nhận thưởng" to="/reward" active={pathname === "/reward"} />
      </AppShell.Navbar>

      {/* ================= CONTENT ================= */}
      <AppShell.Main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ 
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1] // Custom easing cho mượt hơn
            }}
            style={{} as React.CSSProperties}
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
};

function NavItem({ label, to, active }: NavItemProps) {
  const handleClick = () => {
    // Đóng sidebar trên mobile khi click vào menu item
    if (window.innerWidth < 768) {
      // Delay nhỏ để animation mượt hơn
      setTimeout(() => {
        const event = new Event('closeSidebar');
        window.dispatchEvent(event);
      }, 150);
    }
  };

  return (
    <motion.div
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
    >
      <NavLink
        component={Link}
        to={to}
        label={label}
        active={active}
        onClick={handleClick}
        styles={{
          root: {
            borderRadius: 10,
            marginBottom: 6,
            padding: "10px 14px",
            fontWeight: 500,
            color: active ? "#22c55e" : "rgba(255,255,255,0.85)",
            background: active
              ? "linear-gradient(90deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))"
              : "transparent",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative" as const,
            overflow: "hidden" as const,
            "&::before": active
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "4px",
                  background: "linear-gradient(180deg, #22c55e, #16a34a)",
                  borderRadius: "0 6px 6px 0",
                  boxShadow: "0 0 10px rgba(34, 197, 94, 0.4)",
                }
              : {},
            "&:hover": {
              background: active
                ? "linear-gradient(90deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.25))"
                : "rgba(34, 197, 94, 0.1)",
              transform: "translateX(4px)",
              color: active ? "#22c55e" : "#22c55e",
            },
          },
        }}
      />
    </motion.div>
  );
}
