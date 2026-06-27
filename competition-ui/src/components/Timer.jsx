import { useEffect, useState } from 'react'

export default function Timer({ initialSeconds = 300, onExpire, running = true }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) { onExpire?.(); return }
    const id = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds, running, onExpire])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const isDanger = seconds < 60

  return (
    <div className="timer-badge">
      <span className="timer-label">Time Left</span>
      <span className={`timer-value ${isDanger ? 'danger' : ''}`}>
        {mins}:{secs}
      </span>
    </div>
  )
}
