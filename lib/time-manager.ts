"use client"

import { useEffect } from "react"

import { useState } from "react"

// Comprehensive time management for posts

interface PostTimeData {
  timeAgo: string
  author: {
    name: string
    avatar: string
    color: string
  }
  lastUpdate: number
  refreshInterval: number
  updateCount: number
}

class TimeManager {
  private static instance: TimeManager
  private postData: Map<string, PostTimeData> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): TimeManager {
    if (!TimeManager.instance) {
      TimeManager.instance = new TimeManager()
    }
    return TimeManager.instance
  }

  getPostTime(postId: string): PostTimeData {
    if (!this.postData.has(postId)) {
      this.initializePost(postId)
    }
    return this.postData.get(postId)!
  }

  private initializePost(postId: string) {
    const data: PostTimeData = {
      timeAgo: this.getRandomTimeAgo(),
      author: this.getRandomAuthor(),
      lastUpdate: Date.now(),
      refreshInterval: this.getRandomInterval(),
      updateCount: 0,
    }

    this.postData.set(postId, data)
    this.startAutoUpdate(postId)
  }

  private startAutoUpdate(postId: string) {
    const data = this.postData.get(postId)!

    const interval = setInterval(() => {
      const updatedData = {
        ...data,
        timeAgo: this.getRandomTimeAgo(),
        lastUpdate: Date.now(),
        refreshInterval: this.getRandomInterval(),
        updateCount: data.updateCount + 1,
      }

      this.postData.set(postId, updatedData)

      // Emit custom event for components to listen
      window.dispatchEvent(
        new CustomEvent(`timeUpdate_${postId}`, {
          detail: updatedData,
        }),
      )
    }, data.refreshInterval)

    this.intervals.set(postId, interval)
  }

  private getRandomTimeAgo(): string {
    const options = [
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
    ]

    // Weighted selection favoring recent times
    const weights = [
      0.08, 0.07, 0.08, 0.06, 0.07, 0.06, 0.05, 0.05, 0.04, 0.04, 0.04, 0.05, 0.1, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02,
      0.01, 0.01, 0.008, 0.006, 0.004, 0.002, 0.001,
    ]

    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < options.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return options[i]
      }
    }

    return "2h ago"
  }

  private getRandomAuthor() {
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
  }

  private getRandomInterval(): number {
    return (2 + Math.random() * 3) * 60 * 1000 // 2-5 minutes
  }

  cleanup(postId: string) {
    const interval = this.intervals.get(postId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(postId)
    }
    this.postData.delete(postId)
  }

  cleanupAll() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
    this.postData.clear()
  }
}

export const timeManager = TimeManager.getInstance()

// Hook to use time manager
export const useTimeManager = (postId: string) => {
  const [timeData, setTimeData] = useState(() => timeManager.getPostTime(postId))

  useEffect(() => {
    const handleTimeUpdate = (event: CustomEvent) => {
      setTimeData(event.detail)
    }

    window.addEventListener(`timeUpdate_${postId}`, handleTimeUpdate as EventListener)

    return () => {
      window.removeEventListener(`timeUpdate_${postId}`, handleTimeUpdate as EventListener)
    }
  }, [postId])

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      timeManager.cleanup(postId)
    }
  }, [postId])

  return timeData
}
