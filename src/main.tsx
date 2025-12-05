// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Mantine
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import theme from "./theme"; // ⭐ Tách theme ra file riêng cho clean

// Global styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
