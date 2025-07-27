"use client"

import { useState, useEffect } from "react"
import { getRandomTimeAgo } from "@/lib/dynamic-time"

interface LiveTimeIndicatorProps {
  postId: string
  className?: string
}

export default function LiveTimeIndicator({ postId, className = "" }: LiveTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState(() => getRandomTimeAgo())
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Update time every 2-5 minutes randomly
    const getRandomInterval = () => (2 + Math.random() * 3) * 60 * 1000 // 2-5 minutes

    const updateTime = () => {
      setIsUpdating(true)

      // Small delay to show update animation
      setTimeout(() => {
        setTimeAgo(getRandomTimeAgo())
        setIsUpdating(false)
      }, 300)
    }

    let interval = setInterval(updateTime, getRandomInterval())

    // Reset interval with new random time after each update
    const resetInterval = () => {
      clearInterval(interval)
      interval = setInterval(updateTime, getRandomInterval())
    }

    // Reset interval every time we update
    const intervalResetter = setInterval(resetInterval, getRandomInterval())

    return () => {
      clearInterval(interval)
      clearInterval(intervalResetter)
    }
  }, [postId])

  return (
    <span
      className={`transition-all duration-300 ${isUpdating ? "opacity-50 scale-95" : "opacity-100 scale-100"} ${className}`}
    >
      {timeAgo}
    </span>
  )
}
