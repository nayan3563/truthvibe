-- Insert some sample engagement data for testing

-- Sample comments (replace with actual post IDs)
INSERT INTO comments (post_id, author_name, author_email, comment_text, is_approved) 
SELECT 
    p.id,
    CASE (random() * 10)::int
        WHEN 0 THEN 'Alex Johnson'
        WHEN 1 THEN 'Sarah Chen'
        WHEN 2 THEN 'Mike Rodriguez'
        WHEN 3 THEN 'Emily Davis'
        WHEN 4 THEN 'David Wilson'
        WHEN 5 THEN 'Lisa Anderson'
        WHEN 6 THEN 'John Smith'
        WHEN 7 THEN 'Maria Garcia'
        WHEN 8 THEN 'James Brown'
        ELSE 'Anonymous User'
    END as author_name,
    CASE (random() * 3)::int
        WHEN 0 THEN 'user@example.com'
        WHEN 1 THEN 'test@gmail.com'
        ELSE NULL
    END as author_email,
    CASE (random() * 15)::int
        WHEN 0 THEN 'This is amazing! Thanks for sharing 🔥'
        WHEN 1 THEN 'Exactly what I was looking for!'
        WHEN 2 THEN 'Great content as always 👍'
        WHEN 3 THEN 'Love this! Keep it up!'
        WHEN 4 THEN 'Very informative, thank you!'
        WHEN 5 THEN 'Awesome work! 💯'
        WHEN 6 THEN 'This helped me a lot!'
        WHEN 7 THEN 'Perfect timing for this content'
        WHEN 8 THEN 'Really well explained!'
        WHEN 9 THEN 'Can you make more like this?'
        WHEN 10 THEN 'Shared with my friends!'
        WHEN 11 THEN 'This is gold! 🏆'
        WHEN 12 THEN 'Mind blown! 🤯'
        WHEN 13 THEN 'Thanks for the insights!'
        ELSE 'Great post!'
    END as comment_text,
    true as is_approved
FROM posts p
CROSS JOIN generate_series(1, (random() * 5 + 1)::int) -- 1-5 comments per post
WHERE p.created_at > NOW() - INTERVAL '30 days'
LIMIT 100; -- Limit total comments

-- Sample likes (replace with actual post IDs)
INSERT INTO likes (post_id, user_identifier, like_type)
SELECT 
    p.id,
    'user_' || generate_random_uuid()::text,
    CASE WHEN random() > 0.1 THEN 'like' ELSE 'dislike' END -- 90% likes, 10% dislikes
FROM posts p
CROSS JOIN generate_series(1, (random() * 20 + 5)::int) -- 5-25 likes per post
WHERE p.created_at > NOW() - INTERVAL '30 days'
ON CONFLICT (post_id, user_identifier) DO NOTHING
LIMIT 500; -- Limit total likes

-- Sample views
INSERT INTO post_views (post_id, user_identifier, user_agent, referrer)
SELECT 
    p.id,
    'visitor_' || generate_random_uuid()::text,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        WHEN 1 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
        WHEN 2 THEN 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0'
        ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    END as user_agent,
    CASE (random() * 5)::int
        WHEN 0 THEN 'https://facebook.com'
        WHEN 1 THEN 'https://twitter.com'
        WHEN 2 THEN 'https://google.com'
        WHEN 3 THEN 'https://instagram.com'
        ELSE NULL
    END as referrer
FROM posts p
CROSS JOIN generate_series(1, (random() * 100 + 50)::int) -- 50-150 views per post
WHERE p.created_at > NOW() - INTERVAL '30 days'
LIMIT 2000; -- Limit total views

-- Sample shares
INSERT INTO post_shares (post_id, platform, user_identifier)
SELECT 
    p.id,
    CASE (random() * 6)::int
        WHEN 0 THEN 'facebook'
        WHEN 1 THEN 'twitter'
        WHEN 2 THEN 'whatsapp'
        WHEN 3 THEN 'telegram'
        WHEN 4 THEN 'copy_link'
        ELSE 'email'
    END as platform,
    'sharer_' || generate_random_uuid()::text
FROM posts p
CROSS JOIN generate_series(1, (random() * 10 + 2)::int) -- 2-12 shares per post
WHERE p.created_at > NOW() - INTERVAL '30 days'
LIMIT 300; -- Limit total shares
