-- Useful functions for engagement analytics

-- Function to get engagement stats for a specific post
CREATE OR REPLACE FUNCTION get_post_engagement_stats(post_uuid UUID)
RETURNS TABLE(
    likes_count BIGINT,
    dislikes_count BIGINT,
    comments_count BIGINT,
    views_count BIGINT,
    shares_count BIGINT,
    engagement_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(l.likes, 0) as likes_count,
        COALESCE(d.dislikes, 0) as dislikes_count,
        COALESCE(c.comments, 0) as comments_count,
        COALESCE(v.views, 0) as views_count,
        COALESCE(s.shares, 0) as shares_count,
        CASE 
            WHEN COALESCE(v.views, 0) > 0 
            THEN ROUND((COALESCE(l.likes, 0) + COALESCE(c.comments, 0) + COALESCE(s.shares, 0)) * 100.0 / v.views, 2)
            ELSE 0 
        END as engagement_rate
    FROM (SELECT 1) dummy
    LEFT JOIN (
        SELECT COUNT(*) as likes 
        FROM likes 
        WHERE post_id = post_uuid AND like_type = 'like'
    ) l ON true
    LEFT JOIN (
        SELECT COUNT(*) as dislikes 
        FROM likes 
        WHERE post_id = post_uuid AND like_type = 'dislike'
    ) d ON true
    LEFT JOIN (
        SELECT COUNT(*) as comments 
        FROM comments 
        WHERE post_id = post_uuid AND is_approved = true
    ) c ON true
    LEFT JOIN (
        SELECT COUNT(*) as views 
        FROM post_views 
        WHERE post_id = post_uuid
    ) v ON true
    LEFT JOIN (
        SELECT COUNT(*) as shares 
        FROM post_shares 
        WHERE post_id = post_uuid
    ) s ON true;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending posts (high engagement in last 24 hours)
CREATE OR REPLACE FUNCTION get_trending_posts(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    post_id UUID,
    title TEXT,
    recent_engagement BIGINT,
    total_engagement BIGINT,
    engagement_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as post_id,
        p.title,
        COALESCE(recent.count, 0) as recent_engagement,
        COALESCE(total.count, 0) as total_engagement,
        CASE 
            WHEN COALESCE(views.count, 0) > 0 
            THEN ROUND(COALESCE(total.count, 0) * 100.0 / views.count, 2)
            ELSE 0 
        END as engagement_rate
    FROM posts p
    LEFT JOIN (
        SELECT 
            post_id, 
            COUNT(*) as count
        FROM (
            SELECT post_id, created_at FROM likes WHERE created_at > NOW() - INTERVAL '24 hours'
            UNION ALL
            SELECT post_id, created_at FROM comments WHERE created_at > NOW() - INTERVAL '24 hours' AND is_approved = true
            UNION ALL
            SELECT post_id, created_at FROM post_shares WHERE created_at > NOW() - INTERVAL '24 hours'
        ) recent_activity
        GROUP BY post_id
    ) recent ON p.id = recent.post_id
    LEFT JOIN (
        SELECT 
            post_id, 
            COUNT(*) as count
        FROM (
            SELECT post_id FROM likes
            UNION ALL
            SELECT post_id FROM comments WHERE is_approved = true
            UNION ALL
            SELECT post_id FROM post_shares
        ) total_activity
        GROUP BY post_id
    ) total ON p.id = total.post_id
    LEFT JOIN (
        SELECT post_id, COUNT(*) as count
        FROM post_views
        GROUP BY post_id
    ) views ON p.id = views.post_id
    WHERE recent.count > 0
    ORDER BY recent_engagement DESC, engagement_rate DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old data (optional - for performance)
CREATE OR REPLACE FUNCTION cleanup_old_engagement_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- Delete old views (keep only recent ones)
    DELETE FROM post_views WHERE created_at < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old view records', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
