// Utility functions for dynamic post timing

export const getRandomPostTime = (postCreatedAt: string): string => {
  const now = new Date()
  const postDate = new Date(postCreatedAt)
  const actualDiffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))

  // Generate random time between 1 minute to 24 hours ago
  const randomMinutesAgo = Math.floor(Math.random() * (24 * 60 - 1)) + 1 // 1 to 1440 minutes

  // Use actual time if it's reasonable, otherwise use random
  const minutesAgo = actualDiffInMinutes > 0 && actualDiffInMinutes < 24 * 60 ? actualDiffInMinutes : randomMinutesAgo

  return formatTimeAgo(minutesAgo)
}

export const formatTimeAgo = (minutesAgo: number): string => {
  if (minutesAgo < 1) return "Just now"
  if (minutesAgo < 60) return `${minutesAgo}m ago`

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) return `${hoursAgo}h ago`

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 7) return `${daysAgo}d ago`

  const weeksAgo = Math.floor(daysAgo / 7)
  if (weeksAgo < 4) return `${weeksAgo}w ago`

  const monthsAgo = Math.floor(daysAgo / 30)
  return `${monthsAgo}mo ago`
}

// Generate random realistic post times
export const getRandomRealisticTime = (): string => {
  const timeOptions = [
    "Just now",
    "2m ago",
    "5m ago",
    "12m ago",
    "23m ago",
    "45m ago",
    "1h ago",
    "2h ago",
    "3h ago",
    "5h ago",
    "8h ago",
    "12h ago",
    "1d ago",
    "2d ago",
    "3d ago",
    "1w ago",
  ]

  // Weight towards more recent times
  const weights = [
    0.05, // Just now
    0.08, // 2m ago
    0.1, // 5m ago
    0.12, // 12m ago
    0.15, // 23m ago
    0.12, // 45m ago
    0.1, // 1h ago
    0.08, // 2h ago
    0.06, // 3h ago
    0.05, // 5h ago
    0.04, // 8h ago
    0.03, // 12h ago
    0.02, // 1d ago
    0.01, // 2d ago
    0.005, // 3d ago
    0.005, // 1w ago
  ]

  const random = Math.random()
  let cumulativeWeight = 0

  for (let i = 0; i < timeOptions.length; i++) {
    cumulativeWeight += weights[i]
    if (random <= cumulativeWeight) {
      return timeOptions[i]
    }
  }

  return timeOptions[1] // fallback to "2m ago"
}

// Generate random author info
export const getRandomAuthorInfo = () => {
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

// Generate random engagement boost
export const getEngagementBoost = () => {
  return {
    likesBoost: Math.floor(Math.random() * 500) + 100, // 100-600 extra likes
    commentsBoost: Math.floor(Math.random() * 50) + 10, // 10-60 extra comments
    viewsBoost: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 extra views
    sharesBoost: Math.floor(Math.random() * 20) + 5, // 5-25 extra shares
  }
}

// Store post-specific random data in localStorage to maintain consistency
export const getConsistentRandomData = (postId: string) => {
  const storageKey = `post_random_${postId}`
  const stored = localStorage.getItem(storageKey)

  if (stored) {
    return JSON.parse(stored)
  }

  const randomData = {
    timeAgo: getRandomRealisticTime(),
    author: getRandomAuthorInfo(),
    engagement: getEngagementBoost(),
    timestamp: Date.now(),
  }

  // Store for 24 hours, then regenerate
  localStorage.setItem(storageKey, JSON.stringify(randomData))

  // Clean up old entries
  setTimeout(() => {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("post_random_"))
    keys.forEach((key) => {
      const data = JSON.parse(localStorage.getItem(key) || "{}")
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        // 24 hours
        localStorage.removeItem(key)
      }
    })
  }, 1000)

  return randomData
}

// Refresh random data periodically
export const shouldRefreshRandomData = (timestamp: number): boolean => {
  const hoursSinceCreation = (Date.now() - timestamp) / (1000 * 60 * 60)

  // Refresh every 2-6 hours randomly
  const refreshInterval = Math.random() * 4 + 2 // 2-6 hours

  return hoursSinceCreation > refreshInterval
}
