import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xgrsdxluhhupnmqdmpfd.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncnNkeGx1aGh1cG5tcWRtcGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDM2OTksImV4cCI6MjA2ODkxOTY5OX0.9U6t6oeaX90NzZtVL9iwTeuK4ew3DlKwIHg3TT4b9rc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string | null
  description: string | null
  embed_code: string | null
  media_url: string | null
  media_type: string | null
  thumbnail_url: string | null
  redirect_link: string | null
  popunder_ad: string | null
  created_at: string
}

export type GeneratedLink = {
  id: string
  post_id: string
  link_id: string
  title: string | null
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  author_name: string
  author_email: string | null
  comment_text: string
  is_approved: boolean
  created_at: string
}

export type Like = {
  id: string
  post_id: string
  user_identifier: string
  like_type: "like" | "dislike"
  created_at: string
}

export type PostView = {
  id: string
  post_id: string
  user_identifier: string
  user_agent: string | null
  referrer: string | null
  created_at: string
}

export type PostShare = {
  id: string
  post_id: string
  platform: string
  user_identifier: string | null
  created_at: string
}

export type PostEngagement = {
  real_likes: number
  real_dislikes: number
  real_comments: number
  real_views: number
  real_shares: number
}
