'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import type { Difficulty } from '@/lib/types'

interface TimerProps {
  initialTime: number // in seconds
  difficulty: Difficulty
  onTimeUp: () => void
  onTimeUpdate: (remainingTime: number) => void
  isPaused?: boolean
}

export function Timer({ 
  initialTime, 
  difficulty, 
  onTimeUp, 
  onTimeUpdate,
  isPaused = false 
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)

useEffect(() => {
  if (isPaused) return

  const interval = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(interval)
        onTimeUp()
        return 0
      }

      const newTime = prev - 1
      onTimeUpdate(newTime)
      return newTime
    })
  }, 1000)

  return () => clearInterval(interval)
}, [isPaused])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const isLowTime = timeRemaining <= 60 // 1 minute warning
  const isCritical = timeRemaining <= 30 // 30 seconds critical

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold transition-all ${
        isCritical
          ? 'animate-pulse bg-destructive text-destructive-foreground'
          : isLowTime
          ? 'bg-warning text-warning-foreground'
          : 'bg-primary text-primary-foreground'
      }`}
    >
      {isLowTime ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime(timeRemaining)}</span>
      <span className="text-sm font-normal opacity-80">({difficulty})</span>
    </div>
  )
}
