import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getBestThumbnail } from "@/lib/cloudinary"
import PostView from "@/components/post-view"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ linkId: string }>
}

async function getPostData(linkId: string) {
  const { data: linkData, error: linkError } = await supabase
    .from("generated_links")
    .select(`
      *,
      posts (*)
    `)
    .eq("link_id", linkId)
    .single()

  if (linkError || !linkData) {
    return null
  }

  return {
    link: linkData,
    post: linkData.posts,
  }
}

// Helper function to ensure absolute URL for images
function getAbsoluteImageUrl(thumbnail: string, siteUrl: string): string {
  // If it's already an absolute URL, return as is
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail
  }
  // If it's a relative URL or placeholder, use default OG image
  if (thumbnail.startsWith("/placeholder") || thumbnail.startsWith("/")) {
    return `${siteUrl}/og-image.png`
  }
  return `${siteUrl}/og-image.png`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { linkId } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://truthvibe.vercel.app"
  const data = await getPostData(linkId)

  if (!data) {
    return {
      metadataBase: new URL(siteUrl),
      title: "Post Not Found",
      description: "The requested post could not be found.",
    }
  }

  const { post } = data

  // Enhanced title and description handling
  const title = post.title?.trim() || post.description?.trim() || "Amazing Social Media Content"
  const description =
    post.description?.trim() || post.title?.trim() || "Check out this amazing content! Don't miss this viral post."

  // Enhanced thumbnail selection with fallback - ensure absolute URL
  const rawThumbnail = getBestThumbnail(post)
  const thumbnail = getAbsoluteImageUrl(rawThumbnail, siteUrl)

  const postUrl = `${siteUrl}/post/${linkId}`

  return {
    metadataBase: new URL(siteUrl),
    title: title,
    description: description,
    keywords: ["social media", "viral content", "entertainment", "video", "streaming", "cricket", "sports"],
    authors: [{ name: "TruthVibe" }],
    creator: "TruthVibe",
    publisher: "TruthVibe",

    // Enhanced Open Graph tags
    openGraph: {
      title: title,
      description: description,
      url: postUrl,
      siteName: "TruthVibe - Social Media Hub",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/jpeg",
        },
      ],
    },

    // Enhanced Twitter Card tags
    twitter: {
      card: "summary_large_image",
      site: "@TruthVibe",
      creator: "@TruthVibe",
      title: title,
      description: description,
      images: [thumbnail],
    },

    // Robots and indexing
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { linkId } = await params
  const data = await getPostData(linkId)

  if (!data) {
    notFound()
  }

  const { post } = data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://truthvibe.vercel.app"
  const title = post.title?.trim() || post.description?.trim() || "Amazing Social Media Content"
  const description = post.description?.trim() || post.title?.trim() || "Check out this amazing content!"
  const rawThumbnail = getBestThumbnail(post)
  const thumbnail = getAbsoluteImageUrl(rawThumbnail, siteUrl)
  const postUrl = `${siteUrl}/post/${linkId}`

  return (
    <>
      {/* Enhanced structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: description,
            image: [thumbnail],
            author: {
              "@type": "Organization",
              name: "TruthVibe",
              url: siteUrl,
            },
            publisher: {
              "@type": "Organization",
              name: "TruthVibe",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/og-image.png`,
                width: 1200,
                height: 630,
              },
            },
            datePublished: post.created_at,
            dateModified: post.created_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": postUrl,
            },
            articleSection: "Entertainment",
            keywords: "viral, social media, entertainment, video, streaming",
          }),
        }}
      />

      <PostView post={data.post} />
    </>
  )
}
