import { useState, useEffect, useRef } from "react";
import { Card, Button, Group, Text, Title, NumberInput, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useWallet } from "../../../hooks/useWallet";
import { useSuiContract } from "../../../hooks/useSuiContract";
import { TREASURY_ADDRESS } from "../../../config/web3";
import { HORSE_ODDS } from "./horse.config";

type Horse = { id: number; name: string; multiplier: number; color: string; progress: number; speed: number };
const HORSE_COLORS = ["#ef4444", "#f97316", "#06b6d4", "#10b981", "#4b5563"];

const FallingFlags = () => {
  const [flags] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: Math.random() * 3 + 3,
    delay: Math.random() * 3,
    size: Math.random() * 20 + 20
  })));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {flags.map((f) => (
        <div key={f.id} style={{ position: "absolute", left: `${f.left}%`, top: -50, fontSize: f.size, animation: `flagFall ${f.duration}s linear infinite`, animationDelay: `${f.delay}s`, opacity: 0.9 }}>🏁</div>
      ))}
    </div>
  );
};

const TRACK_WIDTH = 900;
const TRACK_HEIGHT = 320;
const LANE_HEIGHT = 50;
const START_X = 100;
const END_X = 840;
const WAVE_AMP = 20;
const WAVE_FREQ = (Math.PI * 3) / (END_X - START_X);

const getTrackPath = (laneIndex: number) => {
  let d = `M ${START_X} ${40 + laneIndex * LANE_HEIGHT}`;
  for (let x = START_X; x <= END_X; x += 10) {
    const relX = x - START_X;
    const y = 40 + laneIndex * LANE_HEIGHT + Math.sin(relX * WAVE_FREQ) * WAVE_AMP;
    d += ` L ${x} ${y}`;
  }
  return d;
};

export default function HorseRace() {
  const { address } = useWallet();
  // Giả định hook useSuiContract có cung cấp hàm `claimWinnings` để xử lý việc trả thưởng.
  // BẠN SẼ CẦN PHẢI TỰ HIỆN THỰC LOGIC CHO HÀM NÀY TRONG HOOK useSuiContract.
  const { transferSui, getBalance, getTreasuryBalance, claimWinnings } =
    useSuiContract();

  const [bet, setBet] = useState(1);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [treasuryBalance, setTreasuryBalance] = useState<number | null>(null);

  useEffect(() => {
    const init = HORSE_ODDS.map((h, i) => ({ id: h.id, name: h.name, multiplier: h.multiplier, color: HORSE_COLORS[i % HORSE_COLORS.length], progress: 0, speed: Math.random() * 0.6 + 0.7 }));
    setHorses(init);
    fetchBalances();
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [address]);

  const fetchBalances = async () => {
    try { const b = await getBalance(); if (b) { const total = (b as any).totalBalance ?? (b as any).totalBalance; if (total != null) setWalletBalance(Number(total) / 1e9); } } catch (e) { console.warn("getBalance failed", e); }
    try { const tb = await getTreasuryBalance(); if (tb != null) setTreasuryBalance(Number(tb as any) / 1e9); } catch (e) { console.warn("getTreasuryBalance failed", e); }
  };

  const startRace = async () => {
    if (!address) return showNotification({ title: "Chưa kết nối ví", message: "Vui lòng connect wallet", color: "red" });
    if (selectedHorse === null) return showNotification({ title: "Chưa chọn ngựa", message: "Hãy chọn 1 con ngựa", color: "orange" });
    if (walletBalance !== null && bet > walletBalance) return showNotification({ title: "Số dư không đủ", message: `Số dư ${walletBalance.toFixed(4)} SUI không đủ để cược ${bet} SUI`, color: "red" });

    setRacing(true); setWinner(null);

    await transferSui(TREASURY_ADDRESS, bet, {
      onSuccess: () => {
        setCountdown(3);
        let count = 3;
        const timer = setInterval(() => {
          count -= 1;
          if (count <= 0) {
            clearInterval(timer);
            setCountdown(null);

            const duration = 15000; startRef.current = Date.now();
            setHorses((prev) => prev.map((p) => ({ ...p, progress: 0, speed: Math.random() * 0.6 + 0.7 })));
            fetchBalances();

            intervalRef.current = window.setInterval(() => {
              const now = Date.now(); const elapsed = Math.min(duration, Math.max(0, now - (startRef.current ?? now)));
              setHorses((prev) => {
                const avg = prev.reduce((s, x) => s + x.speed, 0) / prev.length;
                const next = prev.map((h) => ({ ...h, progress: Math.min(100, (elapsed / duration) * 100 * (h.speed / avg)) }));

                const handleRaceEnd = (winnerHorse: Horse) => {
                  if (intervalRef.current) { window.clearInterval(intervalRef.current); intervalRef.current = null; }
                  setWinner(winnerHorse.id);
                  setRacing(false);

                  if (winnerHorse.id === selectedHorse) {
                    const winnings = bet * winnerHorse.multiplier;
                    // THỰC HIỆN GỌI HÀM TRẢ THƯỞNG
                    claimWinnings(winnings, {
                      onSuccess: () => {
                        showNotification({ title: "🏆 Thắng!", message: `Bạn thắng ${winnings.toFixed(2)} SUI`, color: "green" });
                        fetchBalances(); // Cập nhật lại số dư ví sau khi thắng
                      },
                      onError: () => {
                        showNotification({ title: "❌ Lỗi trả thưởng", message: "Không thể nhận tiền thắng. Vui lòng thử lại.", color: "red" });
                      },
                    });
                  } else {
                    showNotification({ title: "❌ Thua", message: "Ngựa của bạn không thắng", color: "red" });
                  }
                };

                const earlyWinner = next.find((h) => h.progress >= 100);
                if (earlyWinner) {
                  handleRaceEnd(earlyWinner);
                } else if (elapsed >= duration) {
                  const finalWinner = [...next].sort((a, b) => b.progress - a.progress)[0];
                  handleRaceEnd(finalWinner);
                }

                return next;
              });
            }, 100);
          } else {
            setCountdown(count);
          }
        }, 1000);
      },
      onError: () => { setRacing(false); }
    });
  };

  return (
    <div className="race-wrapper" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <Card className="race-card" radius="lg" p="xl" mx="auto" style={{ flex: 1, maxWidth: 1000, position: 'relative' }}>
        <style>{`
          :root{--gold: 255,215,0}
          @keyframes goldBlink { 0%{box-shadow:0 0 0 0 rgba(var(--gold),0);}50%{box-shadow:0 0 22px 8px rgba(var(--gold),0.65);}100%{box-shadow:0 0 0 0 rgba(var(--gold),0);} }
          @keyframes cardPulse { 0%{box-shadow:0 0 0 0 rgba(var(--gold),0.4);border-color:rgba(var(--gold),0.4)}50%{box-shadow:0 0 25px 5px rgba(var(--gold),0.8);border-color:rgba(var(--gold),1)}100%{box-shadow:0 0 0 0 rgba(var(--gold),0.4);border-color:rgba(var(--gold),0.4)} }
          @keyframes goldTextBlink { 50% { color: gold; text-shadow: 0 0 8px rgba(255, 215, 0, 0.7); } }
          @keyframes flagFall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(360deg);opacity:0} }
          @keyframes titleGlow { 0%{text-shadow:0 0 10px rgba(255,215,0,0.5);transform:scale(1);color:#ffd700}100%{text-shadow:0 0 25px rgba(255,215,0,1),0 0 10px #fff;transform:scale(1.05);color:#fff} }
          @keyframes zoomIn { 0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1} }
          @keyframes wave { 0%,100%{transform:rotate(0deg)}25%{transform:rotate(-20deg)}75%{transform:rotate(20deg)} }
          .bet-label-blink {
            animation: goldTextBlink 1.8s infinite;
            font-weight: 700 !important;
          }
          .race-wrapper{width:100%}
          .race-card{background:linear-gradient(135deg,#2e1065 0%,#5b21b6 50%,#7c3aed 100%);box-shadow:0 20px 60px rgba(0,0,0,0.6);border-radius:16px;border:1px solid rgba(255,255,255,0.1);transition:box-shadow .2s,transform .12s;animation:cardPulse 2s infinite ease-in-out}
          .outer-bg{background:linear-gradient(180deg,#181226 0%,#241532 100%);padding:18px;border-radius:14px}
          .race-title{font-size:42px!important;font-weight:900!important;text-transform:uppercase;letter-spacing:2px;animation:titleGlow 0.8s infinite alternate}
          .selected-blink{animation:goldBlink 1.6s infinite;border-color:gold!important}
          .horse-button{display:inline-flex;align-items:center;white-space:nowrap;min-width:150px;font-weight:600}
          .track-bg{background:#0f111a;padding:16px;border-radius:12px;border:2px solid #374151;box-shadow:inset 0 0 30px rgba(0,0,0,0.8)}
          .start-checker-per{position:absolute;left:0%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;background:repeating-linear-gradient(45deg,#111 0 6px,#ddd 6px 12px);border-radius:2px;z-index:2}
          .horse-icon{position:absolute;top:-8px;transform:translateX(-50%);z-index:3;transition:left .12s linear}
          .finish-flag-svg{font-size:24px;transform-origin:bottom center}.finish-flag-svg.win{animation:wave .9s infinite}
          .help-panel{background:#16131f;color:#e6e6e9}
        `}</style>

        {countdown !== null && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", borderRadius: 16, backdropFilter: "blur(4px)" }}>
            <Text key={countdown} style={{ fontSize: 140, fontWeight: 900, color: "gold", textShadow: "0 0 50px rgba(255,215,0,0.8)", animation: "zoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)", lineHeight: 1 }}>{countdown}</Text>
            <Text size="xl" color="white" fw={700} mt="lg" style={{ letterSpacing: 4 }}>GET READY!</Text>
          </div>
        )}

        {winner !== null && (
          <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(11, 12, 22, 0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 16, backdropFilter: "blur(10px)" }}>
            <Title order={2} style={{ color: "#fbbf24", textTransform: "uppercase", marginBottom: 24, textShadow: "0 0 25px rgba(251, 191, 36, 0.6)", letterSpacing: 2 }}>🏆 Race Results</Title>
            
            <div style={{ width: "85%", maxWidth: 480, background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              {[...horses].sort((a, b) => b.progress - a.progress).map((h, index) => (
                <Group key={h.id} justify="space-between" style={{ padding: "10px 16px", marginBottom: 8, background: h.id === selectedHorse ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.02)", borderRadius: 8, border: h.id === selectedHorse ? "1px solid rgba(255,215,0,0.3)" : "1px solid transparent" }}>
                  <Group gap="sm">
                    <Text fw={800} size="lg" color={index === 0 ? "yellow" : index === 1 ? "gray.4" : index === 2 ? "orange.8" : "dimmed"} style={{ width: 24 }}>#{index + 1}</Text>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: h.color, boxShadow: `0 0 8px ${h.color}` }} />
                    <Text fw={600} color="white">{h.name}</Text>
                    {h.id === selectedHorse && <Text size="xs" color="yellow" fw={700} style={{ textTransform: "uppercase", letterSpacing: 1 }}>(You)</Text>}
                  </Group>
                  <Text fw={700} color={index === 0 ? "yellow" : "dimmed"}>{h.multiplier}x</Text>
                </Group>
              ))}
            </div>

            <div style={{ marginTop: 32, textAlign: "center" }}>
              <Text size="xl" fw={800} color={winner === selectedHorse ? "green.4" : "red.4"} style={{ marginBottom: 16, textShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
                {winner === selectedHorse ? `🎉 YOU WON ${(bet * (horses.find(h => h.id === selectedHorse)?.multiplier || 0)).toFixed(2)} SUI!` : "😅 BETTER LUCK NEXT TIME"}
              </Text>
              <Button color="gray" variant="outline" size="lg" onClick={() => setWinner(null)} style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", padding: "0 40px" }}>
                CLOSE
              </Button>
            </div>
          </div>
        )}

        <Group justify="space-between" align="center" mb="sm">
          <Title order={1} className="race-title">🐎 Horse Race</Title>
          <Stack gap={2} align="flex-end" style={{ minWidth: 280 }}>
            <Group justify="space-between" style={{ width: '100%' }}>
              <Text size="sm" fw={700}>Ví:</Text>
              <Text size="sm" fw={700} c="yellow">{walletBalance != null ? `${walletBalance.toFixed(4)} SUI` : (address ? '...' : 'Chưa kết nối')}</Text>
            </Group>
            <Text size="xs" color="dimmed" style={{ fontFamily: 'monospace', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{address}</Text>
            <Group justify="space-between" mt="xs" style={{ width: '100%' }}>
              <Text size="sm" fw={700}>Kho:</Text>
              <Text size="sm" fw={700} c="yellow">{treasuryBalance != null ? `${treasuryBalance.toFixed(4)} SUI` : "—"}</Text>
            </Group>
            <Text size="xs" color="dimmed" style={{ fontFamily: 'monospace', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{TREASURY_ADDRESS}</Text>
          </Stack>
        </Group>

        <NumberInput label="Bet (SUI)" value={bet} onChange={(v) => setBet(Number(v))} min={0.1} step={0.1} mt="md" classNames={{ label: 'bet-label-blink' }} />

        <Group mt="md" style={{ flexWrap: "wrap" }} gap="sm">
          {horses.map((h) => (
            <Button key={h.id} className={`horse-button ${selectedHorse === h.id ? "selected-blink" : ""}`} variant={selectedHorse === h.id ? "filled" : "outline"} onClick={() => setSelectedHorse(h.id)}>
              <span style={{ color: h.color, marginRight: 6 }}>●</span>
              {h.name} (x{h.multiplier})
            </Button>
          ))}
        </Group>

        <Button fullWidth mt="lg" size="xl" color="yellow" style={{ color: '#4c1d95', fontWeight: 800, fontSize: 24, boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }} loading={racing} disabled={selectedHorse === null} onClick={startRace}>🏁 START RACE</Button>

        <div style={{ marginTop: 18 }}>
          <Text fw={500}>🏇 Track</Text>
          <div className="track-bg outer-bg" style={{ position: "relative", marginTop: 12, overflow: "hidden" }}>
            <svg viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`} style={{ width: "100%", height: "auto", minHeight: 300 }}>
              {/* Finish Line */}
              <line x1={END_X} y1={20} x2={END_X} y2={TRACK_HEIGHT - 20} stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeDasharray="8 4" />
              <text x={END_X - 12} y={30} className={`finish-flag-svg ${winner != null ? 'win' : ''}`}>🏁</text>

              {horses.map((h, i) => {
                const pathD = getTrackPath(i);
                const currentX = START_X + (h.progress / 100) * (END_X - START_X);
                const relX = currentX - START_X;
                const y = 40 + i * LANE_HEIGHT + Math.sin(relX * WAVE_FREQ) * WAVE_AMP;
                const slope = Math.cos(relX * WAVE_FREQ) * WAVE_AMP * WAVE_FREQ;
                const angle = Math.atan(slope) * (180 / Math.PI);

                return (
                  <g key={h.id}>
                    <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                    <text x={5} y={40 + i * LANE_HEIGHT + 5} fill={h.color} fontSize="12" fontWeight="bold" style={{ textShadow: "0 0 4px black" }}>{h.name}</text>
                    <g transform={`translate(${currentX}, ${y})`}>
                      <g transform={`rotate(${angle})`}>
                        <text x={-12} y={8} fontSize="24" style={{ transform: "scaleX(-1)", display: "block" }}>🏇</text>
                      </g>
                      <text x={-10} y={-15} fill="white" fontSize="10" fontWeight="bold">{Math.floor(h.progress)}%</text>
                      {winner === h.id && <text x={10} y={0} fontSize="16">🏆</text>}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </Card>

      <aside className="help-panel">
        <Title order={5}>Hướng dẫn chơi</Title>
        <Text size="sm" mt="xs">- Chọn 1 ngựa (Thunder, Blaze, Storm, Windy, Shadow)</Text>
        <Text size="sm">- Nhập số SUI bạn muốn đặt cược ở ô Bet</Text>
        <Text size="sm">- Nhấn "Start Race" để bắt đầu. Trò chơi chạy trong 15 giây.</Text>
        <Text size="sm">- Nếu thắng, bạn sẽ nhận được: Tiền cược x Hệ số (Multiplier) của ngựa.</Text>
        <Text size="sm" mt="xs">- Số dư ví của bạn và số dư kho (Treasury) hiển thị bên trên.</Text>
      </aside>
      {winner !== null && <FallingFlags />}
    </div>
  );
}
