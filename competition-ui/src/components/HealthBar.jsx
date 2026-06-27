import { motion } from 'framer-motion'

export default function HealthBar({ value = 100, max = 100, label = 'YOUR HEALTH', type = 'health' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const isEnemy = type === 'enemy'

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          color: isEnemy ? 'var(--color-enemy)' : 'var(--color-text-dim)',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.6rem',
          color: isEnemy ? 'var(--color-enemy)' : 'var(--color-health)',
        }}>
          {value}/{max}
        </span>
      </div>
      <div className={`progress-bar progress-${isEnemy ? 'enemy' : 'health'}`}>
        <motion.div
          className="progress-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
