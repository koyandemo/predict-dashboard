-- Create Match Vote Counts table to store actual vote counts
CREATE TABLE IF NOT EXISTS public.match_vote_counts (
  vote_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  home_votes INTEGER DEFAULT 0,
  draw_votes INTEGER DEFAULT 0,
  away_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  CONSTRAINT unique_match_vote_count UNIQUE (match_id)
);

-- Enable Row Level Security
ALTER TABLE public.match_vote_counts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view match vote counts" ON public.match_vote_counts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert match vote counts" ON public.match_vote_counts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update match vote counts" ON public.match_vote_counts
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete match vote counts" ON public.match_vote_counts
  FOR DELETE USING (true);