/**
 * 🎮 Sui Game Treasury Configuration
 * 
 * PACKAGE_ID: Smart contract package deployed on Sui
 * TREASURY_ID: Treasury object that holds game funds (receives bets, sends rewards)
 */

// 🎯 Smart Contract Package ID (Mines contract on Testnet)
export const PACKAGE_ID =
  "0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b";

// 🏦 Treasury Object ID (receives bets, sends rewards)
export const TREASURY_ID =
  "0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471";

// For backward compatibility with existing code
export const TREASURY_ADDRESS = TREASURY_ID;

// Devnet / Testnet config (for development)
export const NETWORKS = {
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
};

// Game fee (5%)
export const GAME_FEE = 0.05;

// Validation function for Sui address
export const isValidSuiAddress = (address: string): boolean => {
  // Sui addresses are 64 hex characters with 0x prefix
  return /^0x[0-9a-fA-F]{64}$/.test(address);
};
