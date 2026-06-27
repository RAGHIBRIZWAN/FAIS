import { motion } from 'framer-motion'

export default function RoundHeader({ round, title, subtitle, timer, right }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(0,0,0,0.6)',
      borderBottom: '1px solid var(--color-border)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ fontSize: '1.2rem' }}
        >
          ☰
        </motion.div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
          }}>
            {round}
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-gold)',
            letterSpacing: '0.08em',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', align: 'center', gap: 12 }}>
        {timer}
        {right}
      </div>
    </div>
  )
}
