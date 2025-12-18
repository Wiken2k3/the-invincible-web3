# ❌ Lỗi: Unable to Process Transaction - Error Code 1

## 🔍 Nguyên Nhân
```
MoveAbort(..., function_name: "claim_reward", ... }, 1)
```

**Error Code 1 = `EInsufficientBalance`** → **Treasury không có đủ tiền!**

---

## ✅ Giải Pháp Chi Tiết

### Bước 1: Verify Config (Kiểm tra địa chỉ)
```typescript
// src/config/web3.ts
export const PACKAGE_ID = "0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b";
export const TREASURY_ID = "0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471";
```
✅ Đã verify - đúng!

---

### Bước 2: Check Treasury Balance Hiện Tại

#### Cách 1: Terminal (Dễ nhất)
```bash
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471
```

**Output cần kiếm:**
```
{
  ...
  "balance": {
    "fields": {
      "value": "5000000000"  // ← Cái này!
    }
  }
  ...
}
```

Nếu `value` = 0 hoặc không có → **TREASURY RỖ NG!**

#### Cách 2: Via Suiscan
```
1. Vào https://suiscan.xyz/testnet
2. Search: 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471
3. Xem "Balance" mục
```

---

### Bước 3: Fund Treasury (Bắt Buộc!)

#### ⭐ Cách Đơn Giản Nhất:
```bash
sui client transfer-sui \
  --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 \
  --amount 100000000000 \
  --gas-budget 1000000
```

**Giải thích:**
- `--to`: Treasury ID
- `--amount 100000000000`: 100 SUI (1 SUI = 1,000,000,000 MIST)
- `--gas-budget`: Fee cho transaction

#### ⭐ Cách Dùng Script:
```bash
# PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File fund_treasury.ps1 100

# Bash (macOS/Linux)
bash fund_treasury.sh 100
```

---

### Bước 4: Verify Funding Success

```bash
# Check lại balance
sui client object 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471

# Hoặc check transaction
sui client recent-transactions 5
```

**Khi thành công:**
```
✅ value: "100000000000"  (100 SUI)
✅ Status: Success
✅ Digest: [tx_hash]
```

---

## 🎮 Lý Do Treasury Hết Tiền

| Sự kiện | Bet | Payout | Reward | Treasury After |
|--------|-----|--------|--------|-----------------|
| Start | - | - | - | 100 SUI ✅ |
| Play 1: Win | 1 SUI | 15x | 15 SUI | 85 SUI |
| Play 2: Win | 2 SUI | 8x | 16 SUI | 69 SUI |
| Play 3: Win | 5 SUI | 5x | 25 SUI | 44 SUI |
| Play 4: Win | 10 SUI | 3x | 30 SUI | 14 SUI |
| Play 5: Win | 2 SUI | 8x | 16 SUI | ❌ **-2 SUI (ERROR!)** |

→ **Phải fund lại!**

---

## 🔧 Debug: Xem Exact Amount

Open browser **Developer Console** (F12):

```javascript
// Tự động log khi click spin/bet
// Sẽ thấy trong Console:
// 🎯 claimReward called with: {
//   amountSUI: 15,
//   amountMIST: "15000000000",
//   treasuryId: "0xbe0f1df...",
//   ...
// }
```

---

## ⚠️ Common Issues

### Q: Treasury đang có 100 SUI nhưng vẫn error?
**A**: Có thể pending transactions. Chờ 2-3 giây rồi thử lại.

### Q: Fund success nhưng vẫn error?
**A**: 
1. Refresh page (Ctrl+F5)
2. Reconnect wallet
3. Check config files have latest TREASURY_ID

### Q: Muốn withdraw tiền từ Treasury?
**A**: 
```bash
sui client call --package 0x7f8cd... --module mines --function withdraw \
  --args 0xbe0f1df... [YOUR_ADDRESS] --gas-budget 5000000
```

---

## 📋 Checklist

- [ ] Verified TREASURY_ID = `0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471`
- [ ] Ran `sui client object` and saw balance
- [ ] Fund Treasury với ≥ 100 SUI
- [ ] Transaction thành công trên Suiscan
- [ ] Refresh app & reconnect wallet
- [ ] Try play game again

---

## 🚀 Sau Khi Fund:

```bash
# 1. Refresh browser
# Ctrl+F5

# 2. Reconnect wallet
# Click "Disconnect" → "Connect Wallet" again

# 3. Try play
# Bet 1 SUI, spin
# Expected: WIN → Balance increases ✅
```

---

## 📞 Still Error?

Check these in order:

1. **Console log**: Open F12 → Console → Play game → Look for `🎯 claimReward called`
2. **Check balance**: `sui client object 0xbe0f1df...`
3. **Verify network**: `sui client envs` → should be testnet
4. **Verify active address**: `sui client active-address` → should match Slush wallet
5. **Fund amount**: Make sure funding > potential reward

---

**Fund Treasury now, then test!** 🚀
