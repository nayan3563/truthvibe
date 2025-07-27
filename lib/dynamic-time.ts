"use client"

import { useEffect } from "react"

import { useState } from "react"

// Dynamic time generation utilities

export const getRandomTimeAgo = (): string => {
  const timeOptions = [
    "Just now",
    "1m ago",
    "2m ago",
    "3m ago",
    "5m ago",
    "8m ago",
    "12m ago",
    "15m ago",
    "23m ago",
    "35m ago",
    "45m ago",
    "1h ago",
    "2h ago",
    "3h ago",
    "4h ago",
    "5h ago",
    "6h ago",
    "8h ago",
    "12h ago",
    "18h ago",
    "1d ago",
    "2d ago",
    "3d ago",
    "4d ago",
    "5d ago",
    "1w ago",
    "2w ago",
  ]

  // Weight distribution - more recent times are more likely
  const weights = [
    0.02, // Just now
    0.03, // 1m ago
    0.04, // 2m ago
    0.05, // 3m ago
    0.06, // 5m ago
    0.07, // 8m ago
    0.08, // 12m ago
    0.09, // 15m ago
    0.1, // 23m ago
    0.08, // 35m ago
    0.07, // 45m ago
    0.06, // 1h ago
    0.08, // 2h ago - Higher weight for 2h ago as requested
    0.05, // 3h ago
    0.04, // 4h ago
    0.04, // 5h ago
    0.03, // 6h ago
    0.03, // 8h ago
    0.02, // 12h ago
    0.02, // 18h ago
    0.015, // 1d ago
    0.01, // 2d ago
    0.008, // 3d ago
    0.006, // 4d ago
    0.004, // 5d ago
    0.003, // 1w ago
    0.002, // 2w ago
  ]

  const random = Math.random()
  let cumulativeWeight = 0

  for (let i = 0; i < timeOptions.length; i++) {
    cumulativeWeight += weights[i]
    if (random <= cumulativeWeight) {
      return timeOptions[i]
    }
  }

  return "2h ago" // Default fallback
}

export const getRandomAuthor = () => {
  const authors = [
    { name: "Social Media", avatar: "SM", color: "from-purple-400 to-pink-400" },
    { name: "Viral Content", avatar: "VC", color: "from-blue-400 to-purple-400" },
    { name: "Trending Now", avatar: "TN", color: "from-green-400 to-blue-400" },
    { name: "Hot Topics", avatar: "HT", color: "from-red-400 to-pink-400" },
    { name: "Buzz Feed", avatar: "BF", color: "from-yellow-400 to-red-400" },
    { name: "Daily Dose", avatar: "DD", color: "from-indigo-400 to-purple-400" },
    { name: "Fresh Content", avatar: "FC", color: "from-teal-400 to-blue-400" },
    { name: "Viral Hub", avatar: "VH", color: "from-pink-400 to-red-400" },
    { name: "News Flash", avatar: "NF", color: "from-orange-400 to-red-400" },
    { name: "Trend Alert", avatar: "TA", color: "from-cyan-400 to-blue-400" },
  ]

  return authors[Math.floor(Math.random() * authors.length)]
}

// Store and manage dynamic data per post
export const getDynamicPostData = (postId: string) => {
  const storageKey = `dynamic_post_${postId}`
  const stored = localStorage.getItem(storageKey)

  if (stored) {
    const data = JSON.parse(stored)

    // Check if data should be refreshed (every 2-5 minutes randomly)
    const now = Date.now()
    const timeSinceUpdate = now - data.lastUpdate
    const refreshInterval = data.refreshInterval || (2 + Math.random() * 3) * 60 * 1000 // 2-5 minutes

    if (timeSinceUpdate > refreshInterval) {
      // Time to refresh
      const newData = {
        timeAgo: getRandomTimeAgo(),
        author: getRandomAuthor(),
        lastUpdate: now,
        refreshInterval: (2 + Math.random() * 3) * 60 * 1000, // New random interval
        viewCount: data.viewCount + Math.floor(Math.random() * 50) + 10, // Increase views
      }

      localStorage.setItem(storageKey, JSON.stringify(newData))
      return newData
    }

    return data
  }

  // Create new data
  const newData = {
    timeAgo: getRandomTimeAgo(),
    author: getRandomAuthor(),
    lastUpdate: Date.now(),
    refreshInterval: (2 + Math.random() * 3) * 60 * 1000, // 2-5 minutes
    viewCount: Math.floor(Math.random() * 1000) + 500, // Initial view count
  }

  localStorage.setItem(storageKey, JSON.stringify(newData))
  return newData
}

// Clean up old localStorage entries
export const cleanupOldPostData = () => {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("dynamic_post_"))
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours

  keys.forEach((key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "{}")
      if (now - data.lastUpdate > maxAge) {
        localStorage.removeItem(key)
      }
    } catch (error) {
      localStorage.removeItem(key) // Remove corrupted data
    }
  })
}

// Hook for dynamic time updates
export const useDynamicTime = (postId: string) => {
  const [dynamicData, setDynamicData] = useState(() => getDynamicPostData(postId))

  useEffect(() => {
    // Set up interval to check for updates every 30 seconds
    const interval = setInterval(() => {
      const newData = getDynamicPostData(postId)
      setDynamicData(newData)
    }, 30 * 1000) // Check every 30 seconds

    // Cleanup old data on mount
    cleanupOldPostData()

    return () => clearInterval(interval)
  }, [postId])

  return dynamicData
}
