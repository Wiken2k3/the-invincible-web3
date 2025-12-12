# 🚀 Quick Start: Kết nối Slush Wallet và Smart Contract

## ✅ Bước 1: Cài đặt Slush Wallet Extension

1. Truy cập: https://slushwallet.io/
2. Tải và cài đặt extension cho Chrome/Edge
3. Tạo tài khoản mới hoặc import wallet hiện có
4. Đảm bảo extension đã được bật

## ✅ Bước 2: Chạy dự án

```bash
npm run dev
```

## ✅ Bước 3: Kết nối Wallet

1. Click nút **"☀️ Connect Wallet"** ở header
2. Modal sẽ hiển thị danh sách wallets (bao gồm Slush Wallet nếu đã cài)
3. Chọn **Slush Wallet**
4. Xác nhận kết nối trong extension
5. ✅ Đã kết nối! Địa chỉ ví sẽ hiển thị ở header

## ✅ Bước 4: Sử dụng Smart Contract

### Cách 1: Dùng hook `useSuiContract` (Khuyên dùng)

```tsx
import { useSuiContract } from "../hooks/useSuiContract";

function MyComponent() {
  const { callContract, getBalance, account, isPending } = useSuiContract();

  const handleCall = async () => {
    await callContract(
      "0x123::module::function", // Thay bằng địa chỉ contract của bạn
      [/* arguments */],
      {
        onSuccess: (result) => {
          console.log("Success:", result);
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      }
    );
  };

  return (
    <div>
      <p>Address: {account?.address}</p>
      <button onClick={handleCall} disabled={isPending}>
        Call Contract
      </button>
    </div>
  );
}
```

### Cách 2: Dùng trực tiếp từ dApp Kit

```tsx
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

function MyComponent() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleCall = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: "0x123::module::function",
      arguments: [],
    });

    signAndExecute({ transaction: tx });
  };

  return <button onClick={handleCall}>Call Contract</button>;
}
```

## 📝 Ví dụ: Gọi Smart Contract

Xem file `src/examples/ContractExample.tsx` để xem ví dụ đầy đủ.

## 🔧 Tùy chỉnh Network

Trong `src/main.tsx`, thay đổi `defaultNetwork`:

```tsx
<SuiClientProvider networks={networks} defaultNetwork="mainnet">
  {/* hoặc "devnet", "testnet" */}
</SuiClientProvider>
```

## ⚠️ Lưu ý quan trọng

1. **Slush Wallet phải được cài đặt** trong browser để xuất hiện trong danh sách
2. **Network phải khớp**: Đảm bảo Slush Wallet đang kết nối cùng network với dApp
3. **Test trên Devnet trước**: Luôn test trên Devnet trước khi deploy lên Mainnet
4. **Gas fees**: Mỗi transaction cần SUI để trả gas fees

## 🎯 Next Steps

1. Tích hợp smart contract của bạn vào dự án
2. Sử dụng `useSuiContract` hook để gọi functions
3. Xử lý errors và loading states
4. Test kỹ trên Devnet trước khi deploy

## 📚 Tài liệu

- Xem `SLUSH_WALLET_INTEGRATION.md` để biết chi tiết
- [Sui dApp Kit Docs](https://sdk.mystenlabs.com/dapp-kit)
- [Slush Wallet](https://slushwallet.io/)

