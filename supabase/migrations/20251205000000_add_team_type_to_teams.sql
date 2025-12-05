-- Add team_type column to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS team_type VARCHAR(20) DEFAULT 'club' CHECK (team_type IN ('club', 'country'));

-- Update existing teams to have a default value
UPDATE public.teams 
SET team_type = 'club' 
WHERE team_type IS NULL;

-- Add a comment to describe the column
COMMENT ON COLUMN public.teams.team_type IS 'Type of team: club or country (national team)';