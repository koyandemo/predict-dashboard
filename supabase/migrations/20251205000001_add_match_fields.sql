-- Add new fields to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS big_match BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS derby BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS match_type VARCHAR(20) DEFAULT 'Normal' CHECK (match_type IN ('Normal', 'Final', 'Semi-Final', 'Quarter-Final')),
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Add comments to describe the new columns
COMMENT ON COLUMN public.matches.big_match IS 'Indicates if this is a big or important match';
COMMENT ON COLUMN public.matches.derby IS 'Indicates if this is a rivalry match';
COMMENT ON COLUMN public.matches.match_type IS 'Type of match: Normal, Final, Semi-Final, Quarter-Final';
COMMENT ON COLUMN public.matches.published IS 'Indicates if the match is published and visible to users';