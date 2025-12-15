import { Card, Title, Text, Button, Badge } from "@mantine/core";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function GameCard({ game }: any) {
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -6, scale: 1.02 }}
      radius="lg"
      p="lg"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        height: "100%",
      }}
    >
      {game.comingSoon && (
        <Badge color="yellow" mb={8}>
          Coming Soon
        </Badge>
      )}

      <Title order={3} c="white">
        {game.name}
      </Title>

      <Text c="gray.4" mt={6}>
        {game.description}
      </Text>

      <Text mt={10} c="cyan">
        Fee: {game.fee} SUI
      </Text>

      <Button
        fullWidth
        mt="md"
        radius="md"
        component={Link}
        to={game.path}
        disabled={game.comingSoon}
      >
        Play
      </Button>
    </Card>
  );
}
