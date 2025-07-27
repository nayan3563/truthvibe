-- Add some time variation data to posts table (optional)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_time_offset INTEGER DEFAULT 0;

-- Update existing posts with random time offsets (in minutes)
UPDATE posts 
SET display_time_offset = (random() * 1440)::int - 720 -- Random between -12 hours to +12 hours
WHERE display_time_offset = 0;

-- Function to get display time for a post
CREATE OR REPLACE FUNCTION get_post_display_time(post_created_at TIMESTAMP, offset_minutes INTEGER DEFAULT 0)
RETURNS TEXT AS $$
DECLARE
    display_time TIMESTAMP;
    diff_minutes INTEGER;
    diff_hours INTEGER;
    diff_days INTEGER;
BEGIN
    -- Calculate display time with offset
    display_time := post_created_at + (offset_minutes || ' minutes')::INTERVAL;
    
    -- Calculate difference from now
    diff_minutes := EXTRACT(EPOCH FROM (NOW() - display_time)) / 60;
    
    -- Return formatted time
    IF diff_minutes < 1 THEN
        RETURN 'Just now';
    ELSIF diff_minutes < 60 THEN
        RETURN diff_minutes || 'm ago';
    ELSE
        diff_hours := diff_minutes / 60;
        IF diff_hours < 24 THEN
            RETURN diff_hours || 'h ago';
        ELSE
            diff_days := diff_hours / 24;
            IF diff_days < 7 THEN
                RETURN diff_days || 'd ago';
            ELSE
                RETURN (diff_days / 7) || 'w ago';
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
