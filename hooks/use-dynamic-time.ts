"use client"

import { useState, useEffect } from "react"
import { getRandomRealisticTime } from "@/lib/time-utils"

export const useDynamicTime = (initialTime?: string, refreshInterval: number = 5 * 60 * 1000) => {
  const [timeAgo, setTimeAgo] = useState(initialTime || getRandomRealisticTime())

  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance to update time on each interval
      if (Math.random() < 0.3) {
        setTimeAgo(getRandomRealisticTime())
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  return timeAgo
}

export const useRandomAuthor = () => {
  const [author] = useState(() => {
    const authors = [
      { name: "Social Media", avatar: "SM", color: "from-purple-400 to-pink-400" },
      { name: "Viral Content", avatar: "VC", color: "from-blue-400 to-purple-400" },
      { name: "Trending Now", avatar: "TN", color: "from-green-400 to-blue-400" },
      { name: "Hot Topics", avatar: "HT", color: "from-red-400 to-pink-400" },
      { name: "Buzz Feed", avatar: "BF", color: "from-yellow-400 to-red-400" },
      { name: "Daily Dose", avatar: "DD", color: "from-indigo-400 to-purple-400" },
      { name: "Fresh Content", avatar: "FC", color: "from-teal-400 to-blue-400" },
      { name: "Viral Hub", avatar: "VH", color: "from-pink-400 to-red-400" },
    ]

    return authors[Math.floor(Math.random() * authors.length)]
  })

  return author
}
