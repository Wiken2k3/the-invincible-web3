import {
  AppShell,
  Burger,
  Button,
  Group,
  Text,
  Box,
  Image,
  NavLink,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet, useLocation } from "react-router-dom";

// 👉 Import logo của bạn tại đây
// Ví dụ:
import logoImg from "../assets/logo.png";

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
          background: "radial-gradient(circle at top, #18122B 0%, #0A0A0F 70%)",
          color: "#fff",
        },
      }}
    >
      {/* HEADER */}
      <AppShell.Header
        style={{
          backdropFilter: "blur(12px)",
          background: "rgba(20,20,30,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Group justify="space-between" h="100%" px="md">
          <Group>
            {/* Burger (Mobile) */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            {/* LOGO + TITLE */}
            <Group gap="xs">
              <Image
                src={logoImg}
                height={50}
                width={50}
                radius="md"
                style={{ objectFit: "contain" }}
              />
              <Text
                fw={700}
                size="xl"
                style={{ letterSpacing: "1px", userSelect: "none" }}
              >
                {/* THE INVINCIBLE */}
              </Text>
            </Group>
          </Group>

          <Button size="sm" radius="md">
            Connect Wallet
          </Button>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar
        p="md"
        style={{
          backdropFilter: "blur(14px)",
          background: "rgba(20,20,30,0.35)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Text fw={600} mb="sm" size="lg">
          Navigation
        </Text>

        <NavLink
          label="Trang chủ"
          component={Link}
          to="/"
          active={location.pathname === "/"}
        />
        <NavLink
          label="Game"
          component={Link}
          to="/game"
          active={location.pathname === "/game"}
        />
        <NavLink
          label="Nhận thưởng"
          component={Link}
          to="/reward"
          active={location.pathname === "/reward"}
        />
      </AppShell.Navbar>

      {/* CONTENT */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
