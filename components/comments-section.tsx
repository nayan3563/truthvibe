"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Send, User } from "lucide-react"
import { addComment, getPostComments } from "@/lib/engagement"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/supabase"
import { getRandomRealisticTime } from "@/lib/time-utils"

interface CommentsSectionProps {
  postId: string
  realCommentsCount: number
  onCommentAdded?: () => void
}

export default function CommentsSection({ postId, realCommentsCount, onCommentAdded }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  })
  const { toast } = useToast()

  // Load comments
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const commentsData = await getPostComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.comment.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and comment are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const newComment = await addComment(postId, formData.name, formData.comment, formData.email)

      // Add to local state
      setComments((prev) => [newComment, ...prev])

      // Reset form
      setFormData({ name: "", email: "", comment: "" })
      setShowCommentForm(false)

      // Callback
      onCommentAdded?.()

      toast({
        title: "Comment Added!",
        description: "Your comment has been posted successfully",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // For very recent comments (less than 5 minutes), show actual time
    if (diffInSeconds < 300) {
      if (diffInSeconds < 60) return "Just now"
      return `${Math.floor(diffInSeconds / 60)}m ago`
    }

    // For older comments, use random realistic time
    return getRandomRealisticTime()
  }

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({realCommentsCount + comments.length})
        </h3>
        <Button onClick={() => setShowCommentForm(!showCommentForm)} size="sm" variant="outline">
          {showCommentForm ? "Cancel" : "Add Comment"}
        </Button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Write your comment here..."
                  rows={3}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                  <span className="text-xs text-gray-500">•</span>
                  <p className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No comments yet</p>
            <p className="text-sm text-gray-400">Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
