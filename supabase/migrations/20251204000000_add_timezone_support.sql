-- Add timezone support to matches table
-- This migration adds timezone support to match dates and times

-- Add timezone column to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS match_timezone VARCHAR(50) DEFAULT 'UTC';

-- Change match_date to TIMESTAMP WITH TIME ZONE for better timezone handling
ALTER TABLE public.matches 
ALTER COLUMN match_date TYPE TIMESTAMP WITH TIME ZONE USING match_date::TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure valid timezone values
ALTER TABLE public.matches 
ADD CONSTRAINT matches_timezone_check 
CHECK (match_timezone ~ '^[A-Za-z_/]+$');

-- Add comment for documentation
COMMENT ON COLUMN public.matches.match_timezone IS 'Timezone identifier for the match (e.g., America/New_York, Europe/London)';