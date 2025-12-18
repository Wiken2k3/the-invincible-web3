import Horse from "./Horse";
import { Box } from "@mantine/core";

export default function HorseTrack({ horses }: any) {
  return (
    <Box>
      {horses.map((h: any) => (
        <Box
          key={h.id}
          style={{
            position: "relative",
            height: 40,
            borderBottom: "1px dashed #ccc",
          }}
        >
          <Horse progress={h.progress} />
        </Box>
      ))}
    </Box>
  );
}
