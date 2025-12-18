"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Table,
  Badge,
  Group,
  Loader,
  Center,
  Button,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useSuiClient } from "@mysten/dapp-kit";
import { useWallet } from "../../hooks/useWallet";

export default function TransactionHistory() {
  const { address } = useWallet();
  const client = useSuiClient();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const data = await client.queryTransactionBlocks({
        filter: { FromAddress: address },
        options: {
          showEffects: true,
          showBalanceChanges: true,
          showInput: true,
        },
        order: "descending",
        limit: 20,
      });
      setTransactions(data.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [address]);

  const shorten = (str: string) => `${str.slice(0, 6)}...${str.slice(-4)}`;

  const formatTime = (ts: string | number | undefined) => {
    if (!ts) return "-";
    return new Date(Number(ts)).toLocaleString("vi-VN");
  };

  return (
    <Container size="lg" py="xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title order={2} c="yellow" ta="center" mb="lg">
          📜 Lịch sử giao dịch
        </Title>
      </motion.div>

      <Card 
        radius="lg" 
        p="md" 
        style={{
          background: "rgba(26, 27, 30, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Group justify="space-between" mb="md">
          <Text c="dimmed">
            Ví: <Text span c="white" fw={700}>{address ? shorten(address) : "Chưa kết nối"}</Text>
          </Text>
          <Button 
            variant="light" 
            color="yellow" 
            size="xs" 
            onClick={fetchHistory} 
            loading={loading}
            disabled={!address}
          >
            Làm mới
          </Button>
        </Group>

        {!address ? (
          <Center p="xl">
            <Text c="dimmed">Vui lòng kết nối ví để xem lịch sử.</Text>
          </Center>
        ) : (
          <ScrollArea h={500}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Digest</Table.Th>
                  <Table.Th>Thời gian</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                  <Table.Th>Gas Fee (SUI)</Table.Th>
                  <Table.Th>Explorer</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading && transactions.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Center p="md"><Loader color="yellow" size="sm" /></Center>
                    </Table.Td>
                  </Table.Tr>
                ) : transactions.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text ta="center" c="dimmed">Chưa có giao dịch nào.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  transactions.map((tx) => {
                    const success = tx.effects?.status?.status === "success";
                    const gasUsed = tx.effects?.gasUsed;
                    const totalGas = gasUsed 
                      ? (Number(gasUsed.computationCost) + Number(gasUsed.storageCost) - Number(gasUsed.storageRebate)) / 1e9 
                      : 0;

                    return (
                      <Table.Tr key={tx.digest}>
                        <Table.Td>
                          <Text size="sm" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(tx.digest)}>
                            {shorten(tx.digest)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{formatTime(tx.timestampMs)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={success ? "green" : "red"} variant="light">
                            {success ? "Thành công" : "Thất bại"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="orange">-{totalGas.toFixed(5)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Anchor 
                            href={`https://suiscan.xyz/testnet/tx/${tx.digest}`} 
                            target="_blank" 
                            size="sm"
                            c="cyan"
                          >
                            Xem ↗️
                          </Anchor>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>
    </Container>
  );
}
