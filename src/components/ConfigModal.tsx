import {
  Modal,
  Title,
  Text,
  TextInput,
  Button,
  Alert,
  Stack,
  Code,
  CopyButton,
  Group,
  Badge,
} from "@mantine/core";
import { useState } from "react";
import { showNotification } from "@mantine/notifications";
import { isValidSuiAddress } from "../config/web3";

interface ConfigModalProps {
  opened: boolean;
  onClose: () => void;
  currentAddress: string;
  onSave: (newAddress: string) => void;
}

export default function ConfigModal({
  opened,
  onClose,
  currentAddress,
  onSave,
}: ConfigModalProps) {
  const [address, setAddress] = useState(currentAddress);
  const isValid = isValidSuiAddress(address);

  const handleSave = () => {
    if (!isValid) {
      showNotification({
        title: "❌ Lỗi",
        message: "Địa chỉ ví không hợp lệ",
        color: "red",
      });
      return;
    }

    onSave(address);
    showNotification({
      title: "✅ Thành công",
      message: "Địa chỉ ví đã được cập nhật",
      color: "green",
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="⚙️ Cấu hình Ví Nhận Tiền"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Alert color="blue" title="ℹ️ Thông tin">
          <Text size="sm">
            Đây là ví sẽ nhận tiền cược từ người chơi. Bạn có thể sửa đổi bất cứ
            lúc nào.
          </Text>
        </Alert>

        {/* Current Address Display */}
        <div>
          <Text fw={600} mb="xs" size="sm">
            Địa chỉ hiện tại:
          </Text>
          <Group>
            <Code
              block
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "12px",
                wordBreak: "break-all",
              }}
            >
              {currentAddress === "0x0000000000000000000000000000000000000000000000000000000000000000"
                ? "Chưa cấu hình"
                : currentAddress}
            </Code>
            {currentAddress !==
              "0x0000000000000000000000000000000000000000000000000000000000000000" && (
              <CopyButton value={currentAddress} timeout={2000}>
                {({ copied }) => (
                  <Button
                    size="xs"
                    color={copied ? "teal" : "blue"}
                    variant="light"
                  >
                    {copied ? "✓ Sao chép" : "Sao chép"}
                  </Button>
                )}
              </CopyButton>
            )}
          </Group>
        </div>

        {/* New Address Input */}
        <div>
          <Text fw={600} mb="xs" size="sm">
            Địa chỉ ví mới:
          </Text>
          <TextInput
            placeholder="0x1234567890abcdef..."
            value={address}
            onChange={(e) => setAddress(e.currentTarget.value)}
            rightSection={
              address && (
                <Badge color={isValid ? "green" : "red"} size="sm">
                  {isValid ? "✓ Hợp lệ" : "✗ Không hợp lệ"}
                </Badge>
              )
            }
          />
          <Text size="xs" c="dimmed" mt="xs">
            Phải là 64 ký tự hex với tiền tố 0x
          </Text>
        </div>

        {/* Instructions */}
        <Alert color="yellow" title="📝 Hướng dẫn lấy địa chỉ ví">
          <Stack gap="xs">
            <div>
              <Text fw={600} size="sm">
                Sui Wallet:
              </Text>
              <Text size="sm" c="dimmed">
                1. Mở extension → 2. Click vào account → 3. Copy address
              </Text>
            </div>
            <div>
              <Text fw={600} size="sm">
                Slush Wallet:
              </Text>
              <Text size="sm" c="dimmed">
                1. Mở extension → 2. Tìm nút Copy Address → 3. Dán vào đây
              </Text>
            </div>
          </Stack>
        </Alert>

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            💾 Lưu Cấu Hình
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
