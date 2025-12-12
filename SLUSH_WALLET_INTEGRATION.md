# 🔥 Hướng dẫn tích hợp Slush Wallet với Sui Smart Contract

## 📋 Yêu cầu

1. **Cài đặt Slush Wallet Extension**:
   - Truy cập: https://slushwallet.io/
   - Cài đặt extension cho Chrome/Edge
   - Tạo tài khoản hoặc import wallet

2. **Đảm bảo dự án đã cài đặt**:
   ```bash
   npm install @mysten/dapp-kit @mysten/sui @tanstack/react-query
   ```

## 🚀 Cách hoạt động

### 1. Slush Wallet tự động được phát hiện
- `@mysten/dapp-kit` tự động phát hiện Slush Wallet extension khi đã cài đặt
- Không cần cấu hình thêm

### 2. Khi người dùng click "Connect Wallet":
- Modal hiển thị danh sách wallets có sẵn (bao gồm Slush Wallet)
- Người dùng chọn Slush Wallet
- Slush Wallet extension sẽ mở để xác nhận kết nối
- Sau khi kết nối, địa chỉ ví sẽ được lưu và hiển thị

## 💻 Code hiện tại

### main.tsx
- Đã cấu hình `WalletProvider` với `autoConnect`
- Network: Devnet (có thể đổi sang Mainnet)

### useWallet.ts
- Hook quản lý trạng thái wallet
- Lưu address vào localStorage
- Tự động sync với wallet state

### MainLayout.tsx
- Sử dụng `ConnectModal` từ dApp Kit
- Tự động hiển thị Slush Wallet nếu đã cài đặt

## 🔧 Tùy chỉnh (Optional)

### Ưu tiên Slush Wallet trong danh sách:
```tsx
<ConnectModal
  walletFilter={(wallet) => {
    // Ưu tiên Slush Wallet
    if (wallet.name === 'Slush Wallet') return true;
    return true; // Hoặc filter wallets khác
  }}
  trigger={<Button>Connect Wallet</Button>}
/>
```

### Chỉ hiển thị Slush Wallet:
```tsx
<ConnectModal
  walletFilter={(wallet) => wallet.name === 'Slush Wallet'}
  trigger={<Button>Connect Wallet</Button>}
/>
```

## 📝 Kết nối Smart Contract

### 1. Đọc dữ liệu từ Smart Contract:
```tsx
import { useSuiClientQuery } from '@mysten/dapp-kit';

function MyComponent() {
  const { data } = useSuiClientQuery('getObject', {
    id: '0x...', // Object ID của bạn
  });
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 2. Gọi function từ Smart Contract:
```tsx
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

function MyComponent() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const handleCallContract = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: '0x...::module::function',
      arguments: [/* args */],
    });
    
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log('Transaction success:', result);
        },
        onError: (error) => {
          console.error('Transaction error:', error);
        },
      }
    );
  };
  
  return <button onClick={handleCallContract}>Call Contract</button>;
}
```

### 3. Kiểm tra balance:
```tsx
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';

function Balance() {
  const account = useCurrentAccount();
  const { data } = useSuiClientQuery('getBalance', {
    owner: account?.address || '',
  });
  
  return <div>Balance: {data?.totalBalance}</div>;
}
```

## 🎯 Ví dụ đầy đủ: Kết nối và gọi Smart Contract

Xem file `src/examples/ContractExample.tsx` (sẽ tạo)

## ⚠️ Lưu ý

1. **Network**: Hiện tại đang dùng Devnet, đổi sang Mainnet khi deploy:
   ```tsx
   const networks = {
     mainnet: { url: "https://fullnode.mainnet.sui.io:443" },
   };
   ```

2. **Auto Connect**: `autoConnect={true}` sẽ tự động kết nối lại wallet đã kết nối trước đó

3. **Error Handling**: Luôn xử lý lỗi khi gọi smart contract

4. **Testing**: Test trên Devnet trước khi deploy lên Mainnet

## 📚 Tài liệu tham khảo

- [Sui dApp Kit Docs](https://sdk.mystenlabs.com/dapp-kit)
- [Slush Wallet](https://slushwallet.io/)
- [Sui Smart Contracts](https://docs.sui.io/build/move)

