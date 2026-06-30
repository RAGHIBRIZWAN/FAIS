import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Timer from '../components/Timer.jsx'
import './Round1Page.css'

export default function Round1Page({ gameState, onComplete, onTimeUp, onSubmission }) {
  // Phase: 'explore' → 'lock' → 'submit' → 'result'
  const [phase, setPhase] = useState('explore')
  const [windowFound, setWindowFound] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
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
  const handleSubmit = async () => {
    if (!imageFile) return
    if (onSubmission) onSubmission()
    setAnalyzing(true)
    setTotalScore(null)

    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await fetch('http://localhost:8000/api/evaluate/round1', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      setTotalScore(result.score)
      setAnalyzing(false)
      setPhase('result')
    } catch (e) {
      console.error(e)
      setTotalScore(0)
      setAnalyzing(false)
      setPhase('result')
    }
  }

  return (
    <div className="r1-root">

      {/* ══════════════ EVALUATOR LOADING OVERLAY ══════════════ */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            className="r1-eval-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="r1-eval-card"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Spinner */}
              <motion.div
                className="r1-eval-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.div>

              <motion.h3
                className="r1-eval-title font-heading"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                Gemini AI Evaluating…
              </motion.h3>

              <p className="r1-eval-sub">
                Analysing your key image. Please wait — this may take a few seconds.
              </p>

              {/* Indeterminate animated bar */}
              <div className="r1-eval-bar-track">
                <motion.div
                  className="r1-eval-bar-fill"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <p className="r1-eval-tip">Do not close or refresh the page.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ══════════════ TOP BAR ══════════════ */}
      <div className="r1-topbar">
        <div className="r1-topbar-left">
          <button className="r1-menu-btn" onClick={() => {}}>☰</button>
          <span className="r1-round-label font-heading">
            ROUND 1 — EXPLORE THE ROOM
          </span>
        </div>
        <Timer initialSeconds={1500} running={!(totalScore >= 80)} onExpire={() => onTimeUp(totalScore || 0)} />
      </div>

      {/* ══════════════ MAIN SCENE ══════════════ */}
      <div className="r1-scene-wrap">

        {/* ── Background room image ── */}
        <div className="r1-room-bg" />

        {/* ── Darkness overlay ── */}
        <div className="r1-room-overlay" />


        {/* ── Clickable Window hotspot ── */}
        {phase === 'explore' && (
          <motion.div
            className="r1-window-hotspot"
            onClick={handleWindowClick}
            title="Examine the window"
            animate={pulseWindow ? {} : {}}
          />
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
                      <span className="font-heading r1-modal-title">⚙️ Something catches your eye…</span>
                      <p className="r1-modal-hint">A complex mechanical lock seals the window.</p>
                    </div>

                    <motion.div
                      className="r1-lock-img-wrap"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
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
                        A mechanical lock seals the window. Study its gem-stone slots and pin tumblers, then generate the
                        <strong style={{ color: 'var(--color-gold)' }}> exact key</strong> that fits this lock.
                      </p>
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

                {/* ─ SUBMIT & RESULT VIEW (Verify Panel) ─ */}
                {(phase === 'submit' || phase === 'result') && (
                  <div className="r1-verify-panel">
                    {/* Left — YOUR KEY */}
                    <div className="r1-weapon-section">
                      <div className="r1-section-title font-heading">YOUR KEY</div>
                      <div className="r1-weapon-img-box">
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Your key" className="r1-weapon-img" />
                            {!analyzing && phase !== 'result' && (
                              <button
                                className="r1-remove-btn"
                                onClick={() => { setImageFile(null); setImagePreview(null) }}
                              >✕</button>
                            )}
                          </>
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
                            <div className="r1-upload-icon">⬆</div>
                            <p className="r1-upload-label">Upload Image</p>
                          </div>
                        )}
                        {analyzing && <div className="r1-weapon-scan-line" />}
                      </div>

                      {/* Analyze button */}
                      {totalScore === null && (
                        <motion.button
                          className="r1-analyze-btn"
                          disabled={!imageFile || analyzing}
                          onClick={handleSubmit}
                          whileHover={{ scale: (imageFile && !analyzing) ? 1.03 : 1 }}
                          whileTap={{ scale: (imageFile && !analyzing) ? 0.97 : 1 }}
                          style={{ marginTop: 14 }}
                        >
                          {analyzing ? (
                            <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span> Scanning...</>
                          ) : '🔍 Analyze Key'}
                        </motion.button>
                      )}
                      
                      {!imageFile && phase === 'submit' && (
                         <button style={{
                           background: 'none', border: 'none', color: 'var(--color-text-muted)',
                           fontFamily: 'var(--font-heading)', fontSize: '0.65rem', letterSpacing: '0.1em',
                           cursor: 'pointer', padding: '6px 0', transition: 'color 0.2s', alignSelf: 'flex-start'
                         }} onClick={() => setPhase('lock')}>← Back</button>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="r1-verify-divider" />

                    {/* Right — ANALYSIS RESULTS */}
                    <div className="r1-results-section">
                      <div className="r1-section-title font-heading">ANALYSIS RESULTS</div>

                      {totalScore !== null ? (
                        <>
                          {/* Raw score display */}
                          <div className="r1-result-rows">
                            <div className="r1-result-row">
                              <span className="r1-result-label">Gemini Score</span>
                              <span className="r1-result-val" style={{
                                color: totalScore >= 80 ? '#2ecc71' : '#e85a1e',
                                fontSize: '1.4rem',
                                fontWeight: 700
                              }}>
                                {totalScore} / 100
                              </span>
                            </div>
                            <div className="r1-result-row">
                              <span className="r1-result-label">Status</span>
                              <span className="r1-result-val" style={{
                                color: totalScore >= 80 ? '#2ecc71' : '#e85a1e'
                              }}>
                                {totalScore >= 80 ? '✅ PASS' : '❌ FAIL'}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="r1-progress-section">
                            <div className="r1-progress-label">
                              <span style={{ color: totalScore >= 80 ? '#2ecc71' : 'var(--color-ember)' }}>
                                {totalScore >= 80 ? 'KEY ACCEPTED!' : 'KEY REJECTED'}
                              </span>
                            </div>
                            <div className="r1-progress-track">
                              <motion.div
                                className="r1-progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${totalScore || 0}%` }}
                                transition={{ duration: 0.5 }}
                                style={{ background: totalScore >= 80 ? 'linear-gradient(90deg, #1a5c30, #2ecc71)' : 'linear-gradient(90deg, #8c1a1a, #e74c3c)' }}
                              />
                            </div>
                            <div className="r1-progress-pct font-heading">{totalScore}%</div>
                          </div>

                          <p className="r1-tip">
                            {totalScore >= 80
                              ? 'The lock clicks open. Your key was perfect.'
                              : 'The key does not fit. Score must be ≥ 80 to pass.'}
                          </p>

                          {totalScore >= 80 ? (
                            <motion.button
                              className="r1-battle-btn"
                              onClick={() => onComplete(totalScore)}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              ⚔️ Proceed to Round 2
                            </motion.button>
                          ) : (
                            <motion.button
                              className="r1-battle-btn"
                              style={{ background: 'linear-gradient(135deg, #2b3a42, #3b4d58, #2b3a42)', border: '1px solid #5a7585' }}
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                                setTotalScore(null);
                                setPhase('submit');
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              🔄 Retry Submission
                            </motion.button>
                          )}
                        </>
                      ) : (
                        <div className="r1-results-empty">
                          <p>Upload a key image and click "Analyze Key" to verify its structure.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>{/* end scene-wrap */}


    </div>
  )
}
