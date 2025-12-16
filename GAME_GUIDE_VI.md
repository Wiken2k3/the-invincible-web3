# 🎮 The Invincible Web3 - Hướng Dẫn Sử Dụng

## 🚀 Bước 1: Cấu Hình Ví Nhận Tiền

### Cách 1: Sử dụng giao diện (Nên dùng)

1. **Kết nối ví** - Click nút `☀️ Connect Wallet` ở góc trên bên phải
2. **Click nút settings** - Icon ⚙️ cạnh địa chỉ ví
3. **Paste địa chỉ ví** của bạn từ Sui Wallet hoặc Slush Wallet
4. **Click "💾 Lưu Cấu Hình"** - Xong!

### Cách 2: Chỉnh sửa trực tiếp file (Nếu không thể dùng cách 1)

1. Mở file: `src/config/web3.ts`
2. Tìm dòng:
   ```typescript
   export const TREASURY_ADDRESS =
     "0x0000000000000000000000000000000000000000000000000000000000000000";
   ```
3. Thay thế bằng địa chỉ ví của bạn:
   ```typescript
   export const TREASURY_ADDRESS =
     "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
   ```
4. Lưu file và reload trình duyệt

---

## 📱 Lấy Địa Chỉ Ví

### Từ Sui Wallet
1. Mở extension Sui Wallet
2. Click vào account name
3. Click "Copy Address"
4. Paste vào cấu hình

### Từ Slush Wallet
1. Mở extension Slush Wallet
2. Tìm option "Copy Address"
3. Paste vào cấu hình

---

## 🎯 Cách Chơi Game

### Bước 1: Kết Nối Ví
- Click `☀️ Connect Wallet`
- Chọn ví của bạn
- Xác nhận kết nối

### Bước 2: Chọn Game
- Vào menu "Game"
- Chọn game muốn chơi (Tài Xỉu, Ngựa, Slots, v.v.)

### Bước 3: Đặt Cược
- Nhập số tiền SUI muốn cược
- Chọn tùy chọn (Tài/Xỉu, Heads/Tails, v.v.)

### Bước 4: Chơi
- Click nút Play/Roll/Spin
- Ví sẽ yêu cầu xác nhận giao dịch
- Ký xác nhận
- Chờ kết quả game

### Bước 5: Nhận Thưởng
- Nếu thắng: SUI được hoàn lại + tiền thắng
- Nếu thua: SUI bị mất
- Xem kết quả tích lũy ở trang "Nhận Thưởng"

---

## 💰 Cơ Chế Tiền

### Cấu Trúc Giao Dịch

```
Player đặt cược X SUI
        ↓
Ví xác nhận → SUI được gửi đến Treasury
        ↓
Game diễn ra
        ↓
Nếu thắng: Treasury hoàn lại 2X SUI
Nếu thua: Treasury giữ X SUI
```

### Phí Game
- **Game Fee**: 5% (được lấy từ tiền thắng)
- **Ví dụ**: Cược 1 SUI, thắng 2 SUI → Nhận 1.9 SUI (sau khi trừ phí)

### Airdrop Points
- Mỗi lần chơi game: +1 Airdrop Point
- Mỗi lần chiến thắng: +2 Airdrop Point
- Xem tích lũy ở trang "Nhận Thưởng"

---

## ⚠️ Xử Lý Lỗi

### Lỗi: "Invalid Sui address"
**Nguyên nhân**: Địa chỉ ví không hợp lệ
**Giải pháp**:
- Kiểm tra địa chỉ ví có 64 ký tự hex
- Bắt đầu bằng "0x"
- Copy lại từ ví của bạn

### Lỗi: "Insufficient balance"
**Nguyên nhân**: Ví không đủ SUI để cược
**Giải pháp**:
- Nạp thêm SUI vào ví
- Hoặc giảm số tiền cược

### Lỗi: "Wallet not connected"
**Nguyên nhân**: Chưa kết nối ví hoặc kết nối bị ngắt
**Giải pháp**:
- Click "Connect Wallet"
- Kiểm tra extension ví còn hạn sử dụng không
- Reload trang

### Lỗi: "Transaction failed"
**Nguyên nhân**: Giao dịch bị từ chối
**Giải pháp**:
- Kiểm tra gas fee đủ không
- Thử lại sau vài giây
- Kiểm tra kết nối mạng

---

## 🔐 Bảo Mật

### Những việc BẠN NÊN LÀM
- ✅ Giữ secret phrase/seed phrase an toàn
- ✅ Chỉ kết nối với những website đáng tin cậy
- ✅ Kiểm tra địa chỉ ví trước khi gửi
- ✅ Sử dụng testnet để thử trước

### Những việc BẠN KHÔNG NÊN LÀM
- ❌ Không chia sẻ seed phrase với ai
- ❌ Không lưu seed phrase dưới dạng text thường
- ❌ Không kết nối ví với những link lạ
- ❌ Không cho phép quyền truy cập không cần thiết

---

## 🌐 Chọn Network

App hỗ trợ 3 network:

### Testnet (Nên dùng để thử)
- **Lợi ích**: SUI miễn phí, không mất tiền thật
- **Nhược điểm**: Không có giá trị thực
- **Dùng khi**: Testing, học tập

### Devnet
- **Lợi ích**: Môi trường phát triển sạch
- **Nhược điểm**: Dữ liệu hay reset
- **Dùng khi**: Developer muốn test

### Mainnet
- **Lợi ích**: Network chính thức, tiền thật
- **Nhược điểm**: Mất tiền thật khi thua
- **Dùng khi**: Chơi game thực sự

---

## 📚 Các Game Có Sẵn

### 🐎 Horse Race - Đua Ngựa
- **Cách chơi**: Chọn ngựa, đặt cược, xem cuộc đua
- **Tỷ lệ**: 2x nếu thắng

### 🎲 Tài Xỉu
- **Cách chơi**: Chọn Tài (11-18) hoặc Xỉu (3-10)
- **Tỷ lệ**: 2x nếu đúng

### 🎰 Slot Machine
- **Cách chơi**: Quay slot, khớp biểu tượng
- **Tỷ lệ**: Tùy theo số biểu tượng khớp

### 💣 Mine
- **Cách chơi**: Chọn ô an toàn, tránh mìn
- **Tỷ lệ**: Tăng theo số ô chọn

### 🔔 Wheel Spin
- **Cách chơi**: Quay bánh xe, chọn phần thưởng
- **Tỷ lệ**: Tùy theo mục được chọn

---

## 🛠️ Phát Triển

### Cài Đặt
```bash
npm install
```

### Chạy Development
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra**: Đã cấu hình TREASURY_ADDRESS chưa?
2. **Kết nối**: Ví đã kết nối đúng không?
3. **Balance**: Ví có đủ SUI không?
4. **Network**: Đã chọn đúng network không?

---

**Chúc bạn chơi game vui vẻ! 🎉**
