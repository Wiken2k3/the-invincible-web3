import {
  Title,
  Text,
  Button,
  Container,
  Stack,
  Image,
  Center,
  Grid,
  Card,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

export default function Home() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at 20% 20%, rgba(155, 0, 255, 0.55), transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(0, 200, 255, 0.45), transparent 60%),
          #0a0f1f
        `,
      }}
    >
      {/* PARTICLE OVERLAY */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://cdn.jsdelivr.net/gh/JulienHe/img-host/particles.webp')",
          backgroundSize: "cover",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* PLANET HOLOGRAM */}
      <motion.img
        src="https://cdn.jsdelivr.net/gh/JulienHe/img-host/planet-neon.png"
        alt="planet"
        initial={{ opacity: 0, scale: 0.7, x: 80 }}
        animate={{ opacity: 0.9, scale: 1, x: 0 }}
        transition={{ duration: 1.4 }}
        style={{
          position: "absolute",
          right: "-120px",
          bottom: "-40px",
          width: "480px",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 20px #9b5cff)",
          opacity: 0.8,
        }}
      />

      {/* ==========================
          SECTION A — HERO INTRO
      =========================== */}
      <Container size="lg" py={120} style={{ position: "relative", zIndex: 10 }}>
        <Stack gap="md" align="center">
          {/* LOGO */}
          <Center mb="lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Image
                src={logo}
                width={140}
                alt="Project Logo"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(162, 89, 255, 0.5))",
                }}
              />
            </motion.div>
          </Center>

          {/* TITLE */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
          >
            <Title
              order={1}
              size={48}
              ta="center"
              fw={800}
              style={{
                background: "linear-gradient(135deg, #A259FF 0%, #00E5FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 25px rgba(140,50,255,0.35)",
              }}
            >
              Welcome to The Invincible
            </Title>
          </motion.div>

          {/* SUBTEXT */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3 }}
          >
            <Text size="xl" c="gray.2" maw={600} ta="center">
              Trải nghiệm Web3 Game — hoàn thành nhiệm vụ, nhận lootbox và mint
              phần thưởng on-chain!
            </Text>
          </motion.div>

          {/* BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            <Button
              size="lg"
              radius="xl"
              component={Link}
              to="/game"
              mt="lg"
              px={40}
              styles={{
                root: {
                  background:
                    "linear-gradient(135deg, #A259FF 0%, #00E5FF 100%)",
                  boxShadow: "0 0 15px rgba(162,89,255,0.4)",
                },
              }}
            >
              Bắt đầu chơi game
            </Button>
          </motion.div>
        </Stack>
      </Container>

      {/* =====================================
           SECTION B — GAMEPLAY FEATURES
      ====================================== */}
      <Container size="lg" py={100}>
        <Title
          order={2}
          ta="center"
          fw={700}
          mb={40}
          style={{
            color: "white",
            textShadow: "0 0 15px rgba(0,200,255,0.5)",
          }}
        >
          Gameplay Features
        </Title>

        <Grid>
          {[
            {
              title: "Farming Garden",
              text: "Trồng cây – thu hoạch – nâng cấp để nhận coin.",
              img: "https://cdn.jsdelivr.net/gh/JulienHe/img-host/garden.png",
            },
            {
              title: "Lootbox Rewards",
              text: "Mở Mystery Box để nhận vật phẩm hiếm & điểm airdrop.",
              img: "https://cdn.jsdelivr.net/gh/JulienHe/img-host/lootbox.png",
            },
            {
              title: "Airdrop Points",
              text: "Càng chơi nhiều — càng tích lũy nhiều điểm thưởng.",
              img: "https://cdn.jsdelivr.net/gh/JulienHe/img-host/airdrop.png",
            },
          ].map((item, idx) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={idx}>
              <Card
                padding="lg"
                radius="lg"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Image src={item.img} radius="md" mb="md" />
                <Title order={3} c="white" size={24} mb="sm">
                  {item.title}
                </Title>
                <Text c="gray.3">{item.text}</Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* =====================================
           SECTION C — CALL TO ACTION
      ====================================== */}
      <Container size="lg" py={120}>
        <Stack align="center" gap="md">
          <Title
            order={2}
            ta="center"
            fw={800}
            style={{
              color: "white",
              textShadow: "0 0 20px rgba(162,89,255,0.5)",
            }}
          >
            Sẵn sàng khám phá thế giới Web3?
          </Title>
          <Text ta="center" c="gray.3" maw={600}>
            Bắt đầu cuộc hành trình — trồng cây, nhận coin, mở lootbox và tranh
            top airdrop!
          </Text>

          <Button
            size="lg"
            radius="xl"
            component={Link}
            to="/game"
            mt="lg"
            px={40}
            styles={{
              root: {
                background:
                  "linear-gradient(135deg, #A259FF 0%, #00E5FF 100%)",
                boxShadow: "0 0 15px rgba(162,89,255,0.4)",
              },
            }}
          >
            Chơi ngay
          </Button>
        </Stack>
      </Container>
    </div>
  );
}
