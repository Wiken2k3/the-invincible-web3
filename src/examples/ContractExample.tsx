/**
 * 🔥 Ví dụ: Kết nối Slush Wallet và gọi Smart Contract
 * 
 * Component này minh họa cách:
 * 1. Kết nối Slush Wallet
 * 2. Đọc dữ liệu từ Smart Contract
 * 3. Gọi function từ Smart Contract
 * 4. Kiểm tra balance
 */

import { useState } from "react";
import { 
  useCurrentAccount, 
  useSuiClientQuery,
  useSignAndExecuteTransaction 
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Card, Text, Stack, Group, Badge } from "@mantine/core";

export default function ContractExample() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [txResult, setTxResult] = useState<string | null>(null);

  // 🔍 Đọc balance của account
  const { data: balance } = useSuiClientQuery(
    "getBalance",
    {
      owner: account?.address || "",
    },
    {
      enabled: !!account?.address,
    }
  );

  // 📝 Ví dụ: Gọi function từ Smart Contract
  const handleCallContract = () => {
    if (!account) {
      alert("Vui lòng kết nối wallet trước!");
      return;
    }

    // Tạo transaction
    const tx = new Transaction();
    
    // Ví dụ: Gọi moveCall function
    // Thay đổi target và arguments theo smart contract của bạn
    tx.moveCall({
      target: "0x...::module_name::function_name", // Thay bằng địa chỉ contract của bạn
      arguments: [
        // Thêm arguments ở đây
      ],
    });

    // Ký và execute transaction
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          console.log("✅ Transaction thành công:", result);
          setTxResult(`Success: ${result.digest}`);
        },
        onError: (error) => {
          console.error("❌ Transaction lỗi:", error);
          setTxResult(`Error: ${error.message}`);
        },
      }
    );
  };

  // 📖 Ví dụ: Đọc object từ blockchain
  const handleReadObject = () => {
    // Sử dụng useSuiClientQuery để đọc object
    // Xem ví dụ bên dưới
  };

  if (!account) {
    return (
      <Card p="md" radius="md" withBorder>
        <Text ta="center" c="dimmed">
          🔑 Vui lòng kết nối wallet để sử dụng tính năng này
        </Text>
      </Card>
    );
  }

  return (
    <Card p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Text size="xl" fw={700}>
          🔥 Smart Contract Integration
        </Text>

        {/* Account Info */}
        <Group justify="space-between">
          <Text fw={600}>Địa chỉ ví:</Text>
          <Badge color="green" size="lg">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </Badge>
        </Group>

        {/* Balance */}
        <Group justify="space-between">
          <Text fw={600}>Balance:</Text>
          <Text fw={700} c="blue">
            {balance ? `${Number(balance.totalBalance) / 1e9} SUI` : "Loading..."}
          </Text>
        </Group>

        {/* Transaction Result */}
        {txResult && (
          <Card p="sm" bg={txResult.includes("Error") ? "red.1" : "green.1"}>
            <Text size="sm" c={txResult.includes("Error") ? "red" : "green"}>
              {txResult}
            </Text>
          </Card>
        )}

        {/* Actions */}
        <Group>
          <Button
            onClick={handleCallContract}
            loading={isPending}
            disabled={isPending}
          >
            🚀 Gọi Smart Contract
          </Button>
        </Group>

        <Text size="xs" c="dimmed" mt="md">
          💡 Thay đổi target và arguments trong code để phù hợp với smart contract của bạn
        </Text>
      </Stack>
    </Card>
  );
}

