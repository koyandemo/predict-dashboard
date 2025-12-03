-- Add home_score and away_score columns to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS home_score INTEGER,
ADD COLUMN IF NOT EXISTS away_score INTEGER;

-- Add constraints to ensure scores are non-negative
ALTER TABLE public.matches 
ADD CONSTRAINT matches_home_score_check CHECK (home_score >= 0),
ADD CONSTRAINT matches_away_score_check CHECK (away_score >= 0);