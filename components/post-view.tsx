"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Eye, Share2, ThumbsUp, ThumbsDown } from "lucide-react"
import { extractYouTubeVideoId, extractVideoId } from "@/lib/cloudinary"
import { trackPostView, getPostEngagement, toggleLike, getUserLikeStatus } from "@/lib/engagement"
import ShareButtons from "@/components/share-buttons"
import CommentsSection from "@/components/comments-section"
import type { Post, PostEngagement } from "@/lib/supabase"
import { getConsistentRandomData, shouldRefreshRandomData } from "@/lib/time-utils"
import { useDynamicTime } from "@/lib/dynamic-time"
import LiveTimeIndicator from "@/components/live-time-indicator"
import AnimatedCounter from "@/components/animated-counter"

interface PostViewProps {
  post: Post
}

// Function to generate a random realistic time ago string
const getRandomRealisticTime = () => {
  const now = new Date()
  const minuteAgo = new Date(now.getTime() - 60000)
  const hourAgo = new Date(now.getTime() - 3600000)
  const dayAgo = new Date(now.getTime() - 86400000)

  const timeOptions = [
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 59) + 1} minutes ago`,
    `${Math.floor(Math.random() * 23) + 1} hours ago`,
    `${Math.floor(Math.random() * 23) + 1} hours ago`,
    `${Math.floor(Math.random() * 23) + 1} hours ago`,
    `${Math.floor(Math.random() * 23) + 1} hours ago`,
    `${Math.floor(Math.random() * 23) + 1} hours ago`,
    `${Math.floor(Math.random() * 6) + 1} days ago`,
    `${Math.floor(Math.random() * 6) + 1} days ago`,
    `${Math.floor(Math.random() * 6) + 1} days ago`,
    `${Math.floor(Math.random() * 6) + 1} days ago`,
    `${Math.floor(Math.random() * 6) + 1} days ago`,
  ]

  return timeOptions[Math.floor(Math.random() * timeOptions.length)]
}

export default function PostView({ post }: PostViewProps) {
  const [showOverlay, setShowOverlay] = useState(true)
  const [dynamicData, setDynamicData] = useState(() => getConsistentRandomData(post.id))
  const dynamicTimeData = useDynamicTime(post.id)
  const [realEngagement, setRealEngagement] = useState<PostEngagement>({
    real_likes: 0,
    real_dislikes: 0,
    real_comments: 0,
    real_views: 0,
    real_shares: 0,
  })
  const [userLikeStatus, setUserLikeStatus] = useState<"like" | "dislike" | null>(null)
  const [isLiking, setIsLiking] = useState(false)
  const [showShareButtons, setShowShareButtons] = useState(false)

  // Dynamic fake comments
  const [fakeComments] = useState(() => {
    const commentTemplates = [
      {
        name: "Alex Johnson",
        comment: "This is amazing! Thanks for sharing 🔥",
        avatar: "AJ",
        color: "from-blue-400 to-purple-400",
      },
      {
        name: "Sarah Chen",
        comment: "Exactly what I was looking for!",
        avatar: "SC",
        color: "from-green-400 to-blue-400",
      },
      {
        name: "Mike Rodriguez",
        comment: "Great content as always 👍",
        avatar: "MR",
        color: "from-red-400 to-pink-400",
      },
      { name: "Emily Davis", comment: "Love this! Keep it up! 💯", avatar: "ED", color: "from-yellow-400 to-red-400" },
      {
        name: "David Wilson",
        comment: "This helped me a lot, thank you!",
        avatar: "DW",
        color: "from-indigo-400 to-purple-400",
      },
      {
        name: "Lisa Anderson",
        comment: "Shared with all my friends! 🔥",
        avatar: "LA",
        color: "from-pink-400 to-red-400",
      },
      {
        name: "John Smith",
        comment: "Mind blown! 🤯 How did you do this?",
        avatar: "JS",
        color: "from-teal-400 to-blue-400",
      },
      {
        name: "Maria Garcia",
        comment: "Perfect timing for this content!",
        avatar: "MG",
        color: "from-purple-400 to-pink-400",
      },
      {
        name: "James Brown",
        comment: "This is gold! Thanks for sharing 🏆",
        avatar: "JB",
        color: "from-orange-400 to-red-400",
      },
      { name: "Anna Taylor", comment: "Really well explained! 👏", avatar: "AT", color: "from-cyan-400 to-blue-400" },
    ]

    // Select 2-4 random comments
    const numComments = Math.floor(Math.random() * 3) + 2
    const shuffled = [...commentTemplates].sort(() => 0.5 - Math.random())

    return shuffled.slice(0, numComments).map((comment, index) => ({
      ...comment,
      time: getRandomRealisticTime(),
      id: `fake_${index}`,
    }))
  })

  // Debug logging
  useEffect(() => {
    console.log("Post data:", post)
    console.log("Show Overlay:", showOverlay)
  }, [post, showOverlay])

  // Track view and load engagement data
  useEffect(() => {
    const initializePost = async () => {
      // Track view
      await trackPostView(post.id)

      // Load engagement data
      const engagement = await getPostEngagement(post.id)
      setRealEngagement(engagement)

      // Get user's like status
      const likeStatus = await getUserLikeStatus(post.id)
      setUserLikeStatus(likeStatus)
    }

    initializePost()
  }, [post.id])

  // Enhanced popunder ad functionality
  useEffect(() => {
    if (post.popunder_ad) {
      let popunderTriggered = false

      const handleClick = (event: MouseEvent) => {
        // Prevent multiple popunders
        if (popunderTriggered) return

        // Don't trigger on Skip Ad button
        const target = event.target as HTMLElement
        if (target.closest("[data-skip-ad]")) return

        popunderTriggered = true

        try {
          // Method 1: Execute ad code directly in current page
          const script = document.createElement("script")

          // Check if it's a script src or inline script
          if (post.popunder_ad.includes("src=")) {
            // Extract src URL from the ad code
            const srcMatch = post.popunder_ad.match(/src=['"]([^'"]+)['"]/)
            if (srcMatch) {
              script.src = srcMatch[1]
              script.type = "text/javascript"
              script.async = true

              // Add error handling
              script.onerror = () => {
                console.error("Failed to load popunder script")
              }

              script.onload = () => {
                console.log("Popunder script loaded successfully")
              }

              document.head.appendChild(script)
            }
          } else {
            // For inline scripts
            script.innerHTML = post.popunder_ad
            script.type = "text/javascript"
            document.head.appendChild(script)
          }

          // Method 2: Alternative approach - create hidden iframe
          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          iframe.style.width = "1px"
          iframe.style.height = "1px"
          iframe.style.position = "absolute"
          iframe.style.left = "-9999px"
          iframe.style.top = "-9999px"

          document.body.appendChild(iframe)

          // Write ad code to iframe
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            iframeDoc.open()
            iframeDoc.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Ad</title>
              </head>
              <body>
                ${post.popunder_ad}
              </body>
              </html>
            `)
            iframeDoc.close()
          }

          // Clean up after 10 seconds
          setTimeout(() => {
            try {
              if (script.parentNode) {
                script.parentNode.removeChild(script)
              }
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe)
              }
            } catch (e) {
              console.error("Cleanup error:", e)
            }
          }, 10000)
        } catch (error) {
          console.error("Popunder error:", error)

          // Fallback: Simple script injection
          try {
            const fallbackScript = document.createElement("script")
            fallbackScript.innerHTML = post.popunder_ad.replace(/<script[^>]*>|<\/script>/gi, "")
            document.body.appendChild(fallbackScript)

            setTimeout(() => {
              try {
                if (fallbackScript.parentNode) {
                  fallbackScript.parentNode.removeChild(fallbackScript)
                }
              } catch (e) {}
            }, 5000)
          } catch (fallbackError) {
            console.error("Fallback popunder error:", fallbackError)
          }
        }

        // Reset after 10 seconds to allow another popunder
        setTimeout(() => {
          popunderTriggered = false
        }, 10000)
      }

      // Add click listener to entire document
      document.addEventListener("click", handleClick)

      return () => {
        document.removeEventListener("click", handleClick)
      }
    }
  }, [post.popunder_ad])

  const handleSkipAd = () => {
    console.log("Skip Ad clicked, hiding overlay...")
    setShowOverlay(false)
    if (post.redirect_link) {
      window.open(post.redirect_link, "_blank")
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title || post.description || "Check out this post!",
      text: post.description || post.title || "Amazing content to share",
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError)
      }
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  const handleLike = async (likeType: "like" | "dislike") => {
    try {
      setIsLiking(true)
      await toggleLike(post.id, likeType)

      // Refresh engagement data
      const engagement = await getPostEngagement(post.id)
      setRealEngagement(engagement)

      // Update user like status
      const newLikeStatus = await getUserLikeStatus(post.id)
      setUserLikeStatus(newLikeStatus)
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleCommentAdded = async () => {
    // Refresh engagement data when comment is added
    const engagement = await getPostEngagement(post.id)
    setRealEngagement(engagement)
  }

  // Completely rewritten embed processing for mobile compatibility
  const processEmbedCode = (embedCode: string): string => {
    if (!embedCode) return embedCode

    // For mobile compatibility, we'll create a completely new iframe structure
    // Extract the src URL from the original iframe
    const srcMatch = embedCode.match(/src=['"]([^'"]+)['"]/)
    if (!srcMatch) return embedCode

    const srcUrl = srcMatch[1]

    // Create a new iframe with mobile-optimized attributes
    const newIframe = `
      <iframe 
        src="${srcUrl}"
        width="100%"
        height="520"
        style="border: none; outline: none; width: 100%; height: 520px; min-height: 400px; display: block;"
        allowfullscreen="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; camera; microphone; payment; geolocation; autoplay"
        referrerpolicy="no-referrer-when-downgrade"
        loading="eager"
        title="Video Player"
      >
        Your browser does not support iframes.
      </iframe>
    `

    return newIframe
  }

  const renderVideoFromUrl = (videoUrl: string) => {
    const videoInfo = extractVideoId(videoUrl)

    if (videoInfo) {
      switch (videoInfo.platform) {
        case "youtube":
          return (
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoInfo.videoId}?enablejsapi=1&controls=1&modestbranding=1&rel=0`}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                title="YouTube video"
                frameBorder="0"
              />
            </div>
          )

        case "vimeo":
          return (
            <div className="relative w-full aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${videoInfo.videoId}?title=0&byline=0&portrait=0`}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                title="Vimeo video"
                frameBorder="0"
              />
            </div>
          )

        case "tiktok":
          return (
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.tiktok.com/embed/v2/${videoInfo.videoId}`}
                className="w-full h-full"
                allowFullScreen
                allow="encrypted-media"
                title="TikTok video"
                frameBorder="0"
              />
            </div>
          )

        default:
          // For other platforms or direct video URLs, try to render as video element
          return (
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video rounded-lg object-cover"
              controlsList="nodownload"
              preload="metadata"
            />
          )
      }
    }

    // If no platform detected, try as direct video URL
    return (
      <video
        src={videoUrl}
        controls
        className="w-full aspect-video rounded-lg object-cover"
        controlsList="nodownload"
        preload="metadata"
      />
    )
  }

  const renderMedia = () => {
    // Priority 1: Embed Code
    if (post.embed_code) {
      // Handle YouTube embeds
      const videoId = extractYouTubeVideoId(post.embed_code)
      if (videoId) {
        return (
          <div className="relative w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1&modestbranding=1&rel=0`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              title="YouTube video"
              frameBorder="0"
            />
          </div>
        )
      }

      // Handle other embeds with completely rewritten processing
      const processedEmbedCode = processEmbedCode(post.embed_code)

      return (
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ minHeight: "520px" }}>
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: processedEmbedCode }}
            style={{ minHeight: "520px" }}
          />
        </div>
      )
    }

    // Priority 2: Uploaded Media
    if (post.media_url) {
      if (post.media_type === "video") {
        return (
          <video
            src={post.media_url}
            controls
            className="w-full aspect-video rounded-lg object-cover"
            controlsList="nodownload"
            preload="metadata"
          />
        )
      } else {
        return (
          <img
            src={post.media_url || "/placeholder.svg"}
            alt={post.title || "Post image"}
            className="w-full aspect-video rounded-lg object-cover"
          />
        )
      }
    }

    return (
      <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No media content</p>
      </div>
    )
  }

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (shouldRefreshRandomData(dynamicData.timestamp)) {
          const newData = getConsistentRandomData(post.id)
          setDynamicData(newData)
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [post.id, dynamicData.timestamp])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content Container */}
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* All post content here */}
        <div className="p-4 space-y-4">
          {/* Post Header */}
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${dynamicTimeData.author.color} rounded-full flex items-center justify-center`}
            >
              <span className="text-white font-bold text-sm">{dynamicTimeData.author.avatar}</span>
            </div>
            <div>
              <p className="font-semibold">{dynamicTimeData.author.name}</p>
              <LiveTimeIndicator postId={post.id} className="text-sm text-gray-500" />
            </div>
          </div>

          {/* Post Title */}
          {post.title && <h1 className="text-xl font-bold">{post.title}</h1>}

          {/* Media Content */}
          <div className="relative">{renderMedia()}</div>

          {/* Post Description - Now below media */}
          {post.description && (
            <div className="space-y-2">
              <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
            </div>
          )}

          {/* Enhanced Post Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <button
                onClick={() => handleLike("like")}
                disabled={isLiking}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikeStatus === "like" ? "text-red-500" : "text-gray-600 hover:text-red-500"
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${userLikeStatus === "like" ? "fill-current" : ""}`} />
                <span className="text-sm">
                  {formatNumber(dynamicData.engagement.likesBoost + realEngagement.real_likes)}
                </span>
              </button>

              {/* Dislike Button */}
              <button
                onClick={() => handleLike("dislike")}
                disabled={isLiking}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikeStatus === "dislike" ? "text-blue-500" : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${userLikeStatus === "dislike" ? "fill-current" : ""}`} />
                <span className="text-sm">{formatNumber(realEngagement.real_dislikes)}</span>
              </button>

              {/* Comments */}
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">
                  {formatNumber(dynamicData.engagement.commentsBoost + realEngagement.real_comments)}
                </span>
              </div>

              {/* Views */}
              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="w-5 h-5" />
                <AnimatedCounter
                  initialValue={dynamicTimeData.viewCount + realEngagement.real_views}
                  increment={5}
                  interval={8000}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setShowShareButtons(!showShareButtons)}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share ({realEngagement.real_shares})</span>
            </button>
          </div>

          {/* Share Buttons Section */}
          {showShareButtons && (
            <div className="pt-4 border-t">
              <ShareButtons
                postId={post.id}
                title={post.title || post.description || "Amazing content!"}
                description={post.description || post.title || "Check out this amazing content!"}
                url={window.location.href}
                onShare={(platform) => {
                  console.log(`Shared on ${platform}`)
                  // Refresh engagement data
                  getPostEngagement(post.id).then(setRealEngagement)
                }}
              />
            </div>
          )}

          {/* Real Comments Section */}
          <div className="pt-4 border-t">
            <CommentsSection
              postId={post.id}
              realCommentsCount={realEngagement.real_comments}
              onCommentAdded={handleCommentAdded}
            />
          </div>

          {/* Fake Comments Section */}
          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold mb-3">Comments</h2>
            {fakeComments.map((comment, index) => (
              <div key={comment.id} className="flex space-x-3">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${comment.color} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-bold">{comment.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="font-semibold text-sm">{comment.name}</p>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{comment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Page Overlay - Covers everything */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <Button
              onClick={handleSkipAd}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3"
              data-skip-ad="true"
            >
              Skip Ad
            </Button>
            <p className="text-white text-sm mt-2">Click to continue</p>
          </div>
        </div>
      )}
    </div>
  )
}
