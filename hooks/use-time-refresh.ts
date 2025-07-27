"use client"

import { useState, useEffect } from "react"
import { getRandomTimeAgo } from "@/lib/dynamic-time"

export const useTimeRefresh = (postId: string, refreshInterval?: number) => {
  const [timeAgo, setTimeAgo] = useState(() => getRandomTimeAgo())
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    // Default refresh interval: 2-5 minutes
    const interval = refreshInterval || (2 + Math.random() * 3) * 60 * 1000

    const timer = setInterval(() => {
      setTimeAgo(getRandomTimeAgo())
      setLastUpdate(Date.now())
    }, interval)

    return () => clearInterval(timer)
  }, [postId, refreshInterval])

  return { timeAgo, lastUpdate }
}

export const useRandomRefresh = (callback: () => void, minInterval = 2, maxInterval = 5) => {
  useEffect(() => {
    const getRandomInterval = () => (minInterval + Math.random() * (maxInterval - minInterval)) * 60 * 1000

    let timer = setTimeout(function tick() {
      callback()
      timer = setTimeout(tick, getRandomInterval())
    }, getRandomInterval())

    return () => clearTimeout(timer)
  }, [callback, minInterval, maxInterval])
}
