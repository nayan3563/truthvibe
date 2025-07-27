import { supabase } from "./supabase"
import type { PostEngagement } from "./supabase"

// Get user identifier (IP-based for anonymous users)
export const getUserIdentifier = (): string => {
  // In a real app, you might use user ID if logged in
  // For now, we'll use a combination of browser fingerprint
  const fingerprint = `${navigator.userAgent}_${screen.width}x${screen.height}_${Intl.DateTimeFormat().resolvedOptions().timeZone}`
  return btoa(fingerprint).substring(0, 20) // Base64 encode and truncate
}

// Track post view
export const trackPostView = async (postId: string) => {
  try {
    const userIdentifier = getUserIdentifier()

    // Check if already viewed by this user today
    const today = new Date().toISOString().split("T")[0]
    const { data: existingView } = await supabase
      .from("post_views")
      .select("id")
      .eq("post_id", postId)
      .eq("user_identifier", userIdentifier)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .single()

    if (!existingView) {
      await supabase.from("post_views").insert({
        post_id: postId,
        user_identifier: userIdentifier,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      })
    }
  } catch (error) {
    console.error("Error tracking view:", error)
  }
}

// Get post engagement stats
export const getPostEngagement = async (postId: string): Promise<PostEngagement> => {
  try {
    // Get real likes count
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("like_type", "like")

    // Get real dislikes count
    const { count: dislikesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("like_type", "dislike")

    // Get real comments count
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("is_approved", true)

    // Get real views count
    const { count: viewsCount } = await supabase
      .from("post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)

    // Get real shares count
    const { count: sharesCount } = await supabase
      .from("post_shares")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)

    return {
      real_likes: likesCount || 0,
      real_dislikes: dislikesCount || 0,
      real_comments: commentsCount || 0,
      real_views: viewsCount || 0,
      real_shares: sharesCount || 0,
    }
  } catch (error) {
    console.error("Error getting engagement:", error)
    return {
      real_likes: 0,
      real_dislikes: 0,
      real_comments: 0,
      real_views: 0,
      real_shares: 0,
    }
  }
}

// Toggle like/dislike
export const toggleLike = async (postId: string, likeType: "like" | "dislike") => {
  try {
    const userIdentifier = getUserIdentifier()

    // Check if user already liked/disliked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_identifier", userIdentifier)
      .single()

    if (existingLike) {
      if (existingLike.like_type === likeType) {
        // Remove like/dislike if clicking same button
        await supabase.from("likes").delete().eq("id", existingLike.id)
        return "removed"
      } else {
        // Update like type if clicking opposite button
        await supabase.from("likes").update({ like_type: likeType }).eq("id", existingLike.id)
        return "updated"
      }
    } else {
      // Add new like/dislike
      await supabase.from("likes").insert({
        post_id: postId,
        user_identifier: userIdentifier,
        like_type: likeType,
      })
      return "added"
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}

// Add comment
export const addComment = async (postId: string, authorName: string, commentText: string, authorEmail?: string) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_name: authorName.trim(),
        author_email: authorEmail?.trim() || null,
        comment_text: commentText.trim(),
        is_approved: true, // Auto-approve for now
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Get comments for a post
export const getPostComments = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting comments:", error)
    return []
  }
}

// Track share
export const trackShare = async (postId: string, platform: string) => {
  try {
    const userIdentifier = getUserIdentifier()

    await supabase.from("post_shares").insert({
      post_id: postId,
      platform: platform,
      user_identifier: userIdentifier,
    })
  } catch (error) {
    console.error("Error tracking share:", error)
  }
}

// Get user's like status for a post
export const getUserLikeStatus = async (postId: string): Promise<"like" | "dislike" | null> => {
  try {
    const userIdentifier = getUserIdentifier()

    const { data } = await supabase
      .from("likes")
      .select("like_type")
      .eq("post_id", postId)
      .eq("user_identifier", userIdentifier)
      .single()

    return data?.like_type || null
  } catch (error) {
    return null
  }
}
