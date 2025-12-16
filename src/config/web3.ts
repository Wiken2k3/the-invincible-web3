/**
 * 🎮 Sui Game Treasury Configuration
 * 
 * Change TREASURY_ADDRESS to your actual Sui wallet address
 * Example format: 0x1234567890abcdef...
 */

// ⚠️ REPLACE THIS WITH YOUR ACTUAL SUI WALLET ADDRESS
// You can find your wallet address in Sui Wallet / Slush Wallet
export const TREASURY_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

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
