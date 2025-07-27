"use client"

import { useState, useEffect } from "react"
import { Clock, Zap } from "lucide-react"

interface TimeUpdateIndicatorProps {
  onUpdate?: () => void
  className?: string
}

export default function TimeUpdateIndicator({ onUpdate, className = "" }: TimeUpdateIndicatorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(
      () => {
        setIsUpdating(true)

        setTimeout(() => {
          setLastUpdate(Date.now())
          setIsUpdating(false)
          onUpdate?.()
        }, 500)
      },
      (2 + Math.random() * 3) * 60 * 1000,
    ) // 2-5 minutes

    return () => clearInterval(interval)
  }, [onUpdate])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isUpdating ? (
        <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
      ) : (
        <Clock className="w-3 h-3 text-gray-400" />
      )}
      <span className="text-xs text-gray-400">{isUpdating ? "Updating..." : "Live"}</span>
    </div>
  )
}
