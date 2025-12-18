# 🚀 Complete Setup & Troubleshooting Guide

## ⚡ Quick Start (5 phút)

### 1️⃣ Fund Treasury (Bắt Buộc!)
```bash
# Open terminal and run:
sui client transfer-sui \
  --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 \
  --amount 100000000000 \
  --gas-budget 1000000
```

**Wait for:** "Status: Success" ✅

### 2️⃣ Verify Treasury Funded
```bash
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471
```

**Look for:** `"value": "100000000000"` (or higher)

### 3️⃣ Start App
```bash
npm run dev
# Open http://localhost:5174
```

### 4️⃣ Test Game
1. Connect Slush Wallet
2. Play Slot Machine
3. Win 🎉 → Should see balance increase

---

## 🔍 Contract IDs (Verify These!)

| Item | Value |
|------|-------|
| **Package ID** | `0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b` |
| **Treasury ID** | `0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471` |
| **Network** | Sui Testnet |
| **Module** | `mines` |

**File:** `src/config/web3.ts` ✅ Already configured

---

## ❌ Error: "Unable to process transaction"

### Root Cause
```
MoveAbort(..., function_name: "claim_reward", ... }, 1)
Error Code 1 = EInsufficientBalance
```

**Translation:** Treasury has insufficient balance to pay reward!

### Solution Checklist
```bash
# Step 1: Check current Treasury balance
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471

# If balance is 0 or very low:

# Step 2: Fund more SUI
sui client transfer-sui \
  --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 \
  --amount 500000000000 \
  --gas-budget 1000000

# Step 3: Verify
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471

# Step 4: Refresh browser
# Ctrl+F5
# Reconnect wallet
# Try game again
```

---

## 🎯 How Game Works

### Win Flow
```
Player bets 1 SUI
    ↓
Game spins (local)
    ↓
WIN! Reward = 1 × 15 = 15 SUI
    ↓
claimReward(15) called
    ↓
Contract checks: Treasury.balance >= 15? ✅
    ↓
Transfer 15 SUI from Treasury → Player
    ↓
Suiscan shows: Treasury -15 SUI, Player +15 SUI
    ↓
UI refreshes: Balance increases ✅
```

### Lose Flow
```
Player bets 1 SUI
    ↓
Game spins (local)
    ↓
LOSE! No reward
    ↓
Transaction ends
    ↓
No claimReward call
    ↓
Balance unchanged
```

---

## 📊 Debug Info

### Console Logging (F12 → Console)
When you play and WIN, you should see:

```javascript
🎯 claimReward called with: {
  amountSUI: 15,
  amountMIST: "15000000000",
  treasuryId: "0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471",
  packageId: "0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b",
  account: "0x299b27..."
}
```

If NOT showing → claimReward not being called (game logic issue)

---

## 🎮 Games & Payouts

### Slot Machine 🎰
```
Symbols:    🍒 🍋 🔔 ⭐ 💎
Multiplier: 2x 3x 5x 8x 15x

Example: 1 SUI bet
- Match 🍒 = 2 SUI reward
- Match 💎 = 15 SUI reward
```

### Tài Xỉu 🎲
```
Bet 1 SUI + Choose TAI or XIU
Roll dice (sum: 3-18)
- TAI: sum > 10 = WIN
- XIU: sum < 11 = WIN
- Reward: 2× bet if WIN
```

### Mines 💣
```
Select difficulty + bet
Find gems, avoid mines
Multiply bet by gem values
Cash Out = Get reward
```

---

## 🔧 Treasury Management

### Deposit (Fund Treasury)
```bash
sui client transfer-sui \
  --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 \
  --amount [AMOUNT_IN_MIST] \
  --gas-budget 1000000
```

**Amount in MIST:** 1 SUI = 1,000,000,000 MIST
- 10 SUI = 10,000,000,000
- 100 SUI = 100,000,000,000
- 500 SUI = 500,000,000,000

### Withdraw (Admin - Get money back)
```bash
sui client call \
  --package 0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b \
  --module mines \
  --function withdraw \
  --args 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 [YOUR_ADDRESS] \
  --gas-budget 5000000
```

---

## ✅ Verification Steps

### 1. Verify Contract IDs
```bash
cat src/config/web3.ts | grep -E "PACKAGE_ID|TREASURY_ID"
```

**Expected:**
```
export const PACKAGE_ID = "0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b";
export const TREASURY_ID = "0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471";
```

### 2. Check Network
```bash
sui client envs
# Should show "testnet" as active
```

### 3. Check Active Address
```bash
sui client active-address
# Should match your Slush Wallet address
```

### 4. Check Treasury Exists
```bash
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471
```

**Expected:** Should show object content (not "Object Not Found")

### 5. Check Treasury Balance
```bash
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 --json | jq '.data.content.fields.balance.fields.value'
```

**Expected:** Number > 0 (e.g., "100000000000" for 100 SUI)

---

## 🚨 Emergency: Still Not Working?

### Option 1: Check Recent Transactions
```bash
sui client recent-transactions 10
# Find your fund transaction and verify it succeeded
```

### Option 2: Fund More
Maybe previous fund ran out. Fund again:
```bash
sui client transfer-sui \
  --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 \
  --amount 1000000000000 \
  --gas-budget 1000000
```

### Option 3: Restart App
1. Hard refresh: `Ctrl+F5`
2. Disconnect wallet: Click wallet → Disconnect
3. Reconnect wallet: Click Connect → Approve
4. Try game again

### Option 4: Check Browser Console
```
F12 → Console tab
Play game
Look for:
- 🎯 claimReward called with... (should appear)
- Any red errors
```

---

## 📞 Common Q&A

### Q: How much SUI should I fund?
**A:** Minimum 100 SUI. Max reward per spin is 15 SUI (1 SUI bet × 15x payout). With 100 SUI, can handle ~6 max wins.

### Q: What if Treasury runs out?
**A:** Fund more! Only takes 30 seconds.

### Q: Can I use devnet instead?
**A:** No. Must use testnet. Check: `sui client envs`

### Q: Game doesn't show "Connecting to wallet"?
**A:** Refresh page. Make sure Slush Wallet extension is installed.

### Q: Wallet shows different balance than UI?
**A:** Refresh page. Balance syncs every spin/transaction.

### Q: How do I know if fund was successful?
**A:** Run: `sui client recent-transactions 1`

---

## 🎯 Final Checklist Before Playing

- [ ] Fund Treasury: `sui client transfer-sui --to 0xbe0f1df... --amount 100000000000`
- [ ] Wait for confirmation: "Status: Success"
- [ ] Verify balance: `sui client object 0xbe0f1df...`
- [ ] See `"value": "100000000000"` or higher ✅
- [ ] Start app: `npm run dev`
- [ ] Open: `http://localhost:5174`
- [ ] Connect wallet
- [ ] Play game
- [ ] Win test: Bet 1 SUI, hope for 15x payout 🍀

---

**Ready?** Fund Treasury now! 🚀

