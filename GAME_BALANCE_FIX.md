# 🎮 Game Balance Update Complete - Hướng dẫn Sử dụng

## 🎯 Vấn đề & Giải pháp

### ❌ Vấn đề Gốc
Khi chơi game và thắng, số dư SUI không tăng trong ví. Lý do là game logic chỉ chạy locally, **không ghi transaction lên blockchain**.

### ✅ Giải pháp
Đã thêm smart contract functions để:
1. **Place Bet**: Gửi SUI từ ví đến Treasury
2. **Claim Reward**: Nhận phần thưởng từ Treasury nếu thắng
3. **Deposit to Treasury**: Nạp tiền vào Treasury (để admin fund)

---

## 🚀 Hướng dẫn Sử dụng Game

### 1️⃣ Fund Treasury (Admin/Test)
Trước tiên, Treasury phải có tiền để trả thưởng cho người chơi:

```bash
# Vào tab Mines > click button "🏦 Fund Treasury"
# Hoặc transfer SUI trực tiếp từ terminal:
sui client transfer-sui --to 0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471 --amount 500000000 --gas-budget 1000000
```

**Treasury ID**: `0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471`

### 2️⃣ Chơi Game

#### Slot Machine 🎰
1. Connect Slush Wallet
2. Input bet amount (ví dụ: 1 SUI)
3. Click **Spin**
4. Game sẽ:
   - ✅ **Nếu thắng**: `claimReward()` được gọi → SUI được chuyển từ Treasury → Balance tăng
   - ❌ **Nếu thua**: Transaction hoàn tất → Balance giảm

#### Mines 💣
1. Connect Slush Wallet
2. Select difficulty + input bet
3. Click cells để chơi
4. **Cash Out** khi thắng:
   - Gọi `claimReward()` contract function
   - Nhận thưởng từ Treasury
   - Balance refresh tự động sau 1 giây

#### Tài Xỉu 🎲
1. Connect Slush Wallet
2. Input bet + chọn TAI/XIU
3. Khi thắng: `claimReward()` được gọi → Balance tăng

---

## 📊 Transaction Flow (Suiscan)

### Win Transaction Trên Suiscan:
```
Balance Changes:
┌─ Account: 0x299b2790d5bc2cd1084...  
│  Amount: +10.5 SUI (reward received)
│  Currency: SUI
│
└─ Account: 0xbe0f1df0756436d511a...  (Treasury)
   Amount: -10.5 SUI (reward sent to player)
   Currency: SUI

Object Changes:
├─ Treasury coin → updated (balance decreased)
├─ Player coin → created (reward received)
└─ Gas object → consumed
```

**Đây là kết quả chính xác!** Thực ra giao dịch đã hoạt động:
- ✅ Treasury gửi tiền (Balance decreased)
- ✅ Player nhận tiền (Balance increased)
- ✅ Transaction successful

---

## 🔧 Smart Contract Functions

### `placeBet(treasury: &mut GameTreasury, coin: Coin<SUI>)`
- **Mục đích**: Khóa bet SUI trong Treasury trước khi game diễn ra
- **Gọi lúc**: Click spin/start game
- **Kết quả**: SUI được đưa vào Treasury

### `claimReward(treasury: &mut GameTreasury, amount: u64)`
- **Mục đích**: Nhận phần thưởng từ Treasury
- **Gọi lúc**: Win game
- **Kết quả**: SUI được chuyển từ Treasury → Player wallet
- **Lưu ý**: Treasury phải có đủ tiền!

### `depositToTreasury(treasury: &mut GameTreasury, coin: Coin<SUI>)`
- **Mục đích**: Admin nạp tiền vào Treasury
- **Gọi lúc**: Button "Fund Treasury"
- **Kết quả**: Treasury balance tăng

---

## 📝 Contract Details

**Package ID**: `0x7f8cd5947a963c08e6f7c846fc86c41b7ff5050c038c406807b0a895f701bc9b`  
**Treasury ID**: `0xbe0f1df0756436d511abae97fe8e33c69f811d7fcf7f3a49b128f8e642ad2471`  
**Network**: Sui Testnet  
**Module**: `mines`  

---

## ✅ Checklist Trước Khi Deploy

- [x] Contract đã deploy lên Testnet
- [x] useSuiContract hook có placeBet + claimReward functions
- [x] SlotMachine.tsx gọi claimReward khi thắng
- [x] TaiXiu.tsx gọi claimReward khi thắng
- [x] Mines.tsx gọi claimReward khi Cash Out
- [x] Balance refresh tự động sau transaction
- [x] Build thành công (no TypeScript errors)
- [ ] Fund Treasury với SUI testnet
- [ ] Test tất cả games trên Testnet
- [ ] Verify transaction trên Suiscan

---

## 🐛 Troubleshooting

### ❓ Q: Thắng nhưng balance không tăng?
**A**: 
1. Treasury có thể hết tiền → Fund lại
2. Contract function có thể fail → Check Suiscan logs
3. Balance refresh chậm → Chờ 2-3 giây

### ❓ Q: Thấy error "Object not found"?
**A**: Treasury ID có thể sai → Verify trong [config/web3.ts](src/config/web3.ts)

### ❓ Q: Transfer gốc vẫn hoạt động?
**A**: Có! `transferSui()` vẫn còn để chuyển tiền trực tiếp giữa ví.

---

## 📚 Files Được Update

- ✅ `src/hooks/useSuiContract.ts` - Thêm placeBet, claimReward, depositToTreasury
- ✅ `src/pages/Game/Slot/SlotMachine.tsx` - Gọi claimReward
- ✅ `src/pages/Game/TaiXiu/TaiXiu.tsx` - Gọi claimReward
- ✅ `src/pages/Game/Mine/Mines.tsx` - Gọi claimReward + depositToTreasury
- ✅ `src/config/web3.ts` - Contract IDs từ deployed contract

---

## 🎉 Next Steps

1. **Start dev server**: `npm run dev`
2. **Open http://localhost:5173**
3. **Fund Treasury** (Mines tab > button "Fund Treasury")
4. **Play games** và verify thắng → balance tăng! 🚀

