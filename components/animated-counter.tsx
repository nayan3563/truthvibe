"use client"

import { useState, useEffect } from "react"

interface AnimatedCounterProps {
  initialValue: number
  increment?: number
  interval?: number
  className?: string
}

export default function AnimatedCounter({
  initialValue,
  increment = 1,
  interval = 5000,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(initialValue)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(
      () => {
        // Random chance to increment (70% chance)
        if (Math.random() < 0.7) {
          setIsAnimating(true)

          setTimeout(() => {
            setCount((prev) => prev + Math.floor(Math.random() * increment) + 1)
            setIsAnimating(false)
          }, 200)
        }
      },
      interval + Math.random() * 3000,
    ) // Add some randomness to interval

    return () => clearInterval(timer)
  }, [increment, interval])

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  return (
    <span className={`transition-all duration-200 ${isAnimating ? "text-green-500 scale-110" : ""} ${className}`}>
      {formatNumber(count)}
    </span>
  )
}
