import { Card, Text, Title, Badge } from "@mantine/core";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionCard = motion(Card as any);

type Props = {
  name: string;
  icon: string;
  description: string;
  path: string;
  gradient: string;
};

export default function GameCard({
  name,
  icon,
  description,
  path,
  gradient,
}: Props) {
  return (
    <Link to={path} style={{ textDecoration: "none" }}>
      <MotionCard
        whileHover={{ y: -10, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        radius="xl"
        p="lg"
        style={{
          height: "100%",
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            ${gradient}
          `,
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.35), transparent 60%)",
            opacity: 0.25,
          }}
        />

        <Badge
          variant="light"
          color="white"
          style={{ backdropFilter: "blur(6px)" }}
        >
          PLAY
        </Badge>

        <Title order={3} mt="md">
          {icon} {name}
        </Title>

        <Text mt="xs" size="sm" c="gray.2">
          {description}
        </Text>
      </MotionCard>
    </Link>
  );
}