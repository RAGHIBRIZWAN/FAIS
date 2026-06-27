import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './LandingPage.css'

export default function LandingPage({ onStart }) {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="lp-root">
      {/* ── Background image + overlays ── */}
      <div className="lp-bg" />
      <div className="lp-vignette-top" />
      <div className="lp-vignette-bottom" />
      <div className="lp-vignette-sides" />

      {/* ── Stone arch overlay ── */}
      <div className="lp-arch" />

      {/* ── Left Torch ── */}
      <div className="lp-torch lp-torch-left">
        <TorchFlame delay={0} />
      </div>

      {/* ── Right Torch ── */}
      <div className="lp-torch lp-torch-right">
        <TorchFlame delay={0.4} />
      </div>

      {/* ── Torch light pools on ground ── */}
      <div className="lp-light-left" />
      <div className="lp-light-right" />

      {/* ── Central glow from corridor ── */}
      <div className="lp-center-glow" />

      {/* ── Content ── */}
      <div className={`lp-content ${loaded ? 'lp-content--visible' : ''}`}>
        {/* Main title */}
        <motion.h1
          className="lp-title"
          initial={{ opacity: 0, y: -30, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        >
          Escape Room
        </motion.h1>

        {/* Divider with subtitle */}
        <motion.div
          className="lp-subtitle-row"
          initial={{ opacity: 0, scaleX: 0.7 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
        >
          <span className="lp-divider-line" />
          <span className="lp-subtitle">AI Dungeon Challenge</span>
          <span className="lp-divider-line" />
        </motion.div>

        {/* Spacer */}
        <div style={{ height: 'clamp(24px, 5vh, 60px)' }} />

        {/* CTA Button */}
        <motion.button
          className={`lp-btn ${hovered ? 'lp-btn--hovered' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
        >
          <span className="lp-btn-text">Enter the Dungeon</span>
        </motion.button>
      </div>
    </div>
  )
}

/* ── Torch flame component ── */
function TorchFlame({ delay = 0 }) {
  return (
    <div className="torch-wrap">
      {/* Stick */}
      <div className="torch-stick" />
      {/* Flame layers */}
      <div className="torch-flame-group">
        <motion.div
          className="torch-flame torch-flame--outer"
          animate={{
            scaleX: [1, 1.15, 0.9, 1.1, 1],
            scaleY: [1, 0.95, 1.1, 0.9, 1],
            opacity: [0.8, 1, 0.85, 1, 0.8],
          }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
        <motion.div
          className="torch-flame torch-flame--mid"
          animate={{
            scaleX: [1, 0.9, 1.1, 0.95, 1],
            scaleY: [1, 1.1, 0.9, 1.05, 1],
            opacity: [1, 0.9, 1, 0.95, 1],
          }}
          transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.1 }}
        />
        <motion.div
          className="torch-flame torch-flame--inner"
          animate={{
            scaleX: [1, 1.05, 0.92, 1, 1],
            opacity: [1, 0.85, 1, 0.9, 1],
          }}
          transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.05 }}
        />
      </div>
      {/* Glow pool below torch */}
      <motion.div
        className="torch-glow"
        animate={{ opacity: [0.6, 1, 0.7, 0.9, 0.6] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay }}
      />
    </div>
  )
}
