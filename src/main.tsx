import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const theme = createTheme({
  fontFamily: "Inter, sans-serif",
  defaultRadius: "md",
  primaryColor: "violet",

  colors: {
    neon: [
      "#e0f7ff",
      "#b3ecff",
      "#80dfff",
      "#4dd2ff",
      "#1ac6ff",
      "#00ade6",
      "#0088b3",
      "#006280",
      "#003c4d",
      "#00161a",
    ],
  },

  primaryShade: 5,

  components: {
    Button: {
      styles: () => ({
        root: {
          background:
            "linear-gradient(135deg, rgba(162,89,255,1) 0%, rgba(0,229,255,1) 100%)",
          color: "#fff",
          border: "none",
          transition: "0.3s",
        },
      }),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
