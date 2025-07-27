"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Facebook, Twitter, MessageCircle, Mail, Copy, Check } from "lucide-react"
import { trackShare } from "@/lib/engagement"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonsProps {
  postId: string
  title: string
  description: string
  url: string
  onShare?: (platform: string) => void
}

export default function ShareButtons({ postId, title, description, url, onShare }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleShare = async (platform: string, shareUrl: string) => {
    try {
      // Track the share
      await trackShare(postId, platform)

      // Open share URL
      window.open(shareUrl, "_blank", "width=600,height=400")

      // Callback
      onShare?.(platform)

      toast({
        title: "Shared!",
        description: `Content shared on ${platform}`,
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)

      // Track copy as share
      await trackShare(postId, "copy_link")

      toast({
        title: "Link Copied!",
        description: "Link has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const shareButtons = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=viral,trending`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`,
    },
    {
      name: "Telegram",
      icon: Share2,
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\nCheck it out: ${url}`)}`,
    },
    {
      name: "LinkedIn",
      icon: Share2,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
  ]

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800">Share this post</h4>

      {/* Main Share Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {shareButtons.map((button) => {
          const IconComponent = button.icon
          return (
            <Button
              key={button.name}
              onClick={() => handleShare(button.name.toLowerCase(), button.url)}
              className={`${button.color} text-white text-xs py-2 px-3 h-auto flex flex-col items-center gap-1`}
              size="sm"
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-xs">{button.name}</span>
            </Button>
          )
        })}
      </div>

      {/* Copy Link Button */}
      <div className="flex gap-2">
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="flex-1 flex items-center gap-2 bg-transparent"
          size="sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>

        {/* Native Share (Mobile) */}
        <Button
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: title,
                  text: description,
                  url: url,
                })
                await trackShare(postId, "native_share")
              } catch (error) {
                console.log("Native share cancelled")
              }
            }
          }}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
          style={{ display: navigator.share ? "flex" : "none" }}
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </Button>
      </div>

      {/* Share URL Display */}
      <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 break-all">{url}</div>
    </div>
  )
}
