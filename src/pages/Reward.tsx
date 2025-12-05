import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Trophy, Clock, Sparkles, TrendingUp, Award, CheckCircle, Star, Zap } from "lucide-react";

// Khóa lưu trữ Local Storage chỉ dành cho các trạng thái nội bộ của Rewards Page (Total Claimed, Milestones)
const STORAGE_KEY = "game_airdrop_v1_rewards";

// Ngưỡng tối thiểu để claim
const MIN_AP_TO_CLAIM = 10; 

// ====================================================================
// --- REWARDS PAGE COMPONENT (Sử dụng props để nối điểm Game) ---
// ====================================================================

/**
 * @param {number} currentAirdropPoints - Điểm AP hiện tại có thể claim (Nối từ state game)
 * @param {number} currentGamePoints - Điểm GP/Coins hiện tại (Nối từ state game)
 * @param {function} onClaimSuccess - Callback để trừ điểm AP trong state game khi claim thành công
 * @param {function} onTestAddPoints - Callback để thêm điểm GP/Coins trong state game khi test
 */
export default function RewardsPage({ 
  currentAirdropPoints = 0, 
  currentGamePoints = 0,    
  onClaimSuccess,           
  onTestAddPoints           
}) {
  
  // States nội bộ (Chỉ lưu các thông tin thuộc về Rewards Page, không phải Game State)
  const [totalClaimedAirdropPoints, setTotalClaimedAirdropPoints] = useState(0); 
  const [claimHistory, setClaimHistory] = useState([]);
  const [milestones, setMilestones] = useState([
    { id: 1, points: 1000, reward: "🚀 Airdrop Rank I", claimed: false },
    { id: 2, points: 5000, reward: "⭐ Airdrop Rank II", claimed: false },
    { id: 3, points: 10000, reward: "👑 Airdrop Rank III", claimed: false },
    { id: 4, points: 25000, reward: "🔥 Legendary Airdrop", claimed: false },
  ]);
  
  const [particles, setParticles] = useState([]);
  const [notification, setNotification] = useState(null);

  // --- Load/Save Logic ---
  
  // Load totalClaimed và milestones từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTotalClaimedAirdropPoints(data.totalClaimedAirdropPoints || 0);
        setClaimHistory(data.claimHistory || []);
        setMilestones(data.milestones || milestones);
      }
    } catch (e) { console.error("Could not load state:", e); }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      totalClaimedAirdropPoints,
      claimHistory,
      milestones,
    }));
  }, [totalClaimedAirdropPoints, claimHistory, milestones]);

  // --- Notification & Particles ---

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(3000));
  };

  const spawnParticles = (count = 20) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight / 2,
      emoji: ["✨", "💎", "🎁", "⭐", "🌟"][Math.floor(Math.random() * 5)],
      angle: (360 / count) * i,
    }));
    setParticles(p => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles(p => p.filter(pp => !newParticles.find(np => np.id === pp.id)));
    }, 2000);
  };
  
  // --- Claim Logic (Giao tiếp với Game qua callback) ---

  const handleClaim = () => {
    const amountAP = currentAirdropPoints; // Lấy điểm AP từ Prop (tức là state game)

    if (amountAP < MIN_AP_TO_CLAIM) {
      return notify(`Cần tối thiểu ${MIN_AP_TO_CLAIM} AP để claim.`, "warning");
    }
    
    // 1. Cập nhật Total Claimed AP (State nội bộ)
    setTotalClaimedAirdropPoints(t => t + amountAP);
    
    // 2. Lưu lịch sử
    setClaimHistory(h => [
      { time: new Date().toLocaleString("vi-VN"), amount: amountAP, id: Date.now() },
      ...h.slice(0, 9)
    ]);

    // 3. Kiểm tra Milestones
    setMilestones(prev => prev.map(m => {
      if (!m.claimed && totalClaimedAirdropPoints + amountAP >= m.points) {
        notify(`🎉 Đạt mốc ${m.points} AP! Nhận ${m.reward}`, "success");
        return { ...m, claimed: true };
      }
      return m;
    }));

    spawnParticles(30);
    notify(`✅ Claim thành công ${amountAP} AP!`, "success");

    // 4. GỌI CALLBACK để component Game trừ điểm AP đã claim
    if (onClaimSuccess) {
        onClaimSuccess(amountAP); 
    }
  };

  // Hàm thêm điểm TEST - Gọi Callback để Game Component cập nhật điểm
  const addTestPoints = () => {
    const testGP = 500;
    if (onTestAddPoints) {
        onTestAddPoints(testGP); // GỌI CALLBACK
    } else {
        notify("Không thể thêm điểm test, thiếu hàm callback.", "warning");
    }
  };
  
  // --- Render ---

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background & Particles & Notification (Giữ nguyên) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.2), transparent 50%), radial-gradient(circle at 70% 80%, rgba(59,130,246,0.15), transparent 50%)',
        pointerEvents: 'none',
      }} />

      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{
              x: p.x + Math.cos(p.angle * Math.PI / 180) * 200,
              y: p.y + Math.sin(p.angle * Math.PI / 180) * 200 - 100,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: 'fixed',
              fontSize: 32,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 999,
              background: notification.type === 'warning' ? '#f59e0b' : notification.type === 'info' ? '#6366f1' : '#10b981',
              color: 'white',
              padding: '16px 24px',
              borderRadius: 16,
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              minWidth: 250,
            }}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '28px',
            marginBottom: 28,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                🎁 Airdrop Central ⚡
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: '6px 0 0' }}>
                View your earned AP and unlock exclusive milestones.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StatBadge icon={<Trophy size={18} />} label="Total AP Claimed" value={totalClaimedAirdropPoints} color="#10b981" />
              <StatBadge icon={<Zap size={18} />} label="Current GP" value={currentGamePoints} color="#8b5cf6" />
            </div>
          </div>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {/* Claim Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ fontSize: 80, marginBottom: 16 }}
                >
                  ✨
                </motion.div>
                <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                  Airdrop Points Ready
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Current conversion rate: **1 AP** per **10 GP**
                </p>
              </div>

              {/* CLAIMABLE AIRDROP POINTS (AP) */}
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: 20,
                padding: '32px',
                marginBottom: 16,
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 8, fontWeight: 600 }}>
                  CLAIMABLE AIRDROP POINTS (AP)
                </div>
                <motion.div
                  key={currentAirdropPoints}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ color: 'white', fontSize: 48, fontWeight: 800 }}
                >
                  {currentAirdropPoints}
                </motion.div>
              </div>
              
              {/* YOUR GAME POINTS (GP) */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '16px',
                marginBottom: 24,
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>
                  YOUR GAME POINTS (GP)
                </div>
                <div style={{ color: '#8b5cf6', fontSize: 24, fontWeight: 700 }}>
                  {currentGamePoints}
                </div>
              </div>

              <ClaimButton onClick={handleClaim} disabled={currentAirdropPoints < MIN_AP_TO_CLAIM}>
                <Gift size={20} />
                {currentAirdropPoints < MIN_AP_TO_CLAIM ? `Need ${MIN_AP_TO_CLAIM} AP to Claim` : `Claim ${currentAirdropPoints} AP`}
              </ClaimButton>

              <button
                onClick={addTestPoints}
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                + Add 500 GP (Test)
              </button>
            </Card>
          </motion.div>

          {/* Stats & Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={24} />
                Airdrop Milestones
              </h3>

              <div style={{ display: 'grid', gap: 16 }}>
                {milestones.map((milestone, idx) => {
                  const progress = Math.min(100, (totalClaimedAirdropPoints / milestone.points) * 100);
                  const isCompleted = milestone.claimed;

                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)'
                          : 'rgba(255,255,255,0.05)',
                        borderRadius: 16,
                        padding: 16,
                        border: isCompleted
                          ? '2px solid #10b981'
                          : '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {isCompleted && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                        }}>
                          <CheckCircle size={24} color="#10b981" />
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 32 }}>
                          {milestone.reward.split(' ')[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
                            {milestone.reward.split(' ').slice(1).join(' ')}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                            {totalClaimedAirdropPoints}/{milestone.points} AP
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: '100%',
                        height: 8,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{
                            height: '100%',
                            background: isCompleted
                              ? 'linear-gradient(90deg, #10b981, #059669)'
                              : 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Claim History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ gridColumn: 'span 1' }}
          >
            <Card>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={24} />
                Claim History (AP)
              </h3>

              {claimHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📜</div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    No claims yet. Play the game to earn AP!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                  <AnimatePresence>
                    {claimHistory.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 12,
                          padding: 16,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                          }}>
                            ✅
                          </div>
                          <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
                              +{item.amount} AP Claimed
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                              {item.time}
                            </div>
                          </div>
                        </div>
                        <Star size={20} color="#fbbf24" fill="#fbbf24" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={24} />
                Airdrop Statistics
              </h3>

              <div style={{ display: 'grid', gap: 16 }}>
                <StatRow
                  icon="🎯"
                  label="Total AP Claimed"
                  value={`${totalClaimedAirdropPoints} AP`}
                  color="#10b981"
                />
                <StatRow
                  icon="📦"
                  label="Claimable AP"
                  value={`${currentAirdropPoints} AP`}
                  color="#f59e0b"
                />
                <StatRow
                  icon="⚡"
                  label="Total Game Points"
                  value={`${currentGamePoints} GP`}
                  color="#8b5cf6"
                />
                <StatRow
                  icon="📊"
                  label="Total Claims"
                  value={claimHistory.length}
                  color="#6366f1"
                />
                <StatRow
                  icon="🏆"
                  label="Badges Earned"
                  value={milestones.filter(m => m.claimed).length}
                  color="#8b5cf6"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ============================= HELPER COMPONENTS ============================= */
// (Giữ nguyên các component phụ trợ để code RewardsPage sạch hơn)

const Card = ({ children }) => (
  <div style={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 28,
    border: '1px solid rgba(255,255,255,0.1)',
    height: '100%',
  }}>
    {children}
  </div>
);

const StatBadge = ({ icon, label, value, color }) => (
  <div style={{
    background: color,
    padding: '12px 20px',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: `0 4px 16px ${color}40`,
  }}>
    {icon}
    <div>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>
        {value}
      </div>
    </div>
  </div>
);

const ClaimButton = ({ children, onClick, disabled }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.03 }}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '100%',
      padding: '18px',
      background: disabled
        ? 'rgba(255,255,255,0.1)'
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: 16,
      color: 'white',
      fontSize: 16,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      boxShadow: disabled ? 'none' : '0 8px 24px rgba(16,185,129,0.4)',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {children}
  </motion.button>
);

const StatRow = ({ icon, label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
        {label}
      </div>
    </div>
    <div style={{ color: color, fontWeight: 700, fontSize: 18 }}>
      {value}
    </div>
  </div>
);