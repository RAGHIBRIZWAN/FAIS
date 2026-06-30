import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage.jsx'
import Round1Page from './pages/Round1Page.jsx'
import Round2Page from './pages/Round2Page.jsx'
import Round3Page from './pages/Round3Page.jsx'
import CompletePage from './pages/CompletePage.jsx'

const pageVariants = {
  initial: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.4, ease: 'easeIn' } },
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [gameState, setGameState] = useState({
    playerHealth: 100,
    score: 0,
    round1Score: null,
    round2Score: null,
    round3Score: null,
    startTime: null,
    round1Time: null,
    round2Time: null,
    round3Time: null,
    totalSubmissions: 0,
  })

  const navigate = (page, updates = {}) => {
    setGameState(prev => ({ ...prev, ...updates }))
    setCurrentPage(page)
  }

  return (
    <div style={{ height: '100vh', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient particles */}
      <ParticleLayer />

      <AnimatePresence mode="wait">
        {currentPage === 'landing' && (
          <motion.div key="landing" {...pageVariants}>
            <LandingPage onStart={() => navigate('round1', { startTime: Date.now() })} />
          </motion.div>
        )}
        {currentPage === 'round1' && (
          <motion.div key="round1" {...pageVariants}>
            <Round1Page
              gameState={gameState}
              onComplete={(score) => navigate('round2', { round1Score: score, score: gameState.score + score, round1Time: Date.now() })}
              onTimeUp={(score) => navigate('complete', { round1Score: score, score: gameState.score + score, round1Time: Date.now() })}
              onSubmission={() => setGameState(prev => ({ ...prev, totalSubmissions: prev.totalSubmissions + 1 }))}
            />
          </motion.div>
        )}
        {currentPage === 'round2' && (
          <motion.div key="round2" {...pageVariants}>
            <Round2Page
              gameState={gameState}
              onComplete={(score) => navigate('round3', { round2Score: score, score: gameState.score + score, round2Time: Date.now() })}
              onTimeUp={(score) => navigate('complete', { round2Score: score, score: gameState.score + score, round2Time: Date.now() })}
              onHealthChange={(delta) => setGameState(prev => ({ ...prev, playerHealth: Math.max(0, prev.playerHealth + delta) }))}
              onSubmission={() => setGameState(prev => ({ ...prev, totalSubmissions: prev.totalSubmissions + 1 }))}
            />
          </motion.div>
        )}
        {currentPage === 'round3' && (
          <motion.div key="round3" {...pageVariants}>
            <Round3Page
              gameState={gameState}
              onComplete={(score) => navigate('complete', { round3Score: score, score: gameState.score + score, round3Time: Date.now() })}
              onTimeUp={(score) => navigate('complete', { round3Score: score, score: gameState.score + score, round3Time: Date.now() })}
              onSubmission={() => setGameState(prev => ({ ...prev, totalSubmissions: prev.totalSubmissions + 1 }))}
            />
          </motion.div>
        )}
        {currentPage === 'complete' && (
          <motion.div key="complete" {...pageVariants}>
            <CompletePage
              gameState={gameState}
              onRestart={() => {
                setGameState({ playerHealth: 100, score: 0, round1Score: null, round2Score: null, round3Score: null, startTime: null, totalSubmissions: 0 })
                setCurrentPage('landing')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ParticleLayer() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    size: 1 + Math.random() * 2,
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'rgba(212,160,23,0.6)',
            boxShadow: '0 0 4px rgba(212,160,23,0.8)',
          }}
          animate={{ y: [0, -window.innerHeight - 20], opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
