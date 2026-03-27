'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import clsx from 'clsx'

interface CountdownTimerProps {
  expiresAt: string | Date
  onExpired?: () => void
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0)

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    const update = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0 && onExpired) onExpired()
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const isUrgent = secondsLeft < 120

  return (
    <div className={clsx(
      'flex items-center gap-2 font-mono font-semibold text-sm px-3 py-1.5 rounded-xl',
      isUrgent
        ? 'bg-red-500/20 text-red-400 animate-pulse'
        : 'bg-amber-500/20 text-amber-400'
    )}>
      <Clock size={14} />
      {secondsLeft === 0 ? (
        <span>Hold expired</span>
      ) : (
        <span>Hold expires in {mins}:{secs.toString().padStart(2, '0')}</span>
      )}
    </div>
  )
}
