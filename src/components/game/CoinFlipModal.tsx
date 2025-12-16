import { useState, useCallback, useEffect } from "react";
import { Modal, Button, Text, Box, Group, Stack, Badge, Paper, SegmentedControl } from "@mantine/core";
import { keyframes, css } from "@emotion/react";
import styled from "@emotion/styled";
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { IconCoin } from '@tabler/icons-react';

// ============ TYPES & CONFIG ============
type CoinSide = "heads" | "tails";
type GameState = "idle" | "betting" | "flipping" | "result";
type GameResult = "win" | "lose" | null;
type BetLevel = 1 | 2 | 3 | 5 | 10;

type GameModalProps = {
  opened: boolean;
  close: () => void;
  userBalance?: number;
  onTransaction?: (type: "bet" | "win" | "lose", amount: number) => void;
};

const BET_LEVELS: BetLevel[] = [1, 2, 3, 5, 10];
const WIN_MULTIPLIER = 2;
const HOUSE_FEE = 0.05;
const ANIMATION_DURATION = 3.2;
const TIMEOUT_DELAY = ANIMATION_DURATION * 1000;

// ============ ANIMATIONS ============
const coinFlipHeads = keyframes`
  0% { 
    transform: translateY(0) rotateX(0deg) rotateY(0deg) scale(1); 
    opacity: 1;
    filter: brightness(1);
  }
  10% {
    filter: brightness(0.8);
  }
  25% { 
    transform: translateY(-350px) rotateX(600deg) rotateY(2400deg) scale(1.25); 
    opacity: 0.95;
    filter: brightness(1.2);
  }
  50% { 
    transform: translateY(-420px) rotateX(1200deg) rotateY(4800deg) scale(1.3); 
    opacity: 0.9;
    filter: brightness(0.9);
  }
  75% {
    transform: translateY(-250px) rotateX(1650deg) rotateY(6600deg) scale(1.15);
    opacity: 0.95;
    filter: brightness(1.1);
  }
  90% {
    filter: brightness(1);
  }
  100% { 
    transform: translateY(0) rotateX(1800deg) rotateY(0deg) scale(1); 
    opacity: 1;
    filter: brightness(1);
  }
`;

const coinFlipTails = keyframes`
  0% { 
    transform: translateY(0) rotateX(0deg) rotateY(0deg) scale(1); 
    opacity: 1;
    filter: brightness(1);
  }
  10% {
    filter: brightness(0.8);
  }
  25% { 
    transform: translateY(-350px) rotateX(600deg) rotateY(2400deg) scale(1.25); 
    opacity: 0.95;
    filter: brightness(1.2);
  }
  50% { 
    transform: translateY(-420px) rotateX(1200deg) rotateY(4800deg) scale(1.3); 
    opacity: 0.9;
    filter: brightness(0.9);
  }
  75% {
    transform: translateY(-250px) rotateX(1650deg) rotateY(6600deg) scale(1.15);
    opacity: 0.95;
    filter: brightness(1.1);
  }
  90% {
    filter: brightness(1);
  }
  100% { 
    /* Tails: flip the coin 180deg on Y-axis so tails face shows (combined with CoinFace rotateY(180deg)) */
    transform: translateY(0) rotateX(1800deg) rotateY(180deg) scale(1); 
    opacity: 1;
    filter: brightness(1);
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0) scale(1);
  }
  50% { 
    transform: translateY(-25px) scale(1.08);
  }
`;

const shadowPulse = keyframes`
  0%, 100% { 
    transform: translateX(-50%) scaleX(1); 
    opacity: 0.5; 
  }
  50% { 
    transform: translateX(-50%) scaleX(0.6); 
    opacity: 0.2; 
  }
`;

const resultPop = keyframes`
  0% { 
    transform: scale(0) rotate(-20deg); 
    opacity: 0; 
  }
  60% { 
    transform: scale(1.15) rotate(8deg); 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
    opacity: 1; 
  }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  50% { 
    box-shadow: 0 0 60px rgba(168, 85, 247, 0.9), 0 15px 30px rgba(0, 0, 0, 0.4);
  }
`;

const confettiFall = keyframes`
  0% { 
    transform: translateY(-30px) translateX(0) rotate(0deg); 
    opacity: 1;
  }
  100% { 
    transform: translateY(600px) translateX(var(--tx, 0)) rotate(720deg); 
    opacity: 0;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// ============ STYLED COMPONENTS ============
const CoinContainer = styled.div`
  perspective: 1400px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
  position: relative;
  margin: 2rem 0 1.5rem 0;
  
  @media (max-width: 768px) {
    height: 280px;
    margin: 1.5rem 0 1rem 0;
  }
  
  @media (max-width: 480px) {
    height: 220px;
    margin: 1rem 0 0.75rem 0;
  }
`;

const CoinWrapper = styled.div<{ $shaking: boolean }>`
  position: relative;
  width: 180px;
  height: 180px;
  perspective: 1000px;
  ${({ $shaking }) => $shaking && css`animation: ${shake} 0.15s ease-in-out;`}
  
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
  }
  
  @media (max-width: 480px) {
    width: 110px;
    height: 110px;
  }
`;

const Coin = styled.div<{ $isFlipping: boolean; $result: CoinSide | null; $gameState: GameState }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: ${({ $isFlipping }) => $isFlipping ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"};
  cursor: ${({ $gameState }) => $gameState === "idle" ? "pointer" : "default"};
  filter: drop-shadow(0 10px 40px rgba(0, 0, 0, 0.4));
  
  ${({ $isFlipping, $result }) => 
    $isFlipping && $result === "heads" && css`
      animation: ${coinFlipHeads} ${ANIMATION_DURATION}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
      transform-origin: center center;
    `
  }
  
  ${({ $isFlipping, $result }) => 
    $isFlipping && $result === "tails" && css`
      animation: ${coinFlipTails} ${ANIMATION_DURATION}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
      transform-origin: center center;
    `
  }
  
  ${({ $gameState, $isFlipping }) => 
    !$isFlipping && ($gameState === "idle" || $gameState === "betting") && css`
      animation: ${float} 5s ease-in-out infinite;
    `
  }

  /* After flip ends, keep the coin rotated to show the correct face */
  ${({ $isFlipping, $result }) => 
    !$isFlipping && $result === "tails" && `
      transform: rotateY(180deg);
    `
  }

  &:hover:not(:disabled) {
    filter: drop-shadow(0 15px 50px rgba(168, 85, 247, 0.4));
  }
`;

const CoinFace = styled.div<{ $side: "heads" | "tails" }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7rem;
  font-weight: 900;
  border: 8px solid #fbbf24;
  user-select: none;
  box-shadow: 
    inset 0 0 50px rgba(0, 0, 0, 0.6),
    inset 0 15px 40px rgba(255, 255, 255, 0.25),
    0 25px 70px rgba(0, 0, 0, 0.7);
  /* Both faces start at the same position; use rotateY to flip tails to back */
  ${({ $side }) => $side === 'tails' && 'transform: rotateY(180deg);'}
  
  @media (max-width: 768px) {
    font-size: 5.5rem;
    border: 6px solid #fbbf24;
    box-shadow: 
      inset 0 0 40px rgba(0, 0, 0, 0.5),
      inset 0 10px 30px rgba(255, 255, 255, 0.2),
      0 15px 50px rgba(0, 0, 0, 0.5);
  }
  
  /* Ensure the face doesn't show through when flipped */
  backface-visibility: hidden;
  
  @media (max-width: 480px) {
    font-size: 4rem;
    border: 5px solid #fbbf24;
    box-shadow: 
      inset 0 0 30px rgba(0, 0, 0, 0.4),
      inset 0 8px 20px rgba(255, 255, 255, 0.15),
      0 10px 35px rgba(0, 0, 0, 0.4);
  }
  
  ${({ $side }) => $side === "heads" && `
    background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 20%, #f59e0b 60%, #d97706 100%);
    transform: rotateY(0deg);
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(251, 191, 36, 0.3);
  `}
  
  ${({ $side }) => $side === "tails" && `
    background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 20%, #7dd3fc 60%, #38bdf8 100%);
    transform: rotateY(180deg);
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(56, 189, 248, 0.3);
  `}
`;

const CoinEdge = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(90deg, #78350f 0%, #fbbf24 50%, #78350f 100%);
  transform: translateZ(-10px);
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.8),
    0 0 30px rgba(251, 191, 36, 0.3);
`;

const CoinShadow = styled.div<{ $isFlipping: boolean }>`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 35px;
  background: radial-gradient(ellipse 160px 35px at center, rgba(0, 0, 0, 0.45), transparent);
  border-radius: 50%;
  filter: blur(5px);
  ${({ $isFlipping }) => 
    $isFlipping && css`
      animation: ${shadowPulse} ${ANIMATION_DURATION}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
    `
  }
`;

const BetOptionButton = styled.button<{ $selected: boolean }>`
  padding: 1rem 1.5rem;
  border-radius: 14px;
  border: 3px solid ${({ $selected }) => $selected ? "#a855f7" : "#4b5563"};
  background: ${({ $selected }) => 
    $selected 
      ? "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))" 
      : "rgba(255, 255, 255, 0.05)"};
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  
  @media (max-width: 768px) {
    padding: 0.85rem 1.2rem;
    font-size: 0.9rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
    border-radius: 10px;
    border-width: 2px;
  }
  
  ${({ $selected }) => $selected && `
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
    transform: scale(1.08);
  `}
  
  &:hover {
    border-color: #a855f7;
    background: rgba(168, 85, 247, 0.1);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const SideButton = styled.button<{ $selected: boolean; $side: CoinSide }>`
  flex: 1;
  padding: 2rem 1rem;
  border-radius: 18px;
  border: 4px solid ${({ $selected, $side }) => 
    $selected ? ($side === "heads" ? "#fbbf24" : "#38bdf8") : "#4b5563"};
  background: ${({ $selected }) => 
    $selected ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-family: inherit;
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.8rem;
    border-radius: 16px;
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.2rem 0.6rem;
    border-radius: 14px;
    gap: 0.6rem;
    border-width: 3px;
  }
  
  ${({ $selected, $side }) => $selected && `
    box-shadow: 0 0 40px ${$side === "heads" ? "rgba(251, 191, 36, 0.5)" : "rgba(56, 189, 248, 0.5)"};
    transform: scale(1.06);
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.04);
    border-color: ${({ $side }) => $side === "heads" ? "#fbbf24" : "#38bdf8"};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const FlipButton = styled.button<{ $ready: boolean }>`
  width: 100%;
  padding: 1.4rem;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, #a855f7, #9333ea, #7e22ce);
  color: white;
  font-weight: 900;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    padding: 1.1rem;
    font-size: 1.1rem;
    border-radius: 16px;
    letter-spacing: 0.5px;
  }
  
  @media (max-width: 480px) {
    padding: 0.9rem;
    font-size: 0.95rem;
    border-radius: 14px;
    letter-spacing: 0px;
  }
  
  ${({ $ready }) => $ready && `
    ${css`animation: ${pulseGlow} 2s ease-in-out infinite;`}
  `}
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 50px rgba(168, 85, 247, 0.7);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.96);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultCard = styled(Paper)<{ $result: GameResult }>`
  ${css`animation: ${resultPop} 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;`}
  border: 4px solid ${({ $result }) => $result === "win" ? "#22c55e" : "#ef4444"};
  background: linear-gradient(135deg, 
    ${({ $result }) => $result === "win" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}, 
    rgba(51, 65, 85, 0.6)
  ) !important;
  box-shadow: ${({ $result }) => $result === "win" 
    ? "0 0 30px rgba(34, 197, 94, 0.3)" 
    : "0 0 30px rgba(239, 68, 68, 0.3)"};
  padding: 2rem;
  border-radius: 18px;
`;

const ConfettiPiece = styled.div<{ $delay: number; $x: number; $color: string }>`
  position: absolute;
  width: 14px;
  height: 14px;
  background: ${({ $color }) => $color};
  left: ${({ $x }) => $x}%;
  top: -10px;
  border-radius: 50%;
  ${css`animation: ${confettiFall} 3.5s ease-in forwards;`}
  animation-delay: ${({ $delay }) => $delay}s;
  --tx: ${Math.random() > 0.5 ? Math.random() * 100 : -Math.random() * 100}px;
  box-shadow: 0 0 10px ${({ $color }) => $color};
`;

const SoundToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #4b5563;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #a855f7;
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
  }
`;

// ============ SOUND EFFECTS ============
const playSound = (frequency: number, duration: number) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Fallback if Web Audio API is not available
  }
};

// ============ CONFETTI COMPONENT ============
const Confetti = () => {
  const colors = ["#a855f7", "#38bdf8", "#fbbf24", "#22c55e", "#ef4444", "#ec4899", "#f97316"];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.7,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} $x={piece.x} $color={piece.color} $delay={piece.delay} />
      ))}
    </div>
  );
};

// ============ MAIN COMPONENT ============
export function CoinFlipModal({ opened, close, userBalance = 100, onTransaction }: GameModalProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [betAmount, setBetAmount] = useState<BetLevel>(1);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [balance, setBalance] = useState(userBalance);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalFlips: 0, totalWon: 0, totalLost: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSelectSide = (side: CoinSide) => {
    if (!isFlipping && (gameState === "idle" || gameState === "betting")) {
      setSelectedSide(side);
      setGameState("betting");
    }
  };

  const handleFlip = useCallback(() => {
    if (!selectedSide || balance < betAmount || isFlipping) return;

    setBalance((prev) => prev - betAmount);
    onTransaction?.("bet", betAmount);
    
    setGameState("flipping");
    setIsFlipping(true);
    setResult(null);
    setGameResult(null);
    setShowConfetti(false);

    // Play flip sound effect
    if (soundEnabled) {
      playSound(440, 0.1);
      setTimeout(() => playSound(550, 0.1), 150);
      setTimeout(() => playSound(660, 0.2), 300);
    }

    // Generate result
    const flipResult: CoinSide = Math.random() < 0.5 ? "heads" : "tails";
    // set the result first so the styled component picks correct keyframe
    setResult(flipResult);

    // Slight delay to ensure the result prop is applied before starting animation
    setTimeout(() => setIsFlipping(true), 40);

    // Handle result after animation (delay accounts for the small trigger offset)
    setTimeout(() => {
      setIsFlipping(false);
      setGameState("result");

      const won = flipResult === selectedSide;
      setGameResult(won ? "win" : "lose");

      if (won) {
        // Win: betAmount * 2 - 0.05
        const winAmount = (betAmount * WIN_MULTIPLIER) - HOUSE_FEE;
        setBalance((prev) => prev + winAmount);
        onTransaction?.("win", winAmount);
        setStats((prev) => ({ 
          ...prev, 
          wins: prev.wins + 1,
          totalFlips: prev.totalFlips + 1,
          totalWon: prev.totalWon + winAmount
        }));
        setShowConfetti(true);
        
        if (soundEnabled) {
          setTimeout(() => playSound(800, 0.3), 500);
          setTimeout(() => playSound(1000, 0.2), 750);
        }
        
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        // Lose: lose the bet amount
        setStats((prev) => ({ 
          ...prev, 
          losses: prev.losses + 1,
          totalFlips: prev.totalFlips + 1,
          totalLost: prev.totalLost + betAmount
        }));
        onTransaction?.("lose", betAmount);
        
        if (soundEnabled) {
          setTimeout(() => playSound(300, 0.3), 500);
          setTimeout(() => playSound(250, 0.2), 750);
        }
      }
    }, TIMEOUT_DELAY);
  }, [selectedSide, balance, betAmount, isFlipping, soundEnabled, onTransaction]);

  const handlePlayAgain = () => {
    setGameState("idle");
    setSelectedSide(null);
    setResult(null);
    setGameResult(null);
  };

  const canPlay = balance >= betAmount;
  const potentialWin = (betAmount * WIN_MULTIPLIER) - HOUSE_FEE;
  const net = potentialWin - betAmount;
  const winRate = stats.totalFlips > 0 ? ((stats.wins / stats.totalFlips) * 100).toFixed(1) : "0";

  return (
    <Modal
      opened={opened}
      onClose={() => { 
        handlePlayAgain(); 
        close(); 
      }}
      title="🪙 Coin Flip Game"
      centered
      size="auto"
      fullScreen={typeof window !== 'undefined' && window.innerWidth < 768}
      styles={{
        root: {
          '@media (max-width: 768px)': {
            alignItems: 'flex-end',
          },
        },
        inner: {
          '@media (max-width: 768px)': {
            padding: '1rem',
          },
          '@media (max-width: 480px)': {
            padding: '0.5rem',
          },
        },
        header: { 
          backgroundColor: "#1a1f2e", 
          color: "white", 
          borderBottom: "3px solid #a855f7",
          padding: "1rem",
          '@media (max-width: 480px)': {
            padding: '0.75rem',
          },
        },
        content: { 
          backgroundColor: "#0f172a", 
          overflow: "visible",
          maxHeight: '90vh',
          overflowY: 'auto',
          '@media (max-width: 768px)': {
            maxHeight: '85vh',
          },
          '@media (max-width: 480px)': {
            maxHeight: '80vh',
          },
        },
        title: { 
          fontWeight: 900, 
          fontSize: 28,
          background: "linear-gradient(135deg, #a855f7, #38bdf8)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          '@media (max-width: 768px)': {
            fontSize: 24,
          },
          '@media (max-width: 480px)': {
            fontSize: 20,
          },
        },
        body: { 
          padding: "2rem", 
          position: "relative", 
          overflow: "visible",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))",
          '@media (max-width: 768px)': {
            padding: '1.5rem',
          },
          '@media (max-width: 480px)': {
            padding: '1rem',
          },
        },
      }}
    >
      <Box style={{ position: "relative", overflow: "visible" }}>
        {showConfetti && <Confetti />}
        
        <SoundToggle 
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </SoundToggle>

        {/* Header - Balance & Stats */}
        <Group justify="space-between" mb="lg" wrap="wrap" gap="md">
          <Paper 
            p="md" 
            px="lg" 
            radius="16px" 
            style={{ 
              background: "linear-gradient(135deg, #1e293b, #334155)",
              border: "2px solid #a855f7",
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)",
              minWidth: 'auto',
            }}
          >
            <Group gap="md">
              <IconCoin size={28} color="#fbbf24" />
              <div>
                <Text fw={900} size="xl" c="#fbbf24">{balance.toFixed(2)}</Text>
                <Text size="xs" c="dimmed" fw={600}>SUI Balance</Text>
              </div>
            </Group>
          </Paper>
          <Group gap="sm">
            <Badge 
              color="green" 
              variant="light" 
              size="xl"
              leftSection="✓"
              fw={800}
            >
              {stats.wins}
            </Badge>
            <Badge 
              color="red" 
              variant="light" 
              size="xl"
              leftSection="✗"
              fw={800}
            >
              {stats.losses}
            </Badge>
          </Group>
        </Group>

        {/* Win Rate & Stats */}
        {stats.totalFlips > 0 && (
          <Paper 
            p="sm" 
            radius="14px" 
            mb="lg"
            style={{ 
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
            }}
          >
            <Group justify="space-between" wrap="wrap" gap="xs">
              <div>
                <Text size="xs" c="dimmed" fw={600}>Win Rate</Text>
                <Text fw={800} c="#22c55e" size="lg">{winRate}%</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600}>Total Games</Text>
                <Text fw={800} c="#a855f7" size="lg">{stats.totalFlips}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" fw={600}>Net Profit</Text>
                <Text fw={800} c={stats.totalWon - stats.totalLost >= 0 ? "#22c55e" : "#ef4444"} size="lg">
                  {(stats.totalWon - stats.totalLost).toFixed(2)} SUI
                </Text>
              </div>
            </Group>
          </Paper>
        )}

        {/* Bet Level Selection */}
        {(gameState === "idle" || gameState === "betting") && (
          <Box mb="lg">
            <Text ta="center" c="dimmed" fw={700} size="sm" mb="md">
              Select Bet Amount
            </Text>
            <Group grow gap="xs">
              {BET_LEVELS.map((level) => (
                <BetOptionButton
                  key={level}
                  $selected={betAmount === level}
                  onClick={() => !isFlipping && setBetAmount(level)}
                  title={`Bet ${level} SUI`}
                >
                  {level} SUI
                </BetOptionButton>
              ))}
            </Group>
          </Box>
        )}

        {/* Payout Information */}
        <Box 
          ta="center" 
          mb="xl" 
          p="md" 
          style={{
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(56, 189, 248, 0.08))",
            border: "2px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "16px",
          }}
        >
          <Text size="sm" c="dimmed" fw={700} mb="sm">
            If You Win
          </Text>
          <Group 
            justify="center" 
            gap="lg"
          >
            <div>
              <Text size="xs" c="dimmed" fw={600}>Your Bet</Text>
              <Text fw={800} size="xl" c="#fbbf24">{betAmount} SUI</Text>
            </div>
            <Text fw={700} c="dimmed" size="2xl">×2</Text>
            <div>
              <Text size="xs" c="dimmed" fw={600}>Minus Fee</Text>
              <Text fw={800} size="xl" c="#ef4444">-0.05 SUI</Text>
            </div>
            <Text fw={700} c="dimmed" size="2xl">=</Text>
            <div>
              <Text size="xs" c="dimmed" fw={600}>You Get</Text>
              <Text fw={900} size="xl" c="#22c55e">{potentialWin.toFixed(2)} SUI</Text>
            </div>
          </Group>
          <Text size="xs" c="dimmed" mt="md" fw={600}>
            Net Profit: <Text span fw={900} c="#22c55e">+{net.toFixed(2)} SUI</Text>
          </Text>
        </Box>

        {/* Coin Display */}
        <CoinContainer>
          <CoinWrapper $shaking={isFlipping}>
            <Coin $isFlipping={isFlipping} $result={result} $gameState={gameState}>
              <CoinEdge />
              <CoinFace $side="heads">👑</CoinFace>
              <CoinFace $side="tails">🌊</CoinFace>
            </Coin>
            <CoinShadow $isFlipping={isFlipping} />
          </CoinWrapper>
        </CoinContainer>

        {/* Game Controls */}
        {(gameState === "idle" || gameState === "betting") && (
          <Stack gap="lg">
            <Text ta="center" c="dimmed" fw={700} size="md">
              Choose Your Side
            </Text>
            <Group grow gap="lg">
              <SideButton 
                $selected={selectedSide === "heads"} 
                $side="heads" 
                onClick={() => handleSelectSide("heads")}
                title="Choose Heads"
              >
                <Text size="4rem">👑</Text>
                  <Text fw={900} c="white" size="lg">HEADS</Text>
              </SideButton>
              <SideButton 
                $selected={selectedSide === "tails"} 
                $side="tails" 
                onClick={() => handleSelectSide("tails")}
                title="Choose Tails"
              >
                <Text size="4rem">🌊</Text>
                  <Text fw={900} c="white" size="lg">TAILS</Text>
              </SideButton>
            </Group>
            <FlipButton 
              $ready={!!selectedSide && canPlay} 
              onClick={handleFlip} 
              disabled={!selectedSide || !canPlay}
              title={!canPlay ? "Insufficient balance" : "Flip the coin"}
            >
              {!canPlay ? `💸 Need ${(betAmount - balance).toFixed(2)} More SUI` : "🎲 FLIP COIN"}
            </FlipButton>
          </Stack>
        )}

        {/* Flipping State */}
        {gameState === "flipping" && (
          <Box ta="center" py="2xl">
            <Text size="3rem" fw={900} c="#a855f7" mb="md">
              🎲
            </Text>
            <Text size="2xl" fw={800} c="white" mb="sm">
              Flipping...
            </Text>
            <Text size="sm" c="dimmed" fw={600}>
              The coin is spinning!
            </Text>
          </Box>
        )}

        {/* Result Display */}
        {gameState === "result" && (
          <Stack gap="lg">
            <Paper 
              p="2rem"
              radius="18px"
              style={{
                border: `4px solid ${gameResult === "win" ? "#22c55e" : "#ef4444"}`,
                background: `linear-gradient(135deg, ${gameResult === "win" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}, rgba(51, 65, 85, 0.6))`,
                boxShadow: gameResult === "win" ? "0 0 30px rgba(34, 197, 94, 0.3)" : "0 0 30px rgba(239, 68, 68, 0.3)",
                animation: `resultPop 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
              }}
            >
              <Stack align="center" gap="lg">
                <Text size="6rem" fw={900}>
                  {result === "heads" ? "👑" : "🌊"}
                </Text>
                <div>
                  <Text fw={900} size="2xl" c="white" mb="md">
                    {result === "heads" ? "HEADS" : "TAILS"}
                  </Text>
                </div>
                <Text 
                  fw={900} 
                  size="3xl" 
                  c={gameResult === "win" ? "#22c55e" : "#ef4444"}
                >
                  {gameResult === "win" 
                    ? `✨ +${potentialWin.toFixed(2)} SUI ✨` 
                    : `-${betAmount} SUI`}
                </Text>
                <Text 
                  size="xl" 
                  fw={800}
                  c={gameResult === "win" ? "#22c55e" : "#fbbf24"}
                >
                  {gameResult === "win" ? "🎉 YOU WON!" : "Try Again!"}
                </Text>
              </Stack>
            </Paper>
            <Button 
              onClick={handlePlayAgain} 
              fullWidth 
              size="xl" 
              variant="gradient"
              gradient={{ from: "#a855f7", to: "#7e22ce" }}
              disabled={!canPlay}
              fw={800}
              leftSection={<RotateCcw size={22} />}
            >
              {canPlay ? "PLAY AGAIN" : `Need ${(betAmount - balance).toFixed(2)} More SUI`}
            </Button>
          </Stack>
        )}

        {/* Game Rules */}
        <Paper 
          mt="xl" 
          p="md" 
          radius="16px" 
          style={{ 
            background: "rgba(15, 23, 42, 0.9)", 
            border: "2px solid #334155"
          }}
        >
          <Text fw={900} size="sm" c="#a855f7" mb="md">
            📜 GAME RULES & MECHANICS
          </Text>
          <Stack gap="sm">
            <Group gap="xs">
              <Text size="lg" fw={700} c="#fbbf24">1.</Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                Select your bet amount: <Text span fw={800} c="#a855f7">1, 2, 3, 5, or 10 SUI</Text>
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="lg" fw={700} c="#38bdf8">2.</Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                Choose Heads or Tails
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="lg" fw={700} c="#22c55e">3.</Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                Win: <Text span fw={700} c="#22c55e">(Bet × 2) - 0.05 SUI</Text> (house fee)
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="lg" fw={700} c="#ef4444">4.</Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                Lose: Lose your bet amount
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="lg" fw={700} c="#f97316">5.</Text>
                <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                Fair odds: <Text span fw={700} c="#38bdf8">50/50</Text> chance for each outcome
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
}
