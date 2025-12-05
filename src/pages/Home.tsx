import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import game from "../assets/game.png";

/* ===========================================================
   THEME SYSTEM
=========================================================== */
const useTheme = () => {
  const [isDark, setIsDark] = useState(true);
  
  const toggle = () => setIsDark(!isDark);
  
  return { isDark, toggle };
};

const getColors = (isDark) => ({
  bg: isDark ? 'linear-gradient(135deg, #0a0e27 0%, #16213e 100%)' : 'linear-gradient(135deg, #e8f0ff 0%, #f5f9ff 100%)',
  text: isDark ? '#ffffff' : '#1a1a2e',
  textSec: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(26,26,46,0.7)',
  card: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
  border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,100,255,0.2)',
  aurora1: isDark ? 'rgba(0,220,255,0.25)' : 'rgba(100,180,255,0.2)',
  aurora2: isDark ? 'rgba(200,0,255,0.2)' : 'rgba(150,100,255,0.15)',
});

/* ===========================================================
   ANIMATED BACKGROUNDS
=========================================================== */
const Nebula = ({ isDark }) => {
  const [nebulas, setNebulas] = useState([]);
  
  useEffect(() => {
    setNebulas(Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.4 + Math.random() * 0.4,
      delay: i * 3,
    })));
  }, []);

  return (
    <>
      {nebulas.map((n, i) => (
        <motion.div
          key={i}
          className="nebula"
          style={{
            position: 'fixed',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(100,200,255,0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(200,100,255,0.3) 0%, transparent 70%)',
            left: `${n.x}%`,
            top: `${n.y}%`,
            filter: 'blur(70px)',
            zIndex: -10,
            opacity: isDark ? 0.7 : 0.4,
            transform: `scale(${n.scale})`,
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 40, 0],
            scale: [n.scale, n.scale * 1.4, n.scale * 0.8, n.scale],
          }}
          transition={{
            duration: 18 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: n.delay,
          }}
        />
      ))}
    </>
  );
};

const Aurora = ({ colors }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: -12,
    background: `linear-gradient(125deg, ${colors.aurora1}, ${colors.aurora2})`,
    filter: 'blur(120px)',
    opacity: 0.5,
  }} />
);

const Stars = ({ isDark }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: isDark 
      ? 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 75%, white, transparent)'
      : 'radial-gradient(1px 1px at 20% 30%, rgba(100,100,200,0.5), transparent), radial-gradient(1px 1px at 60% 70%, rgba(100,100,200,0.5), transparent)',
    backgroundSize: '200% 200%',
    opacity: isDark ? 0.5 : 0.2,
    zIndex: -11,
  }} />
);

const FloatingPlanet = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        right: '8%',
        top: '18%',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #4dd0e1, #0097a7)',
        boxShadow: '0 0 60px rgba(0,200,255,0.5), inset -20px -20px 40px rgba(0,0,0,0.3)',
        zIndex: 0,
        y,
      }}
      animate={{
        rotate: 360,
        scale: [1, 1.08, 1],
      }}
      transition={{
        rotate: { duration: 80, repeat: Infinity, ease: 'linear' },
        scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          top: '15%',
          left: '20%',
          filter: 'blur(4px)',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          bottom: '25%',
          right: '30%',
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
  );
};

/* ===========================================================
   MAIN COMPONENT
=========================================================== */
export default function Home() {
  const { isDark, toggle } = useTheme();
  const colors = getColors(isDark);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 120]);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: colors.bg,
      overflow: 'hidden',
    }}>
      <Nebula isDark={isDark} />
      <Aurora colors={colors} />
      <Stars isDark={isDark} />
      <FloatingPlanet />

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        style={{
          position: 'fixed',
          top: 70,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: colors.card,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? <Sun size={24} color="#ffd700" /> : <Moon size={24} color="#4a5568" />}
      </motion.button>

      {/* Hero Section */}
      <motion.div style={{ y: heroY }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '120px 24px 80px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            style={{ maxWidth: 680, zIndex: 2 }}
          >
            <h1 style={{
              fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
              fontWeight: 900,
              color: colors.text,
              lineHeight: 1.12,
              marginBottom: 24,
              textShadow: isDark ? '0 0 40px rgba(0,200,255,0.5)' : '0 4px 24px rgba(0,100,255,0.25)',
            }}>
              Step Into the Future of Web3 Airdrop Experience
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: colors.textSec,
              lineHeight: 1.75,
              marginBottom: 36,
            }}>
              Play – Earn – Claim. Join the most anticipated 2025 airdrop built on next-gen blockchain interactivity.
            </p>

            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 35px rgba(0,150,255,0.7)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '18px 48px',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(90deg, #00e1ff, #0a6cff, #0088ff)',
                border: 'none',
                borderRadius: 16,
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0,150,255,0.6)',
              }}
            >
              Start Adventure
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Game Preview */}
      <Section colors={colors} title="Explore the Game World" subtitle="Raise plants – earn rewards – unlock rare NFTs">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Card colors={colors}>
            <div style={{
              width: '100%',
              height: 400,
              background: `url(${game}) center/cover no-repeat`,
              borderRadius: 16,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}>
              {/* Game Preview */}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(90deg, #00f0ff, #0066ff)',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,200,255,0.4)',
              }}
            >
              Play Now
            </motion.button>
          </Card>
        </motion.div>
      </Section>

      {/* Lootbox System */}
      <Section colors={colors} title="Lootbox System">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {[
            { name: 'Common', color: '#bbbbbb', chance: '60%' },
            { name: 'Rare', color: '#4da6ff', chance: '25%' },
            { name: 'Epic', color: '#bd59ff', chance: '10%' },
            { name: 'Legendary', color: '#ffb300', chance: '5%' },
          ].map((box, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <Card colors={colors} hover>
                <h3 style={{ color: box.color, fontSize: '1.5rem', marginBottom: 12 }}>
                  {box.name}
                </h3>
                <p style={{ color: colors.textSec }}>Chance: {box.chance}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Airdrop Progress */}
      <Section colors={colors} title="Early Access Airdrop Progress">
        <Card colors={colors}>
          <h4 style={{ color: colors.text, fontSize: '1.3rem', marginBottom: 16, fontWeight: 600 }}>
            Phase 1 — Player Registration
          </h4>
          <div style={{
            width: '100%',
            height: 14,
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderRadius: 20,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '72%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00d4ff, #0088ff)',
                borderRadius: 20,
              }}
            />
          </div>
          <p style={{ color: colors.textSec, marginTop: 12 }}>72% Completed</p>
        </Card>
      </Section>

      {/* Roadmap */}
      <Section colors={colors} title="Roadmap 2025">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {[
            { q: 'Q1', text: 'Game Alpha Release' },
            { q: 'Q2', text: 'Lootbox NFT Integration' },
            { q: 'Q3', text: 'Token Launch + Airdrop' },
            { q: 'Q4', text: 'DAO Expansion & Marketplace' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card colors={colors} hover>
                <h3 style={{ color: colors.text, fontSize: '2rem', marginBottom: 12 }}>
                  {item.q}
                </h3>
                <p style={{ color: colors.textSec }}>{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: colors.textSec,
        borderTop: `1px solid ${colors.border}`,
        backdropFilter: 'blur(10px)',
      }}>
        © 2025 The Invincible — Web3 Gaming Revolution
      </div>
    </div>
  );
}

/* ===========================================================
   REUSABLE COMPONENTS
=========================================================== */
const Section = ({ children, colors, title, subtitle }) => (
  <div style={{
    maxWidth: 1200,
    margin: '0 auto',
    padding: '100px 24px',
  }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 style={{
        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
        fontWeight: 800,
        color: colors.text,
        textAlign: 'center',
        marginBottom: subtitle ? 12 : 48,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          textAlign: 'center',
          color: colors.textSec,
          fontSize: '1.1rem',
          marginBottom: 48,
        }}>
          {subtitle}
        </p>
      )}
    </motion.div>
    {children}
  </div>
);

const Card = ({ children, colors, hover }) => (
  <motion.div
    whileHover={hover ? { y: -8, scale: 1.03 } : {}}
    style={{
      background: colors.card,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${colors.border}`,
      borderRadius: 24,
      padding: 32,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    }}
  >
    {children}
  </motion.div>
);