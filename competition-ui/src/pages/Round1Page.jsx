import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Timer from '../components/Timer.jsx'
import './Round1Page.css'

export default function Round1Page({ gameState, onComplete }) {
  // Phase: 'explore' → 'lock' → 'submit' → 'result'
  const [phase, setPhase] = useState('explore')
  const [windowFound, setWindowFound] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [scores, setScores] = useState(null)
  const [totalScore, setTotalScore] = useState(null)
  const [pulseWindow, setPulseWindow] = useState(false)
  const fileRef = useRef()

  /* ── Window click handler ── */
  const handleWindowClick = () => {
    if (windowFound) return
    setWindowFound(true)
    setTimeout(() => setPhase('lock'), 400)
  }

  /* ── File select ── */
  const handleFileSelect = (file) => {
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
    setPhase('submit')
  }

  /* ── Submit / analyze ── */
  const handleSubmit = () => {
    if (!imageFile) return
    setAnalyzing(true)
    setTimeout(() => {
      const shape  = Math.floor(80 + Math.random() * 20)
      const teeth  = Math.floor(75 + Math.random() * 25)
      const color  = Math.floor(78 + Math.random() * 22)
      const edge   = Math.floor(82 + Math.random() * 18)
      const total  = Math.floor((shape + teeth + color + edge) / 4)
      setScores({ shape, teeth, color, edge })
      setTotalScore(total)
      setAnalyzing(false)
      setPhase('result')
    }, 3500)
  }

  return (
    <div className="r1-root">

      {/* ══════════════ TOP BAR ══════════════ */}
      <div className="r1-topbar">
        <div className="r1-topbar-left">
          <button className="r1-menu-btn" onClick={() => {}}>☰</button>
          <span className="r1-round-label font-heading">
            ROUND 1 — EXPLORE THE ROOM
          </span>
        </div>
        <Timer initialSeconds={525} running={phase === 'explore' || phase === 'lock'} />
      </div>

      {/* ══════════════ MAIN SCENE ══════════════ */}
      <div className="r1-scene-wrap">

        {/* ── Background room image ── */}
        <div className="r1-room-bg" />

        {/* ── Darkness overlay ── */}
        <div className="r1-room-overlay" />

        {/* ── Instruction card (top-left) ── */}
        <AnimatePresence>
          {phase === 'explore' && (
            <motion.div
              className="r1-clue-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="r1-clue-text">
                Find the window that can be opened.
              </p>
              <p className="r1-clue-sub">
                Look carefully. The key is hidden.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Clickable Window hotspot ── */}
        {phase === 'explore' && (
          <motion.div
            className="r1-window-hotspot"
            onClick={handleWindowClick}
            title="Examine the window"
            animate={pulseWindow ? {} : {}}
          >
            {/* Dashed pulsing ring */}
            <motion.div
              className="r1-window-ring"
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Magnifier icon */}
            <motion.div
              className="r1-magnifier"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              🔍
            </motion.div>
          </motion.div>
        )}

        {/* ── Window-found flash ── */}
        <AnimatePresence>
          {windowFound && phase === 'explore' && (
            <motion.div
              className="r1-found-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* ══════════════ LOCK PHASE ══════════════ */}
        <AnimatePresence>
          {(phase === 'lock' || phase === 'submit' || phase === 'result') && (
            <motion.div
              className="r1-lock-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="r1-lock-modal"
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >

                {/* ─ LOCK VIEW ─ */}
                {phase === 'lock' && (
                  <div className="r1-lock-view">
                    <div className="r1-modal-header">
                      <span className="font-heading r1-modal-title">🔒 Something catches your eye…</span>
                      <p className="r1-modal-hint">Could this open the window?</p>
                    </div>

                    <motion.div
                      className="r1-lock-img-wrap"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img
                        src="/images/lock.png"
                        alt="Ancient Lock"
                        className="r1-lock-img"
                        onError={e => {
                          // fallback if lock.png not yet available
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      {/* Fallback placeholder */}
                      <div className="r1-lock-placeholder" style={{ display: 'none' }}>
                        <span style={{ fontSize: '5rem' }}>🔒</span>
                        <p style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', marginTop: 8 }}>
                          ANCIENT LOCK
                        </p>
                      </div>
                      {/* Glow ring around lock */}
                      <div className="r1-lock-glow" />
                    </motion.div>

                    <div className="r1-modal-body">
                      <p className="r1-modal-desc">
                        An ancient padlock seals the window. To open it, you must generate
                        the <strong style={{ color: 'var(--color-gold)' }}>exact key</strong> that fits this lock.
                      </p>
                      <div className="r1-clue-chips">
                        {['🗝️ Skeleton key', '🟡 Golden color', '⚙️ 3 teeth', '✨ Sharp edges'].map(c => (
                          <span key={c} className="r1-chip">{c}</span>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      className="btn btn-primary r1-modal-btn"
                      onClick={() => setPhase('submit')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      🖼️ Submit Your Key Image
                    </motion.button>
                  </div>
                )}

                {/* ─ SUBMIT VIEW ─ */}
                {phase === 'submit' && (
                  <div className="r1-submit-view">
                    <div className="r1-modal-header">
                      <span className="font-heading r1-modal-title">🗝️ Submit the Key</span>
                      <p className="r1-modal-hint">Generate a key image using an AI tool and upload it below</p>
                    </div>

                    <div className="r1-submit-body">
                      {/* Left — lock reminder */}
                      <div className="r1-lock-thumb-wrap">
                        <img src="/images/lock.png" alt="Lock" className="r1-lock-thumb"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                        <div style={{ display: 'none', fontSize: '3rem', textAlign: 'center' }}>🔒</div>
                        <p className="r1-lock-label">Target Lock</p>
                        <div className="r1-key-hints">
                          {[
                            ['Shape', 'Skeleton / Antique'],
                            ['Color', 'Golden / Brass'],
                            ['Teeth', '3 rectangular cuts'],
                            ['Bg', 'Dark / High contrast'],
                          ].map(([k, v]) => (
                            <div key={k} className="r1-key-hint-row">
                              <span className="r1-key-hint-label">{k}</span>
                              <span className="r1-key-hint-val">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right — upload */}
                      <div className="r1-upload-area">
                        {imagePreview ? (
                          <motion.div className="r1-preview-wrap"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <img src={imagePreview} alt="Your key" className="r1-preview-img" />
                            <button
                              className="r1-remove-btn"
                              onClick={() => { setImageFile(null); setImagePreview(null) }}
                            >✕ Remove</button>
                          </motion.div>
                        ) : (
                          <div
                            className={`r1-dropzone ${dragOver ? 'r1-dropzone--over' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
                            onClick={() => fileRef.current?.click()}
                          >
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => handleFileSelect(e.target.files[0])} />
                            <div className="r1-dropzone-icon">🗝️</div>
                            <p className="r1-dropzone-title">DROP YOUR KEY IMAGE</p>
                            <p className="r1-dropzone-sub">PNG · JPG · WEBP — or click to browse</p>
                          </div>
                        )}

                        <motion.button
                          className="btn btn-primary r1-modal-btn"
                          disabled={!imageFile || analyzing}
                          onClick={handleSubmit}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          style={{ marginTop: 14 }}
                        >
                          {analyzing ? (
                            <>
                              <motion.span animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span>
                              &nbsp;Analyzing Key…
                            </>
                          ) : '🔓 Unlock — Submit Key'}
                        </motion.button>

                        {analyzing && (
                          <div style={{ marginTop: 10 }}>
                            <div className="r1-prog-bar">
                              <motion.div className="r1-prog-fill"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 3.5, ease: 'easeInOut' }}
                              />
                            </div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 5, textAlign: 'center' }}>
                              Running edge detection…
                            </p>
                          </div>
                        )}

                        <button className="r1-back-btn" onClick={() => setPhase('lock')}>← Back</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─ RESULT VIEW ─ */}
                {phase === 'result' && scores && (
                  <div className="r1-result-view">
                    <div className="r1-modal-header">
                      <motion.span
                        style={{ fontSize: '2.5rem' }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {totalScore >= 80 ? '🏆' : totalScore >= 60 ? '✅' : '❌'}
                      </motion.span>
                      <span className="font-heading r1-modal-title" style={{
                        color: totalScore >= 80 ? '#2ecc71' : totalScore >= 60 ? 'var(--color-gold)' : 'var(--color-ember)'
                      }}>
                        {totalScore >= 80 ? 'KEY ACCEPTED!' : totalScore >= 60 ? 'PARTIAL MATCH' : 'KEY REJECTED'}
                      </span>
                      <p className="r1-modal-hint">
                        {totalScore >= 80
                          ? 'The lock clicks open. Your key was perfect.'
                          : totalScore >= 60
                          ? 'The lock strains but opens partially.'
                          : 'The key does not fit. The lock holds firm.'}
                      </p>
                    </div>

                    <div className="r1-result-grid">
                      {[
                        ['🔷 Key Shape',    scores.shape],
                        ['⚙️ Tooth Count',  scores.teeth],
                        ['🎨 Color Match',  scores.color],
                        ['✂️ Edge Clarity', scores.edge],
                      ].map(([label, val]) => (
                        <div key={label} className="r1-result-row">
                          <span className="r1-result-label">{label}</span>
                          <div className="r1-result-bar-wrap">
                            <div className="r1-prog-bar">
                              <motion.div
                                className="r1-prog-fill"
                                style={{
                                  background: val >= 80
                                    ? 'linear-gradient(90deg,#1a8c4a,#2ecc71)'
                                    : val >= 60
                                    ? 'linear-gradient(90deg,#7a4a0a,#d4a017)'
                                    : 'linear-gradient(90deg,#6e1010,#e85a1e)'
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${val}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                              />
                            </div>
                          </div>
                          <span className="r1-result-pct" style={{
                            color: val >= 80 ? '#2ecc71' : val >= 60 ? 'var(--color-gold)' : 'var(--color-ember)'
                          }}>{val}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="r1-total-score-row">
                      <span className="r1-total-label font-heading">TOTAL SCORE</span>
                      <motion.span
                        className="r1-total-val"
                        style={{ color: totalScore >= 80 ? '#2ecc71' : totalScore >= 60 ? 'var(--color-gold)' : 'var(--color-ember)' }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                      >
                        {totalScore}/100
                      </motion.span>
                    </div>

                    <motion.button
                      className="btn btn-primary r1-modal-btn"
                      onClick={() => onComplete(totalScore)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      ⚔️ Proceed to Round 2 — Armory Assault
                    </motion.button>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>{/* end scene-wrap */}

      {/* ══════════════ BOTTOM BAR ══════════════ */}
      <div className="r1-bottombar">
        <button className="r1-bar-btn" onClick={() => setShowHint(h => !h)}>
          <span className="r1-bar-icon">💡</span>
          <span className="r1-bar-label">HINT</span>
        </button>
        <button className="r1-bar-btn">
          <span className="r1-bar-icon">🎒</span>
          <span className="r1-bar-label">INVENTORY</span>
        </button>
        <button className="r1-bar-btn">
          <span className="r1-bar-icon">📝</span>
          <span className="r1-bar-label">NOTES</span>
        </button>
      </div>

      {/* Hint tooltip */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="r1-hint-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            💡 Look for the glowing circle on the right side of the room — that's your window!
            <button onClick={() => setShowHint(false)} className="r1-hint-close">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
