-- Create views for easy analytics queries

-- View for post engagement summary
CREATE OR REPLACE VIEW post_engagement_summary AS
SELECT 
    p.id as post_id,
    p.title,
    p.created_at as post_created_at,
    COALESCE(likes_count.total, 0) as total_likes,
    COALESCE(dislikes_count.total, 0) as total_dislikes,
    COALESCE(comments_count.total, 0) as total_comments,
    COALESCE(views_count.total, 0) as total_views,
    COALESCE(shares_count.total, 0) as total_shares,
    -- Engagement rate calculation
    CASE 
        WHEN COALESCE(views_count.total, 0) > 0 
        THEN ROUND(
            (COALESCE(likes_count.total, 0) + COALESCE(comments_count.total, 0) + COALESCE(shares_count.total, 0)) * 100.0 / views_count.total, 
            2
        )
        ELSE 0 
    END as engagement_rate
FROM posts p
LEFT JOIN (
    SELECT post_id, COUNT(*) as total 
    FROM likes 
    WHERE like_type = 'like' 
    GROUP BY post_id
) likes_count ON p.id = likes_count.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as total 
    FROM likes 
    WHERE like_type = 'dislike' 
    GROUP BY post_id
) dislikes_count ON p.id = dislikes_count.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as total 
    FROM comments 
    WHERE is_approved = true 
    GROUP BY post_id
) comments_count ON p.id = comments_count.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as total 
    FROM post_views 
    GROUP BY post_id
) views_count ON p.id = views_count.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as total 
    FROM post_shares 
    GROUP BY post_id
) shares_count ON p.id = shares_count.post_id;

-- View for daily engagement stats
CREATE OR REPLACE VIEW daily_engagement_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_interactions,
    COUNT(*) FILTER (WHERE table_name = 'likes') as likes_count,
    COUNT(*) FILTER (WHERE table_name = 'comments') as comments_count,
    COUNT(*) FILTER (WHERE table_name = 'views') as views_count,
    COUNT(*) FILTER (WHERE table_name = 'shares') as shares_count
FROM (
    SELECT created_at, 'likes' as table_name FROM likes
    UNION ALL
    SELECT created_at, 'comments' as table_name FROM comments WHERE is_approved = true
    UNION ALL
    SELECT created_at, 'views' as table_name FROM post_views
    UNION ALL
    SELECT created_at, 'shares' as table_name FROM post_shares
) all_engagement
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for top performing posts
CREATE OR REPLACE VIEW top_performing_posts AS
SELECT 
    post_id,
    title,
    total_likes,
    total_comments,
    total_views,
    total_shares,
    engagement_rate,
    post_created_at
FROM post_engagement_summary
WHERE total_views > 0
ORDER BY engagement_rate DESC, total_views DESC
LIMIT 50;
