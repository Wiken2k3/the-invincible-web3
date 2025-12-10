# 🪐 The Invincible – Web3 Mini Farming Game

Web3 Mini Farming Game mô phỏng mô hình **Play → Earn → Claim**, kết hợp cơ chế trồng cây – thu hoạch – mở Mystery Box – nhận Airdrop Points.  
Giao diện sử dụng **Glassmorphism + Parallax Space + Futuristic UI**, hiệu ứng mượt với **Framer Motion**.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-blue" />
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
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#️-cài-đặt)
- [Chạy dự án](#️-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Logic Game](#-logic-game)
- [Build & Deploy](#-build--deploy)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

---

# 🚀 Giới thiệu

**The Invincible** là trò chơi Farming dạng Web3 (Off-chain simulation) nơi người chơi:

- Trồng hạt → cây lớn theo thời gian  
- Thu hoạch để nhận **Coins + Airdrop Points**  
- Mua hạt giống trong shop  
- Mở **1 trong 10 Mystery Box** để nhận AP ngẫu nhiên  
- Theo dõi tiến trình farming tương lai với UI phong cách vũ trụ

Game chạy hoàn toàn client-side bằng React, dữ liệu được lưu qua **LocalStorage**.

---

# ⭐ Tính năng chính

### 🌱 Farming  
- 9 ô đất  
- 4 loại hạt: Common – Rare – Epic – Legendary  
- Mỗi hạt có grow time & AP riêng  
- Tiến trình hiển thị bằng progress bar thời gian thực  
- Harvest từng cây hoặc **Harvest All**

### ✨ Effect Quality System  
Khi thu hoạch có tỉ lệ xuất hiện:

| Quality | Weight | Bonus AP |
|--------|--------|----------|
| Normal | 40% | +0 |
| Bronze | 30% | +5 |
| Silver | 20% | +10 |
| Gold | 8% | +30 |
| Diamond | 2% | +50 |

### 🎁 Mystery Box  
- Yêu cầu **≥ 500 Coins** để mở lootboard  
- Mỗi lượt tốn **50 Coins**  
- Sinh 10 box với giá trị **10–100 AP**  
- Người chơi chỉ mở **1 box duy nhất**  
- Những box còn lại bị khóa

### 🎨 UI/UX nổi bật  
- Glassmorphism  
- Gradient Cosmic  
- Parallax Planet  
- Particle Space Background  
- Popup animated bằng Framer Motion  

---
# 🧩 Công nghệ sử dụng
- **React 18 + Vite**
- **Mantine UI**
- **Framer Motion**
- **React Router DOM**
- **LocalStorage**
- **TypeScript + JSX**
- Responsive UI

---
# 🛠️ Cài đặt
```bash
git clone https://github.com/Wiken2k3/the-invincible-web3.git
cd the-invincible-web3
npm install
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
├── assets/
│   ├── seeds/
│   │   ├── farmhome.png
│   │   ├── game.png
│   │   ├── logo.png
│   │   ├── mysterybox.png
│   │   └── Plannet.png
│   └── react.svg
│
├── components/
│   ├── AnimatedField.jsx
│   ├── FarmTile.tsx
│   └── PlotCell.tsx
│
├── layout/
│   └── MainLayout.tsx
│
├── pages/
│   ├── Home.tsx
│   ├── Game.tsx
│   └── Reward.tsx
│
├── App.tsx
├── App.css
├── index.css
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
