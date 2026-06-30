import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './CompletePage.css'

function formatTime(ms) {
  if (!ms) return '00:00'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function CompletePage({ gameState, onRestart }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const totalScore = (gameState.round1Score || 0) + (gameState.round2Score || 0) + (gameState.round3Score || 0)
  const accuracy   = Math.min(100, Math.round(totalScore / 3))
  const elapsed    = gameState.round3Time && gameState.startTime ? gameState.round3Time - gameState.startTime : null

  useEffect(() => {
    setShowConfetti(true)
    const t = setTimeout(() => setShowConfetti(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const scoreColor = (s) => s >= 80 ? '#2ecc71' : s >= 60 ? 'var(--color-gold)' : 'var(--color-ember)'

  return (
    <div className="complete-root">
      {/* Ambient background glow */}
      <div className="complete-bg-glow" />

      {/* Confetti rain */}
      {showConfetti && (
        <div className="confetti-layer">
          {Array.from({ length: 55 }, (_, i) => (
            <motion.div
              key={i}
              className="confetti-particle"
              style={{
                left:       `${Math.random() * 100}%`,
                width:      `${4 + Math.random() * 8}px`,
                height:     `${4 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#f0c040','#c17f2a','#2ecc71','#3498db','#e85a1e','#fff8e0','#9b59b6'][i % 7],
              }}
              initial={{ y: -20, opacity: 1, x: 0 }}
              animate={{ y: window.innerHeight + 30, opacity: [1, 1, 0], x: (Math.random() - 0.5) * 200, rotate: Math.random() * 720 }}
              transition={{ duration: 2.5 + Math.random() * 3.5, delay: Math.random() * 2.5, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      <div className="complete-content">

        {/* ── HEADER ── */}
        <motion.div
          className="complete-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <div className="complete-trophy">🏆</div>

          <motion.h1
            className="complete-title font-display"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 130 }}
          >
            ESCAPE COMPLETED!
          </motion.h1>

          <motion.p
            className="complete-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            You have proven your wit and courage, adventurer.
          </motion.p>
        </motion.div>

        {/* ── MAIN CARD ── */}
        <motion.div
          className="complete-card"
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.65, ease: 'easeOut' }}
        >

          {/* Stats grid — 3 columns */}
          <div className="complete-score-grid">
            {[
              { label: 'Time Taken',   value: formatTime(elapsed),  icon: '⏱️' },
              { label: 'Total Score',  value: totalScore,            icon: '⭐' },
              { label: 'Accuracy',     value: `${accuracy}%`,       icon: '🎯' },
              { label: 'Submissions',  value: gameState.totalSubmissions || 0, icon: '🔄' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="complete-score-item"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.1 }}
              >
                <span className="cs-icon">{item.icon}</span>
                <span className="cs-label">{item.label}</span>
                <span className="cs-value" style={{ color: item.color || 'var(--color-gold)' }}>
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="divider-ornate"><span>◆</span></div>

          {/* Round breakdown */}
          <div className="complete-rounds">
            {[
              { round: 'Round 1', label: 'Key Generation',  icon: '🗝️', score: gameState.round1Score },
              { round: 'Round 2', label: 'Armory Assault',  icon: '⚔️', score: gameState.round2Score },
              { round: 'Round 3', label: 'Escape Route',    icon: '🚪', score: gameState.round3Score },
            ].map((r, i) => (
              <motion.div
                key={r.round}
                className="complete-round-row"
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.72 + i * 0.12 }}
              >
                <span className="crr-icon">{r.icon}</span>

                <div className="crr-info">
                  <div className="crr-round-label font-heading">{r.round}</div>
                  <div className="crr-round-name">{r.label}</div>
                </div>

                <div className="crr-score-block">
                  <div className="crr-score-val" style={{ color: scoreColor(r.score || 0) }}>
                    {r.score ?? '—'}/100
                  </div>
                  <div className="crr-bar-wrap">
                    <motion.div
                      className="crr-bar-fill"
                      style={{
                        background: r.score >= 80
                          ? 'linear-gradient(90deg,#1a7a40,#2ecc71)'
                          : r.score >= 60
                            ? 'linear-gradient(90deg,#7a4a0a,#c17f2a)'
                            : 'linear-gradient(90deg,#7a1a1a,#e85a1e)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${r.score || 0}%` }}
                      transition={{ duration: 1.1, ease: 'easeOut', delay: 0.85 + i * 0.12 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>

        {/* ── ACTIONS ── */}
        <motion.div
          className="complete-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
        >
          <motion.button
            className="btn btn-secondary"
            onClick={() => {}}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            🏆 View Leaderboard
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={onRestart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            ⚡ Play Again
          </motion.button>
        </motion.div>

        <motion.p
          className="complete-footer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
        >
          Until Next Time, Adventurer.
        </motion.p>

      </div>
    </div>
  )
}
