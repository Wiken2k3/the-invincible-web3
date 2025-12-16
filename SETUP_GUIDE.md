# 🎮 The Invincible Web3 - Setup Guide

## 📋 Prerequisites

- Node.js 20.19+ or 22.12+
- Sui Wallet or Slush Wallet extension installed
- SUI testnet/mainnet tokens for testing

---

## 🔧 Configuration Steps

### Step 1: Get Your Sui Wallet Address

1. **Open Sui Wallet Extension** in your browser
2. Click on your wallet name to copy your address
3. Address format example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

### Step 2: Configure Treasury Address

1. Open file: `src/config/web3.ts`

2. Find this line:
   ```typescript
   export const TREASURY_ADDRESS =
     "0x0000000000000000000000000000000000000000000000000000000000000000";
   ```

3. Replace with your wallet address:
   ```typescript
   export const TREASURY_ADDRESS =
     "0xYOUR_ACTUAL_WALLET_ADDRESS_HERE";
   ```

4. Save the file

5. **Reload your browser** for changes to take effect

---

## 🎯 How It Works

### Game Flow

1. **Connect Wallet** - Click "Connect Wallet" button in header
2. **Select Game** - Choose a game (Dice, Horse Race, etc.)
3. **Place Bet** - Enter bet amount in SUI
4. **Play** - Click Roll/Play button
5. **Transaction** - Sui Wallet opens for confirmation
6. **Game Result** - Game logic determines win/loss

### Transaction Flow

```
Player clicks Roll
     ↓
Wallet opens for signature
     ↓
Player signs transaction
     ↓
SUI transferred to treasury
     ↓
Game logic processes bet
     ↓
Result displayed
```

---

## 🌐 Network Configuration

The app supports multiple Sui networks:

- **Devnet**: `https://fullnode.devnet.sui.io:443` (for testing)
- **Testnet**: `https://fullnode.testnet.sui.io:443` (for testing)
- **Mainnet**: `https://fullnode.mainnet.sui.io:443` (production)

To switch networks, update in `src/main.tsx`:

```typescript
const networks = {
  devnet: { url: "https://fullnode.devnet.sui.io:443" },
  testnet: { url: "https://fullnode.testnet.sui.io:443" },
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
};
```

---

## 🔒 Security Notes

### Before Production

1. **Never commit real addresses** - Use environment variables
2. **Test thoroughly** - Use testnet first
3. **Audit smart contracts** - If deploying custom contracts
4. **Set reasonable fees** - Currently 5% (GAME_FEE)

### Best Practices

1. Store sensitive data in `.env` files (add to `.gitignore`)
2. Use testnet for development
3. Implement proper fee structure
4. Add server-side validation for all transactions

---

## 🚀 Development Setup

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Error: "Invalid Sui address"

**Solution**: 
- Check `TREASURY_ADDRESS` in `src/config/web3.ts`
- Address must be 64 hex characters with `0x` prefix
- Reload the page after changes

### Error: "Cannot find module '@emotion/react'"

**Solution**:
```bash
npm install
```

### Wallet not connecting

**Solution**:
1. Check browser extension is installed
2. Allow site permissions in extension settings
3. Refresh the page
4. Try different wallet (Sui Wallet / Slush Wallet)

### Transaction fails

**Solution**:
1. Ensure wallet has sufficient SUI balance
2. Check network connectivity
3. Verify treasury address is valid
4. Check gas fees are sufficient

---

## 📚 Game Architecture

### Core Files

- `src/config/web3.ts` - Configuration & constants
- `src/hooks/useSuiContract.ts` - Smart contract interactions
- `src/hooks/useWallet.ts` - Wallet connection logic
- `src/pages/Game/*/` - Individual game implementations

### Game Template

Each game should follow this pattern:

```typescript
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";

export default function GameName() {
  const { address } = useWallet();
  const { transferSui } = useSuiContract();

  const play = async () => {
    // Check wallet connection
    // Call transferSui with bet amount
    // Execute game logic
    // Show result
  };

  return (
    // UI Components
  );
}
```

---

## 🎯 Next Steps

1. ✅ Configure `TREASURY_ADDRESS`
2. ✅ Test with testnet SUI tokens
3. ✅ Verify game transactions work
4. ✅ Deploy to Vercel
5. ✅ Test on mainnet (with small amounts first)

---

## 📞 Support

For issues with:
- **Sui integration**: Check [Sui Documentation](https://docs.sui.io)
- **Wallet issues**: See [Slush Wallet](https://www.slush.wallet) or [Sui Wallet](https://suiwallet.com)
- **Game logic**: Check individual game files in `src/pages/Game/`

---

**Last Updated**: December 16, 2025
