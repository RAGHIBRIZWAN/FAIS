import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Round2Page.css'

const RIDDLE_SHORT = `Cold Soviet phantom.
Banana curved shadow.
What am I?`

const RIDDLE_FULL = `Deep in an emerald jungle, where ancient vines interweave,
A rusted iron treasure chest lies waiting to deceive.
Stained with the crimson blood of battles long ago fought,
It guards the mythic, heavy prize that the Argonauts sought.

Within this chest, a phantom born of a cold Soviet dawn,
Casts a banana-curved shadow where empires are drawn.
Fueled by a cycle of gas and a fast-rotating bolt,
It is Mikhail's rugged masterpiece, built to revolt.

It shares the texture of silence when chaos is stilled,
The most radiant, gleaming crown that the harvest can yield.`

export default function Round2Page({ gameState, onComplete }) {
  // phase: 'encounter' → 'verify' → 'battle'
  const [phase, setPhase] = useState('encounter')
  const [playerHealth, setPlayerHealth] = useState(100)
  const [enemyHealth, setEnemyHealth] = useState(90)
  const [timeLeft, setTimeLeft] = useState(120) // 2:00
  const [battleTime, setBattleTime] = useState(45)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [weaponMatch, setWeaponMatch] = useState(null)
  const [colorMatch, setColorMatch] = useState(null)
  const [showFullRiddle, setShowFullRiddle] = useState(false)
  const [battleStarted, setBattleStarted] = useState(false)
  const [ammo, setAmmo] = useState(18)
  const [maxAmmo] = useState(90)
  const [fireEffect, setFireEffect] = useState(false)
  const [hitEffect, setHitEffect] = useState(false)
  const fileRef = useRef()
  const analyzeIntervalRef = useRef()

  /* ── Encounter timer ── */
  useEffect(() => {
    if (phase !== 'encounter') return
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [phase, timeLeft])

  /* ── Battle timer ── */
  useEffect(() => {
    if (phase !== 'battle' || !battleStarted) return
    if (battleTime <= 0) { handleBattleEnd(); return }
    const id = setInterval(() => setBattleTime(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [phase, battleStarted, battleTime])

  /* ── Enemy attacks player during battle ── */
  useEffect(() => {
    if (phase !== 'battle' || !battleStarted) return
    const id = setInterval(() => {
      setPlayerHealth(h => {
        const dmg = Math.floor(3 + Math.random() * 5)
        const next = Math.max(0, h - dmg)
        if (next <= 0) handleBattleEnd()
        return next
      })
      setHitEffect(true)
      setTimeout(() => setHitEffect(false), 300)
    }, 2500)
    return () => clearInterval(id)
  }, [phase, battleStarted])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleFileSelect = (file) => {
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleAnalyze = () => {
    if (!imageFile) return
    setAnalyzing(true)
    setAnalyzeProgress(0)
    // Simulate progress
    let prog = 0
    analyzeIntervalRef.current = setInterval(() => {
      prog += Math.random() * 8
      if (prog >= 92) {
        prog = 92
        clearInterval(analyzeIntervalRef.current)
        const wm = Math.floor(88 + Math.random() * 10)
        const cm = Math.floor(90 + Math.random() * 9)
        setWeaponMatch(wm)
        setColorMatch(cm)
        setAnalyzing(false)
      }
      setAnalyzeProgress(Math.min(92, Math.floor(prog)))
    }, 150)
  }

  const handleProceedToBattle = () => {
    setPhase('battle')
    setTimeout(() => setBattleStarted(true), 800)
  }

  const handleShoot = () => {
    if (ammo <= 0) return
    setAmmo(a => a - 1)
    setFireEffect(true)
    setTimeout(() => setFireEffect(false), 150)
    const dmg = Math.floor(8 + Math.random() * 12)
    setEnemyHealth(h => {
      const next = Math.max(0, h - dmg)
      if (next <= 0) handleBattleEnd()
      return next
    })
  }

  const handleBattleEnd = () => {
    const score = weaponMatch ? Math.floor((weaponMatch + colorMatch) / 2) : 60
    onComplete(score)
  }

  return (
    <div className="r2-root">
      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════
            PHASE 1 — ATTACKER ENCOUNTER
        ═══════════════════════════════════════ */}
        {phase === 'encounter' && (
          <motion.div
            key="encounter"
            className="r2-encounter-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background image */}
            <div className="r2-encounter-bg" />
            <div className="r2-encounter-overlay" />

            {/* ── Top bar ── */}
            <div className="r2-topbar">
              <span className="r2-round-title font-heading">ROUND 2 — ATTACKER ENCOUNTER</span>
            </div>

            {/* ── Timer (top-left badge) ── */}
            <div className="r2-timer-badge">
              <div className="r2-timer-label">TIME REMAINING</div>
              <div className={`r2-timer-val ${timeLeft < 30 ? 'danger' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* ── Attacker figure (left side) ── */}
            <motion.div
              className="r2-attacker-wrap"
              animate={{ x: [0, -4, 4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src="/images/attacker.png" alt="Attacker" className="r2-attacker-img"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
              <div className="r2-attacker-fallback">
                <motion.div
                  style={{ fontSize: 'clamp(6rem,15vw,12rem)' }}
                  animate={{ filter: ['drop-shadow(0 0 10px #e74c3c)', 'drop-shadow(0 0 30px #e74c3c)', 'drop-shadow(0 0 10px #e74c3c)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >🧟</motion.div>
              </div>
              {/* Red eye glow overlay */}
              <div className="r2-attacker-glow" />
            </motion.div>

            {/* ── Right column: clue + upload (kept together) ── */}
            <div className="r2-right-col">
            {/* ── Clue card ── */}
            <motion.div
              className="r2-clue-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="r2-clue-header font-heading">CLUE</div>
              <div className="r2-clue-body">
                {RIDDLE_SHORT.split('\n').map((line, i) => (
                  <p key={i} className="r2-clue-line">{line}</p>
                ))}
              </div>
              <button className="r2-riddle-toggle" onClick={() => setShowFullRiddle(v => !v)}>
                {showFullRiddle ? '▲ Hide full riddle' : '▼ Read full riddle'}
              </button>
              <AnimatePresence>
                {showFullRiddle && (
                  <motion.div
                    className="r2-full-riddle"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {RIDDLE_FULL.split('\n').map((line, i) => (
                      <p key={i} style={{ marginBottom: line === '' ? 8 : 2, fontStyle: 'italic', fontSize: '0.68rem', color: '#9c8060' }}>{line || '\u00A0'}</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="r2-clue-footer font-heading">Generate the weapon to defeat the attacker</div>
            </motion.div>

            {/* ── Upload panel ── */}
            <motion.div
              className="r2-upload-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="r2-upload-title font-heading">UPLOAD WEAPON IMAGE</div>
              {imagePreview ? (
                <div className="r2-upload-preview-wrap">
                  <img src={imagePreview} alt="weapon" className="r2-upload-preview-img" />
                  <button className="r2-remove-img" onClick={() => { setImageFile(null); setImagePreview(null) }}>✕</button>
                </div>
              ) : (
                <div
                  className={`r2-dropzone ${dragOver ? 'over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]) }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFileSelect(e.target.files[0])} />
                  <div className="r2-upload-icon">⬆</div>
                  <div className="r2-upload-label">Upload Image</div>
                </div>
              )}
              <motion.button
                className="r2-proceed-btn"
                disabled={!imageFile}
                onClick={() => setPhase('verify')}
                whileHover={{ scale: imageFile ? 1.03 : 1 }}
                whileTap={{ scale: imageFile ? 0.97 : 1 }}
              >
                ⚔️ Analyze Weapon
              </motion.button>
            </motion.div>
            </div>

            {/* ── Player health (bottom) ── */}
            <div className="r2-player-health-bar">
              <div className="r2-health-label font-heading">YOUR HEALTH</div>
              <div className="r2-health-track">
                <motion.div className="r2-health-fill" style={{ width: `${playerHealth}%` }} />
              </div>
              <span className="r2-health-pct font-heading">{playerHealth}%</span>
            </div>

          </motion.div>
        )}

        {/* ═══════════════════════════════════════
            PHASE 2 — WEAPON VERIFICATION
        ═══════════════════════════════════════ */}
        {phase === 'verify' && (
          <motion.div
            key="verify"
            className="r2-verify-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="r2-verify-bg" />
            <div className="r2-verify-overlay" />

            {/* Top bar */}
            <div className="r2-topbar r2-topbar--center">
              <span className="r2-round-title font-heading">ROUND 2 — WEAPON VERIFICATION</span>
            </div>

            {/* Main panel */}
            <div className="r2-verify-panel">

              {/* Left — YOUR WEAPON */}
              <div className="r2-weapon-section">
                <div className="r2-section-title font-heading">YOUR WEAPON</div>
                <div className="r2-weapon-img-box">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Your weapon" className="r2-weapon-img" />
                  ) : (
                    <div className="r2-weapon-placeholder">🗡️</div>
                  )}
                  {analyzing && <div className="r2-weapon-scan-line" />}
                </div>

                {/* Analyze button / progress */}
                {!weaponMatch && (
                  <motion.button
                    className="r2-analyze-btn"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    whileHover={{ scale: analyzing ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {analyzing ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}>⚙️</motion.span> Scanning...</>
                    ) : '🔍 Analyze'}
                  </motion.button>
                )}
              </div>

              {/* Divider */}
              <div className="r2-verify-divider" />

              {/* Right — ANALYSIS RESULTS */}
              <div className="r2-results-section">
                <div className="r2-section-title font-heading">ANALYSIS RESULTS</div>

                {(analyzing || weaponMatch) ? (
                  <>
                    <div className="r2-result-rows">
                      {[
                        ['Weapon Match', weaponMatch],
                        ['Color Match', colorMatch],
                      ].map(([label, val]) => (
                        <div key={label} className="r2-result-row">
                          <span className="r2-result-label">{label}</span>
                          <span className="r2-result-val" style={{
                            color: val >= 80 ? '#2ecc71' : val >= 60 ? '#d4a017' : '#e85a1e'
                          }}>
                            {val !== null ? `${val}%` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="r2-progress-section">
                      <div className="r2-progress-label">
                        {analyzing ? (
                          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                            Analyzing...
                          </motion.span>
                        ) : 'Complete'}
                      </div>
                      <div className="r2-progress-track">
                        <motion.div
                          className="r2-progress-fill"
                          animate={{ width: `${analyzeProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="r2-progress-pct font-heading">{analyzeProgress}%</div>
                    </div>

                    <p className="r2-tip">Tip: Make sure the weapon is clearly visible.</p>

                    {weaponMatch && (
                      <motion.button
                        className="r2-battle-btn"
                        onClick={handleProceedToBattle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        ⚔️ Launch Battle!
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="r2-results-empty">
                    <p>Click "Analyze" to compare your weapon against the master image.</p>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* ═══════════════════════════════════════
            PHASE 3 — BATTLE
        ═══════════════════════════════════════ */}
        {phase === 'battle' && (
          <motion.div
            key="battle"
            className="r2-battle-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleShoot}
            style={{ cursor: 'crosshair' }}
          >
            {/* Battle BG */}
            <div className="r2-battle-bg" />

            {/* Red hit flash */}
            <AnimatePresence>
              {hitEffect && (
                <motion.div
                  key="hit"
                  className="r2-hit-flash"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {/* Muzzle flash */}
            <AnimatePresence>
              {fireEffect && (
                <motion.div
                  key="fire"
                  className="r2-fire-flash"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>

            {/* Top bar */}
            <div className="r2-topbar">
              <span className="r2-round-title font-heading">ROUND 2 — BATTLE</span>
            </div>

            {/* Timer (top-left) */}
            <div className="r2-timer-badge">
              <div className="r2-timer-label">TIME REMAINING</div>
              <div className={`r2-timer-val ${battleTime < 15 ? 'danger' : ''}`}>
                {formatTime(battleTime)}
              </div>
            </div>

            {/* Enemy health (top-right) */}
            <div className="r2-enemy-health-hud">
              <div className="r2-health-label font-heading" style={{ color: '#e74c3c', textAlign: 'right' }}>ENEMY HEALTH</div>
              <div className="r2-health-track r2-health-track--enemy">
                <motion.div
                  className="r2-health-fill r2-health-fill--enemy"
                  animate={{ width: `${(enemyHealth / 90) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Crosshair */}
            <div className="r2-crosshair">
              <div className="r2-crosshair-h" />
              <div className="r2-crosshair-v" />
              <div className="r2-crosshair-dot" />
            </div>

            {/* Attacker in center */}
            <motion.div
              className="r2-battle-attacker"
              animate={{
                scale: [1, 1.04, 1],
                filter: [
                  'drop-shadow(0 0 10px rgba(231,76,60,0.4))',
                  'drop-shadow(0 0 30px rgba(231,76,60,0.8))',
                  'drop-shadow(0 0 10px rgba(231,76,60,0.4))',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img src="/images/attacker.png" alt="enemy" className="r2-battle-enemy-img"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
              <div style={{ display: 'none', fontSize: '8rem', textAlign: 'center' }}>🧟</div>
            </motion.div>

            {/* Weapon (bottom right) */}
            <motion.div
              className="r2-weapon-hud"
              animate={fireEffect ? { y: [-6, 0] } : {}}
              transition={{ duration: 0.1 }}
            >
              <div className="r2-ammo-display font-heading">
                <span className="r2-ammo-icon">▐▐▐</span>
                <span className="r2-ammo-count">{ammo} / {maxAmmo}</span>
              </div>
              <div className="r2-weapon-silhouette">AK</div>
            </motion.div>

            {/* Player health (bottom left) */}
            <div className="r2-player-health-bar r2-player-health-bar--battle">
              <div className="r2-health-label font-heading">YOUR HEALTH</div>
              <div className="r2-health-track">
                <motion.div
                  className="r2-health-fill"
                  animate={{ width: `${playerHealth}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="r2-health-pct font-heading">{playerHealth}%</span>
            </div>

            {/* Click to shoot hint */}
            {!battleStarted && (
              <motion.div
                className="r2-start-hint font-heading"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                CLICK TO SHOOT
              </motion.div>
            )}

            {/* Proceed button (bottom center after time or enemy defeated) */}
            {(enemyHealth <= 0 || battleTime <= 0) && (
              <motion.div
                className="r2-battle-end"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="r2-battle-end-title font-heading">
                  {enemyHealth <= 0 ? '⚔️ ENEMY DEFEATED!' : '💀 TIME EXPIRED!'}
                </div>
                <motion.button
                  className="r2-battle-btn"
                  onClick={handleBattleEnd}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  🚪 Continue to Round 3
                </motion.button>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
