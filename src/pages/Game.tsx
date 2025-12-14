import { Box, Card, Title, Text, SimpleGrid } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { motion } from "framer-motion";

// Import các Modal cho từng game (sẽ định nghĩa bên dưới)
import { BiLacModal } from "../components/game/BiLacModal";
import { CoTyPhuModal } from "../components/game/CoTyPhuModal";
import { CoinFlipModal } from "../components/game/CoinFlipModal";

// 🔥 CÁC HÌNH ẢNH ĐÃ IMPORT
import Monopoly from "../assets/game/monopoly.png"
import Bilac from "../assets/game/bilac.png"
import Coinflip from "../assets/game/coinflip.png"



/* =========================
    🎮 MAIN GAME COMPONENT
========================= */

export default function Game() {
  // State quản lý Modal cho từng game
  const [biLacOpened, { open: openBiLac, close: closeBiLac }] = useDisclosure(false);
  const [coTyPhuOpened, { open: openCoTyPhu, close: closeCoTyPhu }] = useDisclosure(false);
  const [coinFlipOpened, { open: openCoinFlip, close: closeCoinFlip }] = useDisclosure(false);

  // Dữ liệu cho các Game Card
  const games = [
    {
      name: "BI LẮC",
      onClick: openBiLac,
      // CHỈNH SỬA: Gán trực tiếp biến import
      image: Bilac, 
      background: "linear-gradient(135deg, #1f4068 0%, #16a34a 100%)",
    },
    {
      name: "CỜ TỶ PHÚ",
      onClick: openCoTyPhu,
      // CHỈNH SỬA: Gán trực tiếp biến import
      image: Monopoly, 
      background: "linear-gradient(135deg, #383e56 0%, #ff4b5c 100%)",
    },
    {
      name: "COIN FLIP",
      onClick: openCoinFlip,
      // CHỈNH SỬA: Gán trực tiếp biến import
      image: Coinflip, 
      background: "linear-gradient(135deg, #3e7e8b 0%, #4a90e2 100%)",
    },
  ];

  return (
    <Box>
      <Title 
        order={2} 
        mb="lg" 
        style={{ 
          color: "white", 
          textAlign: "center", 
          textShadow: "0 0 10px rgba(14, 165, 233, 0.5)", // Ánh sáng xanh nhẹ
          textTransform: "uppercase",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(14, 165, 233, 0.3)"
        }}
      >
        🎲 DANH SÁCH TRÒ CHƠI
      </Title>

      {/* Sử dụng SimpleGrid để tạo layout responsive */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="xl"
        verticalSpacing="xl"
      >
        {games.map((game) => (
          <GameCard 
            key={game.name}
            name={game.name}
            onClick={game.onClick}
            image={game.image}
            background={game.background}
          />
        ))}
      </SimpleGrid>

      {/* Các Modal Game */}
      <BiLacModal opened={biLacOpened} close={closeBiLac} />
      <CoTyPhuModal opened={coTyPhuOpened} close={closeCoTyPhu} />
      <CoinFlipModal opened={coinFlipOpened} close={closeCoinFlip} />
    </Box>
  );
}

/* =========================
    💎 GAME CARD COMPONENT (Đã Chỉnh Sửa)
========================= */

type GameCardProps = {
  name: string;
  onClick: () => void;
  // CHỈNH SỬA: Thay đổi type của image thành string (là path/URL)
  image: string; 
  background: string;
};

function GameCard({ name, onClick, image, background }: GameCardProps) {
  // Biến thể cho hiệu ứng Framer Motion (hiệu ứng hover, nhấn)
  const cardVariants = {
    rest: { scale: 1, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" },
    hover: { 
      scale: 1.03, 
      boxShadow: "0 12px 40px rgba(34, 197, 94, 0.4)", // Thêm box shadow màu xanh lá
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        shadow="xl"
        padding="xl"
        radius="lg"
        withBorder
        onClick={onClick}
        style={{
          height: 250, 
          cursor: "pointer",
          // Tăng độ đậm của border và làm nó có màu nhẹ
          border: "2px solid rgba(34, 197, 94, 0.2)", 
          overflow: "hidden",
          position: "relative",
          
          // Đặt hình nền sử dụng biến `image`
          backgroundImage: `url(${image})`, 
          backgroundSize: "cover",
          backgroundPosition: "center",
          
          // Thêm hiệu ứng kính mờ (Glassmorphism effect) nhẹ cho Card
          // background: "rgba(15, 23, 42, 0.7)", 
          // backdropFilter: "blur(2px)",
          
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Lớp Overlay để làm nổi bật Text và tạo hiệu ứng mờ nhẹ */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            // Lớp phủ đen đậm hơn, làm mờ hình nền phía sau
            background: "rgba(0, 0, 0, 0.5)", 
            backdropFilter: "blur(3px)", // Tăng độ mờ nhẹ
            transition: "0.3s",
          }}
        />
        
        {/* Lớp Overlay thứ hai (hiệu ứng gradient lấp lánh khi hover) */}
         <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              opacity: 0,
            }}
            whileHover={{ 
              opacity: 1, 
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            }}
            transition={{ duration: 0.3 }}
          />


        <Text
          size="xl"
          fw={900}
          c="white"
          style={{
            zIndex: 1,
            // Thêm hiệu ứng neon cho text
            textShadow: "0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.4)", 
            letterSpacing: "2px",
            fontSize: "2.5rem", 
            textTransform: "uppercase"
          }}
        >
          {name}
        </Text>
      </Card>
    </motion.div>
  );
}