-- Useful admin queries for monitoring engagement

-- Get top 10 most engaged posts
SELECT 
    title,
    total_likes,
    total_comments,
    total_views,
    total_shares,
    engagement_rate || '%' as engagement_rate
FROM post_engagement_summary
ORDER BY engagement_rate DESC, total_views DESC
LIMIT 10;

-- Get daily engagement trends (last 30 days)
SELECT 
    date,
    total_interactions,
    likes_count,
    comments_count,
    views_count,
    shares_count
FROM daily_engagement_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- Get most active users (by comments)
SELECT 
    author_name,
    author_email,
    COUNT(*) as total_comments,
    MIN(created_at) as first_comment,
    MAX(created_at) as last_comment
FROM comments
WHERE is_approved = true
GROUP BY author_name, author_email
ORDER BY total_comments DESC
LIMIT 20;

-- Get engagement by platform (shares)
SELECT 
    platform,
    COUNT(*) as total_shares,
    COUNT(DISTINCT post_id) as unique_posts_shared,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM post_shares
GROUP BY platform
ORDER BY total_shares DESC;

-- Get posts with low engagement (need attention)
SELECT 
    p.title,
    p.created_at,
    COALESCE(engagement.total_engagement, 0) as total_engagement,
    COALESCE(views.total_views, 0) as total_views
FROM posts p
LEFT JOIN (
    SELECT 
        post_id,
        COUNT(*) as total_engagement
    FROM (
        SELECT post_id FROM likes
        UNION ALL
        SELECT post_id FROM comments WHERE is_approved = true
        UNION ALL
        SELECT post_id FROM post_shares
    ) all_engagement
    GROUP BY post_id
) engagement ON p.id = engagement.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as total_views
    FROM post_views
    GROUP BY post_id
) views ON p.id = views.post_id
WHERE p.created_at > NOW() - INTERVAL '7 days'
AND COALESCE(engagement.total_engagement, 0) < 5
ORDER BY p.created_at DESC;

-- Get comment moderation queue (if you implement approval system)
SELECT 
    c.id,
    c.author_name,
    c.author_email,
    c.comment_text,
    c.created_at,
    p.title as post_title
FROM comments c
JOIN posts p ON c.post_id = p.id
WHERE c.is_approved = false
ORDER BY c.created_at ASC;

-- Get engagement statistics summary
SELECT 
    'Total Posts' as metric,
    COUNT(*)::text as value
FROM posts
UNION ALL
SELECT 
    'Total Comments' as metric,
    COUNT(*)::text as value
FROM comments WHERE is_approved = true
UNION ALL
SELECT 
    'Total Likes' as metric,
    COUNT(*)::text as value
FROM likes WHERE like_type = 'like'
UNION ALL
SELECT 
    'Total Views' as metric,
    COUNT(*)::text as value
FROM post_views
UNION ALL
SELECT 
    'Total Shares' as metric,
    COUNT(*)::text as value
FROM post_shares
UNION ALL
SELECT 
    'Average Engagement Rate' as metric,
    ROUND(AVG(engagement_rate), 2)::text || '%' as value
FROM post_engagement_summary
WHERE total_views > 0;
