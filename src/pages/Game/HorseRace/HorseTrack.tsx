import Horse from "./Horse";
import { Box, Text } from "@mantine/core";

export default function HorseTrack({ horses, winner }: any) {
  return (
    <Box style={{ position: "relative", padding: "8px 6px" }}>
      {/* Start gate */}
      <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 8, background: "#333", opacity: 0.35, borderRadius: 4, zIndex: 1 }} />

      {/* Finish line */}
      <div style={{ position: "absolute", right: 20, top: 4, bottom: 4, width: 8, background: "repeating-linear-gradient(45deg,#fff 0 6px,#000 6px 12px)", opacity: 0.95, zIndex: 3 }} />

      {horses.map((h: any, idx: number) => (
        <Box
          key={h.id}
          style={{
            position: "relative",
            height: 64,
            borderBottom: "1px dashed rgba(255,255,255,0.06)",
            padding: "6px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
            <div style={{ width: 22, height: 22, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
              {h.id}
            </div>
          </div>

          <Horse id={h.id} name={h.name} progress={h.progress} highlight={winner === h.id} />

          <div style={{ width: 70, textAlign: "right", paddingRight: 8 }}>
            <Text size="xs" c="dimmed">x{h.multiplier}</Text>
          </div>
        </Box>
      ))}
    </Box>
  );
}
