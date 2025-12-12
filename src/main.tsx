// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Mantine
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import theme from "./theme";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mysten/dapp-kit/dist/index.css";

// SUI Wallet + Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

// QueryClient instance
const queryClient = new QueryClient();

// Sui networks - hardcode URL để tránh lỗi Vite resolve
const networks = {
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
};

// Root
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <WalletProvider autoConnect>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <Notifications position="top-right" zIndex={3000} />
            <App />
          </MantineProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
