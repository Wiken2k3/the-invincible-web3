import {
    Modal,
    Box,
    Title,
    Text,
    Group,
    Stack,
    Image,
    Button,
    Divider,
    Grid,
    NumberInput,
    Card,
    Alert,
    Badge,
} from "@mantine/core";
import { IconChevronRight, IconPlayerPlay, IconCoin, IconTrophy, IconAlertTriangle, IconCheck, IconUserCircle } from '@tabler/icons-react';
import { motion } from "framer-motion";
import { useState } from "react"; 

// 🔥 Import các tài nguyên hình ảnh bạn đã cung cấp (Đã sửa lỗi Import)
import foosballTable from "../../assets/game/foosball-table.png";
import ballIcon from "../../assets/game/ball.png";
import scoreIcon from "../../assets/game/điểm.png"; 
import player1Icon from "../../assets/game/player1.png"; 
import player2Icon from "../../assets/game/player2.png"; 

// ============ CONFIG GAME ============
const FEE_RATE = 0.05; // 5% phí
const MIN_BET = 1;

type GameMessage = {
    text: string;
    color: 'red' | 'green' | 'yellow';
    icon: React.ReactNode;
} | null;

type BiLacModalProps = {
    opened: boolean;
    close: () => void;
};

// =========================================================================
// 🎱 BILAC GAME MODAL (MAIN COMPONENT)
// =========================================================================
export function BiLacModal({ opened, close }: BiLacModalProps) {
    const playerAddress = "0xaa...bbcc"; 
    
    // 🔥 STATE QUẢN LÝ GAME
    const [score, setScore] = useState({ player: 0, opponent: 0 });
    const [gameSUI, setGameSUI] = useState(15.00); 
    const [betAmount, setBetAmount] = useState<number | ''>(MIN_BET);
    const [isGameActive, setIsGameActive] = useState(false);
    const [gameMessage, setGameMessage] = useState<GameMessage>(null);
    const [history, setHistory] = useState<any[]>([
         { status: 'Win', amount: '+1.90 SUI', color: 'green' }
    ]);

    const handleStartGame = () => {
        const bet = betAmount as number;

        if (bet < MIN_BET) return;

        // 0. Kiểm tra SUI
        if (gameSUI < bet) {
            setGameMessage({ text: 'LỖI: Bạn không đủ SUI trong Ví Game để bắt đầu.', color: 'red', icon: <IconAlertTriangle size={20} /> });
            return;
        }

        // 1. Khởi động game
        setGameSUI(prev => prev - bet); // Trừ tiền cược
        setScore({ player: 0, opponent: 0 });
        setIsGameActive(true);
        setGameMessage({ text: `Đã cược ${bet.toFixed(2)} SUI. Trận đấu BẮT ĐẦU!`, color: 'yellow', icon: <IconPlayerPlay size={20} /> });

        // 2. Giả lập kết quả sau một khoảng thời gian
        setTimeout(() => {
            const finalScore = Math.random() > 0.5 ? { player: 5, opponent: 3 } : { player: 3, opponent: 5 };
            setScore(finalScore);
            setIsGameActive(false);

            const isWinner = finalScore.player > finalScore.opponent;
            const netPayout = (bet * 2) * (1 - FEE_RATE);
            const profit = netPayout - bet;
            
            let finalMessage: GameMessage;
            let logStatus = '';
            
            if (isWinner) {
                setGameSUI(prev => prev + netPayout);
                logStatus = 'Win';
                finalMessage = { text: `THẮNG! Nhận lại tổng cộng ${netPayout.toFixed(2)} SUI (+${profit.toFixed(2)} ròng)!`, color: 'green', icon: <IconCheck size={20} /> };
            } else {
                logStatus = 'Lose';
                finalMessage = { text: `THUA! Mất ${bet.toFixed(2)} SUI cược.`, color: 'red', icon: <IconAlertTriangle size={20} /> };
            }

            setGameMessage(finalMessage);
            setHistory(prev => [{ status: logStatus, amount: isWinner ? `+${profit.toFixed(2)} SUI` : `-${bet.toFixed(2)} SUI`, color: isWinner ? 'green' : 'red' }, ...prev.slice(0, 4)]);

        }, 8000); // Giả lập trận đấu kéo dài 8 giây
    };

    return (
        <Modal
            opened={opened}
            onClose={close}
            title={
                <Group align="center" gap="sm">
                    <IconTrophy size={28} style={{ color: '#22c55e' }} />
                    <Title order={3} style={{ color: "#fff", textShadow: "0 0 5px #22c55e" }}>
                        BI LẮC (FOOSBALL) - WEB3 MINI GAME
                    </Title>
                </Group>
            }
            size="90%"
            radius="lg"
            styles={{
                header: { background: "rgba(15, 23, 42, 0.9)", borderBottom: "1px solid rgba(34, 197, 94, 0.3)", padding: '16px 24px' },
                content: { backgroundColor: "#0f172a", border: "2px solid rgba(34, 197, 94, 0.2)", boxShadow: "0 8px 30px rgba(34, 197, 94, 0.15)", },
                body: { padding: '0 16px 16px 16px' }
            }}
            centered
        >
            <Box p="md" style={{ minHeight: '600px' }}>
                <Grid gutter="xl">
                    {/* ===================== COL 1: GAME AREA ===================== */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="xl">
                            <Scoreboard score={score} playerAddress={playerAddress} gameMessage={gameMessage} />
                            <FoosballTable foosballTable={foosballTable} ballIcon={ballIcon} isGameActive={isGameActive} />
                        </Stack>
                    </Grid.Col>

                    {/* ===================== COL 2: CONTROL & BETTING ===================== */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="lg">
                            <PlayerInfo gameSUI={gameSUI} playerAddress={playerAddress} />
                            <BettingControls 
                                onStart={handleStartGame} 
                                isGameActive={isGameActive} 
                                betAmount={betAmount} 
                                setBetAmount={setBetAmount}
                                FEE_RATE={FEE_RATE}
                            />
                            <HistoryLog history={history} />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Box>
        </Modal>
    );
}

// =========================================================================
// 🏆 SCOREBOARD COMPONENT (Đã sửa lỗi tham chiếu scoreIcon, player2Icon)
// =========================================================================
type ScoreboardProps = {
    score: { player: number, opponent: number };
    playerAddress: string;
    gameMessage: GameMessage;
};

function Scoreboard({ score, playerAddress, gameMessage }: ScoreboardProps) {
    return (
        <Card shadow="lg" padding="lg" radius="md" style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
             {gameMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <Alert 
                        variant="light" 
                        color={gameMessage.color} 
                        title={<Text fw={700}>{gameMessage.text}</Text>} 
                        icon={gameMessage.icon} 
                        mb="md"
                    />
                </motion.div>
            )}
            <Group justify="space-between" align="center">
                
                {/* Player 1 (You) */}
                <Stack gap={4} align="center">
                    <Image src={player1Icon} w={40} h={40} />
                    <Text fw={700} c="#22c55e">YOU</Text>
                    <Text size="sm" c="dimmed">{playerAddress.slice(0, 8)}...</Text>
                </Stack>
                
                {/* Score */}
                <Group gap="xs" align="center">
                    <Text size="xl" fw={900} style={{ color: '#22c55e', fontSize: '3rem', textShadow: "0 0 10px #22c55e" }}>
                        {score.player}
                    </Text>
                    <Image src={scoreIcon} w={36} h={36} />
                    <Text size="xl" fw={900} c="white" style={{ fontSize: '3rem', textShadow: "0 0 10px #fff" }}>
                        {score.opponent}
                    </Text>
                </Group>
                
                {/* Opponent (Computer/Other Player) */}
                <Stack gap={4} align="center">
                    <Image src={player2Icon || player1Icon} w={40} h={40} style={{ filter: 'hue-rotate(180deg)' }} /> 
                    <Text fw={700} c="white">OPPONENT</Text>
                    <Text size="sm" c="dimmed">0xde...fghi</Text>
                </Stack>
            </Group>
        </Card>
    );
}

// =========================================================================
// ⚽ FOOSBALL TABLE (GAME VISUAL)
// =========================================================================
type FoosballTableProps = {
    foosballTable: string;
    ballIcon: string;
    isGameActive: boolean;
};

function FoosballTable({ foosballTable, ballIcon, isGameActive }: FoosballTableProps) {
    return (
        <Box 
            style={{ 
                position: 'relative', 
                backgroundColor: '#1e293b', 
                borderRadius: '12px',
                overflow: 'hidden',
                padding: '20px',
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
            }}
        >
            <Box 
                style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%)',
                    zIndex: 1
                }}
            />
            <Image 
                src={foosballTable} 
                alt="Foosball Table" 
                style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))' 
                }} 
            />
            
            {/* Icon bóng ở giữa bàn (Animation khi game active) */}
            <motion.div
                animate={isGameActive ? { 
                    x: [0, 50, -50, 0], 
                    y: [0, -30, 30, 0],
                    rotate: [0, 360],
                } : {}}
                transition={isGameActive ? { 
                    duration: 0.5, 
                    repeat: Infinity, 
                    repeatType: 'reverse', 
                    ease: 'linear'
                } : {}}
                style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    display: isGameActive ? 'block' : 'none', // Ẩn bóng khi game chưa active
                }}
            >
                <Image src={ballIcon} w={30} h={30} style={{ filter: 'drop-shadow(0 0 5px #fff)' }} />
            </motion.div>
        </Box>
    );
}

// =========================================================================
// 🎰 BETTING CONTROLS COMPONENT
// =========================================================================
type BettingControlsProps = {
    onStart: () => void;
    isGameActive: boolean;
    betAmount: number | '';
    setBetAmount: (value: number | '') => void;
    FEE_RATE: number;
};

function BettingControls({ onStart, isGameActive, betAmount, setBetAmount, FEE_RATE }: BettingControlsProps) {
    const currentBet = betAmount as number || 0;
    const netPayout = currentBet > 0 ? (currentBet * 2) * (1 - FEE_RATE) : 0; 
    const profit = netPayout - currentBet;

    return (
        <Stack gap="md">
            <Title order={4} c="white" style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "8px" }}>
                🎯 ĐẶT CƯỢC & THAO TÁC
            </Title>
            
            <NumberInput
                label="Lượng SUI cược (1 trận)"
                placeholder="Nhập số SUI"
                value={betAmount} 
                onChange={setBetAmount}
                min={MIN_BET}
                step={1}
                disabled={isGameActive}
                leftSection={<IconCoin size={20} color="#f59e0b" />}
                styles={{ input: { backgroundColor: '#1e293b', borderColor: '#f59e0b40', color: 'white' }, label: { color: 'white' } }}
            />
            
            <Stack gap={4} p="xs" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                <Group justify="space-between">
                    <Text c="dimmed">Chi phí cược:</Text>
                    <Text fw={700} c="#f59e0b">{currentBet.toFixed(2)} SUI</Text> 
                </Group>
                <Group justify="space-between">
                    <Text c="dimmed">Phí nền tảng ({FEE_RATE * 100}%):</Text>
                    <Text fw={700} c="red">{(currentBet * FEE_RATE).toFixed(2)} SUI</Text> 
                </Group>
                <Divider my={2} opacity={0.1} />
                <Group justify="space-between">
                    <Text c="white" fw={700}>Lợi nhuận ròng (nếu thắng):</Text>
                    <Text fw={900} c="#22c55e" style={{ fontSize: '1.2rem' }}>{profit.toFixed(2)} SUI</Text>
                </Group>
            </Stack>

            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button
                    size="lg"
                    leftSection={<IconPlayerPlay size={24} />}
                    onClick={onStart} 
                    disabled={isGameActive || currentBet < MIN_BET}
                    loading={isGameActive}
                    style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        boxShadow: "0 4px 16px rgba(34, 197, 94, 0.4)",
                        marginTop: '20px'
                    }}
                >
                    {isGameActive ? 'ĐANG CHƠI...' : `START GAME (Cược ${currentBet.toFixed(2)} SUI)`}
                </Button>
            </motion.div>
        </Stack>
    );
}

// =========================================================================
// 👤 PLAYER INFO (SUI Balance)
// =========================================================================
type PlayerInfoProps = { playerAddress: string; gameSUI: number; };

function PlayerInfo({ playerAddress, gameSUI }: PlayerInfoProps) {
    const currentSUI = 100.5;

    return (
        <Card shadow="lg" padding="lg" radius="md" style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <Stack gap="xs">
                <Group justify="space-between">
                    <Text fw={700} c="white"><IconUserCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />Ví Game:</Text>
                    <Badge color="orange" variant="light">{playerAddress.slice(0, 6)}...</Badge>
                </Group>
                <Divider opacity={0.1} />
                <Group justify="space-between">
                    <Text c="dimmed">SUI hiện tại:</Text>
                    <Text fw={700} c="#f59e0b" style={{ fontSize: '1.2rem' }}>{gameSUI.toFixed(2)} SUI</Text>
                </Group>
                <Group justify="space-between">
                    <Text c="dimmed">SUI có thể nạp:</Text>
                    <Text fw={700} c="white">{currentSUI.toFixed(2)} SUI</Text>
                </Group>
            </Stack>
        </Card>
    );
}

// =========================================================================
// 📜 HISTORY LOG COMPONENT
// =========================================================================
type HistoryLogProps = { history: any[] };

function HistoryLog({ history }: HistoryLogProps) {
    return (
        <Stack gap="xs">
            <Title order={4} c="white" style={{ borderLeft: "4px solid #00E5FF", paddingLeft: "8px" }}>
                📜 LỊCH SỬ CHƠI GẦN ĐÂY
            </Title>
            {history.map((item, index) => (
                <Group key={index} justify="space-between" p="xs" style={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                    borderRadius: '6px' 
                }}>
                    <Group gap="xs">
                        <IconChevronRight size={16} color={item.color} />
                        <Text c="white" fw={500}>{item.status}</Text>
                    </Group>
                    <Text c={item.color} fw={700}>{item.amount}</Text>
                </Group>
            ))}
        </Stack>
    );
}