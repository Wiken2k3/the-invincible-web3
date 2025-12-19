# 🪐 The Invincible – Web3 Mini Farming Game

**The Invincible** là một Web3 Mini Farming Game mô phỏng mô hình **Play → Earn → Claim**. Trò chơi kết hợp cơ chế trồng cây, thu hoạch, mở Mystery Box để nhận Airdrop Points.
Giao diện được thiết kế theo phong cách **Glassmorphism + Parallax Space + Futuristic UI**, với các hiệu ứng mượt mà được thực hiện bởi **Framer Motion**.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue" />
  <img src="https://img.shields.io/badge/Vite-Bundler-yellow" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" />
  <img src="https://img.shields.io/badge/License-MIT-purple" />
  <img src="https://img.shields.io/badge/UI-Mantine%20UI-blueviolet" />
  <img src="https://img.shields.io/badge/Animation-Framer%20Motion-ff69b4" />
</p>

---

## 📸 Preview giao diện

### 🏠 Home Page
<p align="center">
  <img width="800" src="https://drive.google.com/uc?export=view&id=1lmU5xhnPkRSKbUAAaIdEh37r17Sw2zRC" />
</p>

---

### 🎮 Game – Farming System
<p align="center">
  <img width="800" src="https://drive.google.com/uc?export=view&id=1X5oAwXROUVwoFdev5dMtS3NbKfvrI-iC" />
</p>

---

### 🎁 Reward – Mystery Box
<p align="center">
  <img width="800" src="https://drive.google.com/uc?export=view&id=1vvD7jzvbGiEoXrb2cpxBLJgnWfzDxVrk" />
</p>

---

## 📑 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Giao diện nổi bật](#-uiux-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#️-cài-đặt)
- [Chạy dự án](#️-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Logic Game](#-logic-game)
- [Build & Deploy](#-build--deploy)
- [Triển khai](#-triển-khai)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)
---

# 🚀 Giới thiệu

**The Invincible** là trò chơi Farming dạng Web3 (Off-chain simulation) nơi người chơi:

- Trồng hạt → cây lớn theo thời gian  
- Thu hoạch để nhận **Coins** và **Airdrop Points (AP)**
- Dùng Coins để mua hạt giống mới trong cửa hàng
- Mở **1 trong 10 Mystery Box** để nhận phần thưởng AP ngẫu nhiên
- Theo dõi tiến trình farming với giao diện vũ trụ độc đáo

Trò chơi hoạt động hoàn toàn ở phía client bằng React và lưu trữ toàn bộ dữ liệu game trên **LocalStorage** của trình duyệt.

---

# ⭐ Tính năng chính

###  Mini-Games
Dự án bao gồm một loạt các mini-game hấp dẫn, mang đến nhiều cách thức để người chơi giải trí và kiếm thưởng:
- **Dice**: Trò chơi xúc xắc cổ điển.
- **Tài Xỉu**: Cược kết quả của ba viên xúc xắc.
- **Mines**: Trò chơi dò mìn đầy kịch tính.
- **Slot**: Vòng quay may mắn với các biểu tượng.
- **Tower**: Thử thách leo tháp qua từng tầng.
- **Wheel**: Vòng quay phần thưởng.
- **Horse Race**: Đặt cược vào cuộc đua ngựa gay cấn.

### 🎁 Mystery Box  
- Yêu cầu số dư **≥ 500 Coins** để bắt đầu.
- Mỗi lượt mở tốn **50 Coins**.
- Hệ thống sẽ tạo ra 10 hộp quà với giá trị AP ngẫu nhiên từ **10 đến 100**.
- Người chơi chỉ được chọn mở **một hộp duy nhất**.
- Các hộp còn lại sẽ bị khóa sau khi người chơi đã chọn.

---

# 🎨 UI/UX nổi bật
- **Glassmorphism**: Giao diện trong suốt tạo chiều sâu.
- **Gradient Cosmic**: Màu sắc gradient theo chủ đề vũ trụ.
- **Parallax Planet**: Hiệu ứng các hành tinh di chuyển tạo không gian 3D.
- **Particle Space Background**: Nền với các hạt lấp lánh chuyển động.
- **Popup Animated**: Các thông báo và popup được làm mượt mà với **Framer Motion**.

---
# 🧩 Công nghệ sử dụng

- **Framework**: React 18 + Vite
- **Ngôn ngữ**: TypeScript
- **UI Library**: Mantine UI
- **Animation**: Framer Motion
- **Routing**: React Router DOM
- **Web3**: Sui Wallet Adapter
- **Storage**: LocalStorage
- **Thiết kế**: Responsive trên nhiều thiết bị

---
# 🛠️ Cài đặt
```bash
git clone https://github.com/Wiken2k3/the-invincible-web3.git
cd the-invincible-web3
npm install # hoặc yarn install, pnpm install
```
---
# ▶️ Chạy dự án

```bash
npm run dev
```
Ứng dụng chạy tại:
👉 http://localhost:5173

# 📁 Cấu trúc thư mục
 ```bash
src/
│
├── config/
│   └── web3.ts          # Sui config & Treasury address
│
├── hooks/
│   ├── useWallet.ts
│   └── useSuiContract.ts
│
├── pages/
│   ├── Home/
│   ├── GameHub/
│   └── Game/
│       ├── Dice/
│       ├── TaiXiu/
│       ├── Mines/
│       ├── Slot/
│       ├── Tower/
│       ├── Wheel/
│       └── HorseRace/
│
├── utils/
│   └── saveTx.ts        # Transaction History helper
│
├── layout/
│   └── MainLayout.tsx
│
├── App.tsx
├── main.tsx
└── theme.ts
```
# 🔧 Logic Game

## 🌱 Seeds
```bash
{
  common:    { price: 10,  growSec: 15,  airdrop: 1 },
  rare:      { price: 35,  growSec: 30,  airdrop: 3 },
  epic:      { price: 120, growSec: 60,  airdrop: 8 },
  legendary: { price: 400, growSec: 180, airdrop: 25 },
}
```
🌾 Harvest Calculation

Công thức Coins:
```bash
Coins = seed price × random(0.6 → 1.4)
```
Công thức Airdrop Points (AP):
```bash
AP = base AP + bonus theo Effect Quality
```
Quality có tỉ lệ: Normal, Bronze, Silver, Gold, Diamond.

# 🎁 Mystery Box Rules
```bash
- Require: ≥ 500 Coins
- Cost: 50 Coins
- Generate: 10 boxes per panel
- Player can open: 1 box only
- Box Reward: 10 → 100 AP
```
# 💾 LocalStorage Key
```bash
farm_game_v6_web3_ui_clean
```
# 📦 Build & Deploy
```bash
Build
npm run build
```
# 📬 Liên hệ

📧 Email: wiken2k3@gmail.com
## Profile: (https://wikenportfolio.vercel.app)

🐦 Facebook: https://www.facebook.com/Wiken2k3
# Web đã được deloy tại Vercel :
[Tại đây](https://the-invincible-web3.vercel.app/)
