import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Round3Page.css'

/* ── Fixed terrain data — no selection, items are predefined ── */
const DOORS = [
  {
    id: 'ocean',
    emoji: '🌊',
    label: 'OCEAN',
    tagline: 'Embrace the Depths',
    color: '#1a9fd4',
    colorDim: 'rgba(26,159,212,0.14)',
    image: '/images/ocean.png',
    requiredItems: [
      { icon: '🛟', name: 'Life Jacket' },
      { icon: '🚤', name: 'Inflatable Raft' },
      { icon: '💧', name: 'Desalination Kit' },
      { icon: '📡', name: 'Emergency Beacon' },
      { icon: '🩹', name: 'First Aid Kit' },
    ],
  },
  {
    id: 'mountain',
    emoji: '⛰️',
    label: 'MOUNTAIN',
    tagline: 'Conquer the Heights',
    color: '#a0b8cc',
    colorDim: 'rgba(160,184,204,0.14)',
    image: '/images/mountain.png',
    requiredItems: [
      { icon: '🪢', name: 'Climbing Rope' },
      { icon: '⛏️', name: 'Ice Axe' },
      { icon: '⛺', name: 'Emergency Tent' },
      { icon: '🔦', name: 'Headlamp' },
      { icon: '🩹', name: 'First Aid Kit' },
    ],
  },
  {
    id: 'desert',
    emoji: '🏜️',
    label: 'DESERT',
    tagline: 'Endure the Heat',
    color: '#d4902a',
    colorDim: 'rgba(212,144,42,0.14)',
    image: '/images/desert.png',
    requiredItems: [
      { icon: '💧', name: 'Water Purifier' },
      { icon: '🏕️', name: 'Shade Tarp' },
      { icon: '🕶️', name: 'UV Goggles' },
      { icon: '🪄', name: 'Signal Mirror' },
      { icon: '🩹', name: 'First Aid Kit' },
    ],
  },
]

export default function Round3Page({ gameState, onComplete }) {
  // phases: 'choose' → 'mission' → 'result'
  const [phase, setPhase]               = useState('choose')
  const [selectedDoor, setSelectedDoor] = useState(null)
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver]         = useState(false)
  const [analyzing, setAnalyzing]       = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [itemScores, setItemScores]     = useState({})
  const [totalScore, setTotalScore]     = useState(null)
  const fileRef = useRef()

  const door = DOORS.find(d => d.id === selectedDoor)

  const handleDoorClick = (id) => {
    setSelectedDoor(id)
    setImageFile(null)
    setImagePreview(null)
    setItemScores({})
    setTotalScore(null)
    setPhase('mission')
  }

  const handleFileSelect = (file) => {
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!imageFile) return
    setAnalyzing(true)
    setAnalyzeProgress(0)
    let prog = 0
    const iv = setInterval(() => {
      prog += Math.random() * 9
      if (prog >= 100) {
        prog = 100
        clearInterval(iv)
        // Simulated detection — replace with real API call
        const scores = {}
        door.requiredItems.forEach(item => {
          scores[item.name] = Math.random() > 0.2
        })
        const detected = Object.values(scores).filter(Boolean).length
        setItemScores(scores)
        setTotalScore(detected * 20)
        setAnalyzing(false)
        setPhase('result')
      }
      setAnalyzeProgress(Math.min(100, Math.floor(prog)))
    }, 120)
  }

  return (
    <div className="r3-root">
      <AnimatePresence mode="wait">

        {/* ══════════════════════════════════
            PHASE 1 — CHOOSE YOUR DOOR
        ══════════════════════════════════ */}
        {phase === 'choose' && (
          <motion.div key="choose" className="r3-choose-root"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.45 }}>

            <div className="r3-topbar">
              <span className="r3-round-title font-heading">ROUND 3 — CHOOSE YOUR PATH</span>
            </div>

            <div className="r3-choose-body">
              <motion.div className="r3-choose-header"
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}>
                <h2 className="r3-choose-title font-display">THREE DOORS BEFORE YOU</h2>
                <p className="r3-choose-sub">Three paths. One truth. Choose wisely.</p>
              </motion.div>

              <div className="r3-doors-row">
                {DOORS.map((d, i) => (
                  <motion.div key={d.id} className="r3-door-card"
                    style={{ '--dc': d.color, '--dcDim': d.colorDim }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i + 0.3, duration: 0.55 }}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    onClick={() => handleDoorClick(d.id)}
                  >
                    {/* Arch with terrain photo */}
                    <div className="r3-door-arch">
                      <img src={d.image} alt={d.label} className="r3-door-img" />

                      {/* Arch SVG border */}
                      <svg className="r3-arch-svg" viewBox="0 0 200 300" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 300 L8 140 Q100 8 192 140 L192 300 Z"
                          stroke={d.color} strokeWidth="2" strokeOpacity="0.65" fill="none" />
                        <path d="M18 300 L18 148 Q100 24 182 148 L182 300 Z"
                          stroke={d.color} strokeWidth="0.8" strokeOpacity="0.22" fill="none" />
                      </svg>

                      {/* Bottom gradient glow */}
                      <div className="r3-door-bottom-glow"
                        style={{ background: `linear-gradient(180deg, transparent 40%, ${d.colorDim} 100%)` }} />

                      {/* Click overlay on hover */}
                      <motion.div className="r3-door-hover-layer"
                        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} />
                    </div>

                    {/* Info strip */}
                    <div className="r3-door-info" style={{ borderColor: `${d.color}55` }}>
                      <div className="r3-door-label font-heading" style={{ color: d.color }}>
                        {d.emoji}&nbsp;&nbsp;{d.label}
                      </div>
                      <div className="r3-door-tagline">{d.tagline}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════
            PHASE 2 — MISSION BRIEFING + UPLOAD
        ══════════════════════════════════ */}
        {phase === 'mission' && door && (
          <motion.div key="mission" className="r3-mission-root"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            {/* Full terrain background */}
            <div className="r3-terrain-bg" style={{ backgroundImage: `url('${door.image}')` }} />
            <div className="r3-terrain-overlay" />

            {/* Top bar */}
            <div className="r3-topbar">
              <button className="r3-back-btn font-heading"
                onClick={() => setPhase('choose')}>← Back</button>
              <span className="r3-round-title font-heading">
                {door.emoji}&nbsp;&nbsp;{door.label} — SURVIVAL MISSION
              </span>
            </div>

            {/* Two-column layout */}
            <div className="r3-mission-body">

              {/* LEFT — Required items briefing */}
              <motion.div className="r3-mission-brief"
                initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}>

                <div className="r3-brief-top">
                  <div className="r3-brief-terrain-tag font-heading" style={{ color: door.color }}>
                    {door.emoji}&nbsp;&nbsp;{door.label}
                  </div>
                  <p className="r3-brief-instruction">
                    Generate an AI image containing all <strong style={{ color: door.color }}>5 required items</strong> in
                    a {door.label.toLowerCase()} environment, then upload it below.
                    Each correctly detected item scores <strong style={{ color: door.color }}>20 points</strong>.
                  </p>
                </div>

                <div className="r3-brief-divider" style={{ borderColor: `${door.color}44` }} />

                <div className="r3-brief-items-title font-heading">OBJECTIVES</div>

                <div className="r3-brief-hidden-row">
                  <span className="r3-brief-hidden-icon">🔒</span>
                  <p className="r3-brief-hidden-text">
                    Generate an image containing <strong style={{ color: door.color }}>5 survival items</strong> suited to a {door.label.toLowerCase()} environment.
                    The required items are concealed — detection happens after submission.
                  </p>
                </div>

                <div className="r3-brief-score-row">
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>
                    Detect all 5 →
                  </span>
                  <span className="font-heading" style={{ fontSize: '1.1rem', color: '#2ecc71', fontWeight: 700 }}>
                    100 / 100
                  </span>
                </div>
              </motion.div>

              {/* RIGHT — Upload */}
              <motion.div className="r3-mission-upload"
                initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}>

                <div className="r3-upload-header font-heading">UPLOAD YOUR IMAGE</div>

                {imagePreview ? (
                  <motion.div className="r3-preview-box"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}>
                    <img src={imagePreview} alt="submission" className="r3-preview-img" />
                    <div className="r3-preview-glow"
                      style={{ background: `radial-gradient(ellipse at center, ${door.colorDim} 0%, transparent 70%)` }} />
                    <button className="r3-remove-btn"
                      onClick={() => { setImageFile(null); setImagePreview(null) }}>
                      ✕ Remove
                    </button>
                  </motion.div>
                ) : (
                  <div className={`r3-dropzone ${dragOver ? 'r3-dropzone--active' : ''}`}
                    style={{ '--dc': door.color }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
                    onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileSelect(e.target.files[0])} />
                    <span className="r3-dropzone-big-icon">{door.emoji}</span>
                    <p className="r3-dropzone-main">DROP YOUR SURVIVAL IMAGE HERE</p>
                    <p className="r3-dropzone-hint">
                      Must contain all 5 required items in a {door.label.toLowerCase()} setting
                    </p>
                    <p className="r3-dropzone-formats">PNG · JPG · WEBP — or click to browse</p>
                  </div>
                )}

                {/* Progress bar while analyzing */}
                <AnimatePresence>
                  {analyzing && (
                    <motion.div className="r3-prog-wrap"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}>
                      <div className="r3-prog-row">
                        <motion.span className="r3-prog-label"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity }}>
                          🔍 Running object detection…
                        </motion.span>
                        <span className="r3-prog-pct font-heading">{analyzeProgress}%</span>
                      </div>
                      <div className="r3-prog-track">
                        <motion.div className="r3-prog-fill"
                          style={{ background: `linear-gradient(90deg, ${door.colorDim.replace('0.14','0.4')}, ${door.color})` }}
                          animate={{ width: `${analyzeProgress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="r3-prog-tip">Using YOLO world model to detect each item…</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  className="r3-submit-btn"
                  style={{ '--dc': door.color }}
                  disabled={!imageFile || analyzing}
                  onClick={handleSubmit}
                  whileHover={{ scale: imageFile && !analyzing ? 1.03 : 1 }}
                  whileTap={{ scale: 0.97 }}>
                  {analyzing ? (
                    <>
                      <motion.span animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span>
                      &nbsp;Analyzing…
                    </>
                  ) : '🎯 Submit & Detect Items'}
                </motion.button>

                <p className="r3-upload-tip">
                  Tip: Ensure all 5 items are clearly visible and unobstructed.
                </p>
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════
            PHASE 3 — RESULT
        ══════════════════════════════════ */}
        {phase === 'result' && door && (
          <motion.div key="result" className="r3-result-root"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            {/* Terrain bg blurred */}
            <div className="r3-terrain-bg r3-terrain-bg--blurred"
              style={{ backgroundImage: `url('${door.image}')` }} />
            <div className="r3-terrain-overlay r3-terrain-overlay--dark" />

            <div className="r3-topbar">
              <span className="r3-round-title font-heading">
                {door.emoji}&nbsp;&nbsp;{door.label} — ESCAPE RESULTS
              </span>
            </div>

            <div className="r3-result-body">
              <motion.div className="r3-result-card"
                style={{ borderColor: `${door.color}55` }}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 160 }}>

                {/* Trophy */}
                <motion.div className="r3-result-trophy"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}>
                  {totalScore >= 100 ? '🏆' : totalScore >= 60 ? '🎯' : totalScore >= 40 ? '⚠️' : '💀'}
                </motion.div>

                <h2 className="r3-result-title font-display" style={{ color: door.color }}>
                  {totalScore >= 100 ? 'PERFECT ESCAPE!'
                    : totalScore >= 80 ? 'GREAT ESCAPE!'
                    : totalScore >= 60 ? 'SURVIVED!'
                    : totalScore >= 40 ? 'BARELY MADE IT'
                    : 'LOST IN THE WILD'}
                </h2>

                <p className="r3-result-sub">
                  {Object.values(itemScores).filter(Boolean).length} of 5 items detected in
                  your <strong style={{ color: door.color }}>{door.label.toLowerCase()}</strong> image.
                </p>

                {/* Submitted image */}
                {imagePreview && (
                  <div className="r3-result-preview">
                    <img src={imagePreview} alt="Submitted" className="r3-result-preview-img" />
                    <div className="r3-result-preview-glow"
                      style={{ background: `linear-gradient(180deg, transparent 40%, ${door.colorDim} 100%)` }} />
                  </div>
                )}

                {/* Detection breakdown */}
                <div className="r3-detect-list">
                  {door.requiredItems.map((item, i) => {
                    const detected = itemScores[item.name]
                    return (
                      <motion.div key={item.name} className="r3-detect-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}>
                        <span className="r3-detect-num font-heading" style={{ color: door.color }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="r3-detect-icon">{item.icon}</span>
                        <span className="r3-detect-name">{item.name}</span>
                        <div className="r3-detect-right">
                          <span className="r3-detect-pts font-heading"
                            style={{ color: detected ? '#2ecc71' : '#e85a1e' }}>
                            {detected ? '+20' : '+0'}
                          </span>
                          <span className="r3-detect-badge">
                            {detected ? '✅' : '❌'}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Total score */}
                <div className="r3-result-total" style={{ borderColor: `${door.color}44` }}>
                  <span className="r3-result-total-label font-heading">FINAL SCORE</span>
                  <motion.span className="r3-result-total-val font-display"
                    style={{ color: totalScore >= 80 ? '#2ecc71' : totalScore >= 60 ? door.color : '#e85a1e' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}>
                    {totalScore} / 100
                  </motion.span>
                </div>

                <motion.button className="r3-final-btn"
                  onClick={() => onComplete(totalScore)}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  🏆 View Final Results
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
