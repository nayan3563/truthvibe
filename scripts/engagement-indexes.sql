-- Additional indexes for better performance

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_likes_post_type ON likes(post_id, like_type);
CREATE INDEX IF NOT EXISTS idx_comments_post_approved ON comments(post_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_post_views_date ON post_views(post_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_post_shares_platform ON post_shares(post_id, platform);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_likes_created_at_desc ON likes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created_at_desc ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at_desc ON post_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_shares_created_at_desc ON post_shares(created_at DESC);

-- Partial indexes for active content
CREATE INDEX IF NOT EXISTS idx_comments_approved_recent 
ON comments(post_id, created_at DESC) 
WHERE is_approved = true AND created_at > NOW() - INTERVAL '30 days';

-- Index for user engagement tracking
CREATE INDEX IF NOT EXISTS idx_likes_user_recent 
ON likes(user_identifier, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Index for trending content
CREATE INDEX IF NOT EXISTS idx_engagement_recent 
ON (
    SELECT post_id, created_at FROM likes WHERE created_at > NOW() - INTERVAL '24 hours'
    UNION ALL
    SELECT post_id, created_at FROM comments WHERE created_at > NOW() - INTERVAL '24 hours'
    UNION ALL
    SELECT post_id, created_at FROM post_shares WHERE created_at > NOW() - INTERVAL '24 hours'
);
