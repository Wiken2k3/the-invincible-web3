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
    Card,
    Badge,
    Alert, 
} from "@mantine/core";
// Import Icons
import { IconMap, IconDice5, IconCoin, IconUserCircle, IconAlertTriangle, IconCheck, IconArrowUp, IconArrowDown, IconCircleDot, IconPlayerPlay } from '@tabler/icons-react'; 
import { motion } from 'framer-motion';
import { useState } from 'react'; 

// 🔥 CÁC HÌNH ẢNH BẠN ĐÃ CUNG CẤP (Đã đổi tên file ảnh trung tâm theo tên bạn gửi)
import centerImage from "../../assets/game/monopoly.png"; 

// =========================
// 🌐 CONFIG TỌA ĐỘ BÀN CỜ & GAME LOGIC (FIX CÚ PHÁP VÀ LOGIC MÀU)
const MIN_BET = 1.00; // Chi phí cố định cho 1 lượt chơi (1 SUI)
const BOARD_SIZE = 12; // 12x12
const NUM_POSITIONS = 40; // Tổng số ô chơi
const WIN_PROB = 0.3333;

// Giá trị SUI nhận về
const LAND_REWARDS = { 
    WIN: 2.50,   // Lãi 1.50 SUI (2.5 - 1.0)
    DRAW: 1.00,  // Hòa 0.00 SUI (1.0 - 1.0)
    LOSE: 0.25   // Lỗ 0.75 SUI (0.25 - 1.0)
};

// Phân bố ô cờ (40 ô) - ĐÃ FIX CÚ PHÁP 'name' và logic màu Land
const BOARD_POSITIONS = Array.from({ length: 40 }, (_, i) => {
    let name = '';
    let color = 'blue.7';
    let type = 'Land';
    let isCorner = false;

    // Thiết lập Góc và Tên Đường TP.HCM
    if (i === 0) { name = "BẮT ĐẦU (START)"; type = 'Start'; color = 'lime.9'; isCorner = true; }
    else if (i === 1) { name = "Đồng Khởi"; type = 'Land'; color = 'red.7'; } 
    else if (i === 2) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; }
    else if (i === 3) { name = "Nguyễn Huệ"; type = 'Land'; color = 'yellow.7'; } 
    else if (i === 4) { name = "Lê Lợi (HOT)"; type = 'Land'; color = 'green.7'; } 
    else if (i === 5) { name = "PHẠT PHÍ"; type = 'Tax'; color = 'red.9'; } 
    else if (i === 6) { name = "Tôn Đức Thắng"; type = 'Land'; color = 'red.7'; }
    else if (i === 7) { name = "Phạm Ngũ Lão"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 8) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; } 
    else if (i === 9) { name = "Hồ Tùng Mậu"; type = 'Land'; color = 'green.7'; } 
    else if (i === 10) { name = "JAIL"; type = 'Jail'; color = 'gray.7'; isCorner = true; } 
    
    // Cạnh Trái (11-20)
    else if (i === 11) { name = "Hai Bà Trưng"; type = 'Land'; color = 'green.7'; } 
    else if (i === 12) { name = "Võ Văn Tần"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 13) { name = "Trần Hưng Đạo"; type = 'Land'; color = 'red.7'; }
    else if (i === 14) { name = "PHẠT PHÍ"; type = 'Tax'; color = 'red.9'; } 
    else if (i === 15) { name = "Đinh Tiên Hoàng"; type = 'Land'; color = 'green.7'; }
    else if (i === 16) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; }
    else if (i === 17) { name = "Lý Tự Trọng"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 18) { name = "Nguyễn Đình Chiểu"; type = 'Land'; color = 'red.7'; }
    else if (i === 19) { name = "Lê Thánh Tôn"; type = 'Land'; color = 'green.7'; }
    else if (i === 20) { name = "FREE PARKING"; type = 'FreeParking'; color = 'blue.9'; isCorner = true; } 

    // Cạnh Trên (21-30)
    else if (i === 21) { name = "Nguyễn Trãi"; type = 'Land'; color = 'red.7'; }
    else if (i === 22) { name = "Pasteur"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 23) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; } 
    else if (i === 24) { name = "Nam Kỳ Khởi Nghĩa"; type = 'Land'; color = 'green.7'; } 
    else if (i === 25) { name = "PHẠT PHÍ"; type = 'Tax'; color = 'red.9'; }
    else if (i === 26) { name = "Trương Định"; type = 'Land'; color = 'red.7'; }
    else if (i === 27) { name = "CM Tháng Tám"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 28) { name = "Phan Kế Bính"; type = 'Land'; color = 'green.7'; }
    else if (i === 29) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; }
    else if (i === 30) { name = "GO TO JAIL"; type = 'GoToJail'; color = 'red.9'; isCorner = true; }   

    // Cạnh Phải (31-39)
    else if (i === 31) { name = "Đinh Công Tráng"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 32) { name = "Lê Văn Tám"; type = 'Land'; color = 'green.7'; }
    else if (i === 33) { name = "Nguyễn Cư Trinh"; type = 'Land'; color = 'red.7'; }
    else if (i === 34) { name = "PHẠT PHÍ"; type = 'Tax'; color = 'red.9'; } 
    else if (i === 35) { name = "Nguyễn Công Trứ"; type = 'Land'; color = 'green.7'; }
    else if (i === 36) { name = "CƠ HỘI"; type = 'Chance'; color = 'orange.7'; } 
    else if (i === 37) { name = "Calmette"; type = 'Land'; color = 'red.7'; }
    else if (i === 38) { name = "Bến Thành"; type = 'Land'; color = 'yellow.7'; }
    else if (i === 39) { name = "QUẬN 1 (MAX)"; type = 'Land'; color = 'green.7'; }
    
    // Reward sẽ được tính trong logic, không cố định trên từng ô (trừ góc)
    return { id: i, name, type, reward: 0.0, color, isCorner };
});

type SquareConfig = typeof BOARD_POSITIONS[0];

type GameMessage = {
    text: string;
    color: 'red' | 'green' | 'yellow';
    icon: React.ReactNode;
} | null;

type CoTyPhuModalProps = { opened: boolean; close: () => void; };

// =========================
// 💰 CO TY PHU GAME MODAL
// =========================
export function CoTyPhuModal({ opened, close }: CoTyPhuModalProps) {
    const playerAddress = "0xaa...bbcc"; 

    // 🔥 STATE QUẢN LÝ GAME
    const [currentPosition, setCurrentPosition] = useState(0); 
    const [diceResult, setDiceResult] = useState(0); 
    const [isRolling, setIsRolling] = useState(false); 
    const [gameSUI, setGameSUI] = useState(10.0); 
    const [gameMessage, setGameMessage] = useState<GameMessage>(null);
    const [history, setHistory] = useState<any[]>([]);

    // Logic xử lý khi người chơi dừng ở một ô cờ (ĐÃ SỬA LỖI LOGIC 33.3% VÀ MÀU)
    const handleSquareEvent = (positionIndex: number) => {
        const square = BOARD_POSITIONS[positionIndex];
        let message: GameMessage = null;
        let suiReceived = 0; 
        let netProfit = 0;

        setGameMessage(null);
        
        const outcome = Math.random(); 

        if (square.type === 'Land' || square.type === 'Chance' || square.type === 'Tax') {
            
            if (outcome < WIN_PROB) { 
                suiReceived = LAND_REWARDS.WIN; 
            } else if (outcome < WIN_PROB * 2) { 
                suiReceived = LAND_REWARDS.DRAW; 
            } else { 
                suiReceived = LAND_REWARDS.LOSE; 
            }
            
            // Xử lý các ô đặc biệt Tax (luôn lỗ)
            if (square.type === 'Tax') {
                 suiReceived = LAND_REWARDS.LOSE; 
            }
        } else {
             // Ô góc
             suiReceived = 0;
             message = { text: `Dừng ở ${square.name}. Lượt tiếp theo!`, color: 'yellow', icon: <IconMap size={20} /> };
        }
        
        // Tính lãi/lỗ ròng so với 1 SUI đã chi
        netProfit = suiReceived - MIN_BET;
        
        // Cập nhật SUI và Message
        setGameSUI(prev => prev + suiReceived);

        if (!message) {
            if (netProfit > 0) {
                message = { text: `LỜI! Nhận ${suiReceived.toFixed(2)} SUI (+${netProfit.toFixed(2)} ròng)!`, color: 'green', icon: <IconCheck size={20} /> };
            } else if (netProfit < 0) {
                message = { text: `LỖ! Nhận ${suiReceived.toFixed(2)} SUI (${netProfit.toFixed(2)} ròng).`, color: 'red', icon: <IconAlertTriangle size={20} /> };
            } else {
                message = { text: `HÒA VỐN! Nhận ${suiReceived.toFixed(2)} SUI.`, color: 'yellow', icon: <IconCoin size={20} /> };
            }
        }
        
        setGameMessage(message);

        // Cập nhật History (Sửa lỗi hiển thị màu theo netProfit)
        setHistory(prev => [{ 
            status: square.name, 
            amount: `${suiReceived > 0 ? '+' : ''}${suiReceived.toFixed(2)} SUI`, 
            color: netProfit > 0 ? 'green' : (netProfit < 0 ? 'red' : 'yellow') 
        }, ...prev.slice(0, 4)]);
    };

    // Giả lập logic lắc xúc xắc và di chuyển
    const handleRollDice = () => {
        const bet = MIN_BET;

        if (isRolling) return;
        
        if (gameSUI < bet) {
            setGameMessage({ text: 'LỖI: Không đủ SUI trong Ví Game để đặt cược.', color: 'red', icon: <IconAlertTriangle size={20} /> });
            return;
        }

        // 1. Trừ tiền cược (MẤT 1 SUI)
        setGameSUI(prev => prev - bet);
        setGameMessage({ text: `Đã trừ ${bet.toFixed(2)} SUI chi phí lượt chơi. Đang lắc...`, color: 'yellow', icon: <IconCoin size={20} /> });
        setIsRolling(true);
        setDiceResult(0);
        
        const roll = Math.floor(Math.random() * 6) + 1;
        
        setTimeout(() => {
            setDiceResult(roll);
            setIsRolling(false);
            
            // Di chuyển
            const newPositionIndex = (currentPosition + roll) % NUM_POSITIONS; 
            
            // 2. Bắt đầu di chuyển nhân vật
            setTimeout(() => {
                setCurrentPosition(newPositionIndex);

                // 3. Sau khi di chuyển xong, xử lý sự kiện ô cờ
                setTimeout(() => {
                    handleSquareEvent(newPositionIndex);
                }, 500);

            }, 500);

        }, 1500); 
    };

    const currentSquare = BOARD_POSITIONS[currentPosition];
    const maxProfitDisplay = LAND_REWARDS.WIN - MIN_BET; 

    return (
        <Modal
            opened={opened}
            onClose={close}
            title={
                <Group align="center" gap="sm">
                    <IconMap size={28} style={{ color: '#f59e0b' }} />
                    <Title order={3} style={{ color: "#fff", textShadow: "0 0 5px #f59e0b" }}>
                        CỜ TỶ PHÚ (MONOPOLY) - WEB3 MINI GAME
                    </Title>
                </Group>
            }
            size="90%" 
            radius="lg"
            styles={{
                header: { background: "rgba(15, 23, 42, 0.9)", borderBottom: "1px solid rgba(245, 158, 11, 0.3)", padding: '16px 24px' },
                content: { backgroundColor: "#0f172a", border: "2px solid rgba(245, 158, 11, 0.2)", boxShadow: "0 8px 30px rgba(245, 158, 11, 0.15)", },
                body: { padding: '0 16px 16px 16px' }
            }}
            centered
        >
            <Box p="md" style={{ minHeight: '600px' }}>
                <Grid gutter="xl">
                    {/* ===================== COL 1: GAME BOARD (LẬP TRÌNH) ===================== */}
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <GameMapProgrammed 
                            currentPosition={currentPosition}
                            diceResult={diceResult}
                            gameMessage={gameMessage} 
                            currentSquare={currentSquare}
                            isRolling={isRolling}
                        />
                    </Grid.Col>

                    {/* ===================== COL 2: CONTROL & INFO ===================== */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="lg">
                            <PlayerInfo playerAddress={playerAddress} gameSUI={gameSUI} />
                            <BettingControls 
                                onRoll={handleRollDice} 
                                isRolling={isRolling} 
                                maxProfitDisplay={maxProfitDisplay}
                            />
                            <HistoryLog history={history} />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Box>
        </Modal>
    );
}

// ===================================
// 🗺️ GAME MAP (Bàn cờ được code lập trình)
// ===================================
type GameMapProps = {
    currentPosition: number;
    diceResult: number;
    gameMessage: GameMessage;
    currentSquare: SquareConfig;
    isRolling: boolean;
};

function GameMapProgrammed({ currentPosition, diceResult, gameMessage, isRolling }: GameMapProps) {
    
    // Tọa độ tương đối cho Token di chuyển (Sử dụng CSS Grid)
    const getSquarePosition = (index: number) => {
        let row = 0;
        let col = 0;
        const SideLength = BOARD_SIZE; // 12

        // Hàm tính tọa độ chính xác cho 40 ô trên lưới 12x12 (index 0-39)
        // 0-10: Cạnh dưới (row 11)
        if (index >= 0 && index <= 10) { 
            row = SideLength - 1;
            col = SideLength - 1 - index;
        } 
        // 11-20: Cạnh trái (col 0)
        else if (index >= 11 && index <= 20) { 
            row = SideLength - 1 - (index - 10);
            col = 0;
        } 
        // 21-30: Cạnh trên (row 0)
        else if (index >= 21 && index <= 30) { 
            row = 0;
            col = index - 20;
        } 
        // 31-39: Cạnh phải (col 11)
        else if (index >= 31 && index <= 39) {
             row = index - 30;
             col = SideLength - 1;
        } else {
            // Không nên xảy ra
             row = 0; col = 0;
        }

        // Chuyển sang giá trị % cho 'top' và 'left'
        const X = (col / (SideLength - 1)) * 100;
        const Y = (row / (SideLength - 1)) * 100;

        return { x: `${X}%`, y: `${Y}%` };
    };

    const tokenPos = getSquarePosition(currentPosition);

    return (
        <Stack gap="md">
            <Title order={4} c="white" style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "8px" }}>
                BÀN CỜ LẬP TRÌNH (SUI VALUE)
            </Title>
            <Box 
                style={{ 
                    position: 'relative', 
                    display: 'grid',
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                    aspectRatio: '1 / 1', 
                    border: '4px solid #f59e0b',
                    borderRadius: '12px',
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)"
                }}
            >
                {/* Render các ô cờ */}
                {BOARD_POSITIONS.map((square, index) => (
                    <Square key={index} square={square} isActive={index === currentPosition} />
                ))}

                {/* Khu vực trung tâm (Nền) */}
                <Box style={{ 
                    gridColumn: '2 / span 10', 
                    gridRow: '2 / span 10', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: '#1e293b', 
                    borderRadius: '8px',
                    padding: '10px',
                    zIndex: 5,
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Image 
                        src={centerImage} // Hình nền bạn đã cung cấp
                        alt="Monopoly Center" 
                        style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            opacity: 0.2, 
                            filter: 'blur(2px)' 
                        }} 
                    />
                    <Stack align="center" style={{ zIndex: 10 }}>
                        <Text c="dimmed" size="xs" ta="center">KẾT QUẢ</Text>
                        <DiceDisplay isRolling={isRolling} result={diceResult} /> 
                        <Text c="white" size="lg" fw={700}>{diceResult > 0 ? `+${diceResult} Ô` : ''}</Text>
                        <Group mt="md">
                            <IconCoin size={24} style={{ color: '#00E5FF' }} />
                            <IconPlayerPlay size={24} style={{ color: '#22c55e' }} />
                        </Group>
                    </Stack>
                </Box>


                {/* 2. Token Người Chơi (Animation) */}
                <motion.div 
                    key={currentPosition} 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                        x: tokenPos.x, 
                        y: tokenPos.y,
                        scale: 1,
                        opacity: 1,
                    }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 100, 
                        damping: 10,
                        delay: 0.5, 
                    }}
                    style={{ 
                        position: 'absolute', 
                        transform: 'translate(-50%, -50%)', 
                        zIndex: 20,
                        width: 40, 
                        height: 40,
                        top: tokenPos.y,
                        left: tokenPos.x
                    }}
                >
                    {/* Token (Icon) */}
                    <IconCircleDot size={40} style={{ color: '#00E5FF', filter: 'drop-shadow(0 0 5px #00E5FF)' }} /> 
                </motion.div>
                
                {/* 3. Khu vực thông báo vị trí / sự kiện */}
                <Card 
                    padding="sm" 
                    radius="md" 
                    style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px',
                        backgroundColor: "rgba(30, 41, 59, 0.85)", 
                        border: "1px solid #f59e0b",
                        zIndex: 30
                    }}
                >
                    {gameMessage && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <Alert variant="light" color={gameMessage.color} title={gameMessage.text} icon={gameMessage.icon} />
                        </motion.div>
                    )}
                </Card>
            </Box>
        </Stack>
    );
}

// ===================================
// 🔳 SQUARE (Ô CỜ) COMPONENT
// ===================================
type SquareProps = {
    square: SquareConfig;
    isActive: boolean;
};

function Square({ square, isActive }: SquareProps) {
    // Xử lý ô đặc biệt trước (Start, Jail, FreeParking, GoToJail)
    const isSpecialSquare = square.isCorner || square.type === 'Start' || square.type === 'Jail' || square.type === 'FreeParking' || square.type === 'GoToJail';
    
    let profitColor = 'white';
    let icon = <IconCoin size={16} color="#f59e0b" />;
    let displayValue = '';

    if (isSpecialSquare) {
        // Ô góc: chỉ hiển thị tên, không hiển thị lợi/lỗ
        displayValue = square.name.toUpperCase();
        profitColor = 'white';
        icon = <IconCircleDot size={16} color="#f59e0b" />;
    } else {
        // Ô thường: tính toán lợi/lỗ dựa trên reward thực tế
        const suiReceived = square.reward || 0; 
        const netProfit = suiReceived - MIN_BET; 

        // Logic Màu Sắc: 🟢 Xanh (Lời) | 🟡 Vàng (Hoà) | 🔴 Đỏ (Lỗ)
        if (netProfit > 0) {
            profitColor = 'lime.4'; // 🟢 LỜI - Xanh lá
            icon = <IconArrowUp size={16} color="#22c55e" />;
        } else if (netProfit < 0) {
            profitColor = 'red.4'; // 🔴 LỖ - Đỏ
            icon = <IconArrowDown size={16} color="#ef4444" />;
        } else {
            profitColor = 'yellow.4'; // 🟡 HÒA - Vàng
            icon = <IconCoin size={16} color="#f59e0b" />;
        }

        // Hiển thị giá trị SUI nhận về hoặc lợi/lỗ ròng
        if (suiReceived > 0) {
            displayValue = `${suiReceived.toFixed(2)} SUI`;
        } else if (netProfit > 0) {
            displayValue = `+${netProfit.toFixed(2)} Lời`;
        } else if (netProfit < 0) {
            displayValue = `${netProfit.toFixed(2)} Lỗ`;
        } else {
            // Chưa có dữ liệu (mặc định): hiển thị neutral
            displayValue = '?';
            profitColor = 'dimmed';
        }
    }


    return (
        <Box
            p={'xs'}
            style={{
                border: '1px solid #374151',
                // Sửa logic màu nền: Tận dụng màu đã định nghĩa (để tạo dải màu)
                backgroundColor: isActive ? 'rgba(255, 255, 0, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                gridArea: getGridArea(square.id, BOARD_SIZE),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                // Chỉ làm nổi bật vị trí hiện tại
                boxShadow: isActive ? '0 0 10px #f59e0b' : 'none', 
                transition: '0.3s',
            }}
        >
            <Text size="xs" fw={700} c={isActive ? 'white' : 'dimmed'}>{square.name}</Text>
            <Stack gap={2} align="center">
                {icon}
                <Text size="xs" fw={700} c={profitColor}>
                    {displayValue}
                </Text>
            </Stack>
        </Box>
    );
}

// 🔥 Hàm tính Grid Area cho bàn cờ 12x12
function getGridArea(id: number, size: number) {
    // 0-10: Cạnh dưới
    if (id >= 0 && id <= 10) { 
        return `${size} / ${size - id} / ${size + 1} / ${size - id + 1}`;
    }
    // 11-20: Cạnh trái
    if (id >= 11 && id <= 20) { 
        return `${size - (id - 10)} / 1 / ${size - (id - 10) + 1} / 2`;
    }
    // 21-30: Cạnh trên
    if (id >= 21 && id <= 30) { 
        return `1 / ${id - 20} / 2 / ${id - 20 + 1}`;
    }
    // 31-39: Cạnh phải
    if (id >= 31 && id <= 39) {
        return `${id - 30} / ${size} / ${id - 30 + 1} / ${size + 1}`;
    }

    return `1 / 1 / 2 / 2`;
}


// ... (Giữ nguyên DiceDisplay, PlayerInfo, BettingControls, HistoryLog) ...

// ===================================
// 🎲 DICE VISUAL COMPONENT
// ===================================
type DiceDisplayProps = { isRolling: boolean; result: number; };

function DiceDisplay({ isRolling, result }: DiceDisplayProps) {
    const diceDisplay = result > 0 ? result : (isRolling ? '?' : 'X'); 

    return (
        <motion.div
            animate={isRolling ? { rotate: [0, 360, 0], scale: [1, 1.2, 1] } : {}}
            transition={isRolling ? { duration: 0.3, repeat: 5, repeatType: 'reverse', ease: 'easeInOut' } : { type: 'spring', stiffness: 500 }}
            style={{ 
                width: 50, height: 50, borderRadius: 8, 
                backgroundColor: isRolling ? '#38bdf8' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isRolling ? '0 0 15px rgba(56, 189, 248, 0.8)' : '0 0 5px rgba(0,0,0,0.5)',
                border: '2px solid #f59e0b', color: 'white', fontSize: '1.5rem', fontWeight: 900,
                flexShrink: 0
            }}
        >
            <Text c="white" fw={900}>{diceDisplay}</Text>
        </motion.div>
    );
}

// =========================
// 👤 PLAYER INFO (Thông tin người chơi)
// =========================
type PlayerInfoProps = { playerAddress: string; gameSUI: number; };

function PlayerInfo({ playerAddress, gameSUI }: PlayerInfoProps) {
    const currentSUI = 100.5; 

    return (
        <Card shadow="lg" padding="lg" radius="md" style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <Stack gap="xs">
                <Group justify="space-between">
                    <Text fw={700} c="white"><IconUserCircle size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />Người chơi</Text>
                    <Badge color="orange" variant="light">{playerAddress.slice(0, 6)}...</Badge>
                </Group>
                <Divider opacity={0.1} />
                <Group justify="space-between">
                    <Text c="dimmed">SUI hiện tại (Ví Game):</Text>
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

// =========================
// 🎰 BETTING & DICE CONTROLS 
// =========================
type BettingControlsProps = {
    onRoll: () => void;
    isRolling: boolean;
    maxProfitDisplay: number;
};

function BettingControls({ onRoll, isRolling, maxProfitDisplay }: BettingControlsProps) {
    const currentBet = MIN_BET;

    return (
        <Stack gap="md">
            <Title order={4} c="white" style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "8px" }}>
                🎲 LƯỢT CHƠI
            </Title>
            
            <Stack gap={4} p="xs">
                <Group justify="space-between">
                    <Text c="dimmed">Chi phí lượt:</Text>
                    <Text fw={700} c="#f59e0b">{currentBet.toFixed(2)} SUI</Text> 
                </Group>
                <Group justify="space-between">
                    <Text c="dimmed">Mục tiêu lợi nhuận tối đa:</Text>
                    <Text fw={700} c="#22c55e">{maxProfitDisplay.toFixed(2)} SUI</Text>
                </Group>
            </Stack>
            
            {/* Nút Lắc Xúc xắc */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    size="xl"
                    leftSection={<IconDice5 size={28} />}
                    onClick={onRoll} 
                    disabled={isRolling}
                    loading={isRolling}
                    style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        boxShadow: "0 4px 16px rgba(245, 158, 11, 0.4)",
                        marginTop: '10px'
                    }}
                >
                    {isRolling ? 'ĐANG LẮC...' : `LẮC XÚC XẮC (${currentBet.toFixed(2)} SUI)`}
                </Button>
            </motion.div>
            
            <Text ta="center" c='dimmed' size="sm" mt="xs" fw={700}>
                Chi phí lượt chơi cố định: 1.00 SUI
            </Text>
        </Stack>
    );
}

// =========================
// 📜 HISTORY LOG COMPONENT
// =========================
type HistoryLogProps = { history: any[] };

function HistoryLog({ history }: HistoryLogProps) {
    return (
        <Stack gap="xs">
            <Title order={4} c="white" style={{ borderLeft: "4px solid #f59e0b", paddingLeft: "8px" }}>
                📜 LOG GIAO DỊCH
            </Title>
            <Box style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {history.map((item, index) => (
                    <Group key={index} justify="space-between" p="xs" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px', marginBottom: '4px' }}>
                        <Group gap="xs">
                            <Text c="dimmed" fw={500}>{index + 1}.</Text>
                            <Text c="white" fw={500}>{item.status}</Text>
                        </Group>
                        <Text c={item.color} fw={700}>{item.amount}</Text>
                    </Group>
                ))}
            </Box>
            <Text size="sm" c="dimmed" mt="xs" style={{ textAlign: 'center' }}>
                *Lưu ý: Mọi giao dịch đều được ghi trên SUI blockchain.
            </Text>
        </Stack>
    );
}
