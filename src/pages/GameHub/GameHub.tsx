import { Container, Title, Grid, Card, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { games } from "./games.config";

const MotionLink = motion(Link);

export default function GameHub() {
  return (
    <Container size="lg">
      <Title mb="xl">🎮 Game Center</Title>

      <Grid>
        {games.map((game) => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={game.key}>
            <MotionLink
              to={game.path}
              whileHover={{ scale: 1.06 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                color: "white",
                textDecoration: "none",
                cursor: "pointer",
                padding: 16,
                display: "block",
              }}
            >
              <Title order={3}>{game.name}</Title>
              <Text mt="sm" c="gray.4">
                Click để chơi
              </Text>
            </MotionLink>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
