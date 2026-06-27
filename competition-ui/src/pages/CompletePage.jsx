import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './CompletePage.css'

function formatTime(ms) {
  if (!ms) return '00:00'
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function getRank(score) {
  if (score >= 270) return { rank: '#1', label: 'LEGENDARY', color: '#f0c040' }
  if (score >= 240) return { rank: '#2', label: 'EXPERT', color: '#c0c0c0' }
  if (score >= 200) return { rank: '#3', label: 'VETERAN', color: '#cd7f32' }
  if (score >= 150) return { rank: '#4', label: 'WARRIOR', color: '#3498db' }
  return { rank: '#5+', label: 'RECRUIT', color: 'var(--color-text-dim)' }
}

export default function CompletePage({ gameState, onRestart }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const totalScore = (gameState.round1Score || 0) + (gameState.round2Score || 0) + (gameState.round3Score || 0)
  const accuracy = Math.round(totalScore / 3)
  const elapsed = gameState.round3Time && gameState.startTime ? gameState.round3Time - gameState.startTime : null
  const rankData = getRank(totalScore)

  useEffect(() => {
    setShowConfetti(true)
    const t = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="complete-root">
      {/* Background glow */}
      <div className="complete-bg-glow" />

      {/* Confetti particles */}
      {showConfetti && (
        <div className="confetti-layer">
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#f0c040', '#c17f2a', '#2ecc71', '#3498db', '#e85a1e'][i % 5],
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{ y: window.innerHeight + 20, opacity: 0, rotate: Math.random() * 720 }}
              transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 2, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      <div className="complete-content">
        {/* Header */}
        <motion.div
          className="complete-header"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="complete-trophy"
            animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🏆
          </motion.div>

          <motion.h1
            className="complete-title font-display"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
          >
            ESCAPE COMPLETED!
          </motion.h1>

          <motion.p
            className="complete-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            You have proven your wit and courage, adventurer.
          </motion.p>
        </motion.div>

        {/* Main score card */}
        <motion.div
          className="complete-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Score grid */}
          <div className="complete-score-grid">
            {[
              { label: 'Time Taken', value: formatTime(elapsed), icon: '⏱️' },
              { label: 'Total Score', value: totalScore, icon: '⭐' },
              { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
              { label: 'Rank', value: rankData.rank, icon: '🏅', color: rankData.color },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="complete-score-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
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
              { round: 'Round 1', label: 'Key Generation', icon: '🗝️', score: gameState.round1Score },
              { round: 'Round 2', label: 'Armory Assault', icon: '⚔️', score: gameState.round2Score },
              { round: 'Round 3', label: 'Escape Route', icon: '🚪', score: gameState.round3Score },
            ].map((r, i) => (
              <motion.div
                key={r.round}
                className="complete-round-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <span style={{ fontSize: '1.2rem' }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--color-text-dim)' }}>
                    {r.round}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>{r.label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: r.score >= 80 ? '#2ecc71' : r.score >= 60 ? 'var(--color-gold)' : 'var(--color-ember)',
                  }}>
                    {r.score ?? '—'}/100
                  </div>
                  <div className="progress-bar" style={{ width: 80, marginTop: 4 }}>
                    <motion.div
                      className="progress-fill"
                      style={{ background: 'linear-gradient(90deg,#1a8c4a,#2ecc71)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${r.score || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.8 + i * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="divider-ornate"><span>◆</span></div>

          {/* Rank badge */}
          <motion.div
            className="complete-rank-badge"
            style={{ borderColor: rankData.color + '66' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          >
            <div className="rank-shield">🛡️</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--color-text-muted)' }}>
                YOUR RANK
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: rankData.color, fontWeight: 900 }}>
                {rankData.rank}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: rankData.color, letterSpacing: '0.15em' }}>
                {rankData.label}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="complete-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.button
            className="btn btn-secondary"
            onClick={() => {}}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            🏆 View Leaderboard
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={onRestart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ⚡ Play Again
          </motion.button>
        </motion.div>

        <motion.p
          style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', marginTop: 16, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          Until Next Time, Adventurer.
        </motion.p>
      </div>
    </div>
  )
}
