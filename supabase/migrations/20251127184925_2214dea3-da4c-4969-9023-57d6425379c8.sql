-- Create Leagues table
CREATE TABLE IF NOT EXISTS public.leagues (
  league_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL
);

-- Create Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  team_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(10) NOT NULL,
  logo_url VARCHAR(500),
  country VARCHAR(255) NOT NULL
);

-- Create Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  match_id SERIAL PRIMARY KEY,
  league_id INTEGER REFERENCES public.leagues(league_id) ON DELETE CASCADE,
  home_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
  away_team_id INTEGER REFERENCES public.teams(team_id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_time TIME NOT NULL,
  venue VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Upcoming'
);

-- Create Match_Outcomes table
CREATE TABLE IF NOT EXISTS public.match_outcomes (
  outcome_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  home_win_prob INTEGER CHECK (home_win_prob >= 0 AND home_win_prob <= 100),
  draw_prob INTEGER CHECK (draw_prob >= 0 AND draw_prob <= 100),
  away_win_prob INTEGER CHECK (away_win_prob >= 0 AND away_win_prob <= 100),
  CONSTRAINT unique_match_outcome UNIQUE (match_id)
);

-- Create User_Predictions table (Note: will require auth later)
CREATE TABLE IF NOT EXISTS public.user_predictions (
  prediction_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  predicted_winner VARCHAR(50) CHECK (predicted_winner IN ('Home', 'Away', 'Draw')),
  prediction_date TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_match_prediction UNIQUE (user_id, match_id)
);

-- Create Score_Predictions table
CREATE TABLE IF NOT EXISTS public.score_predictions (
  score_pred_id SERIAL PRIMARY KEY,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  vote_count INTEGER DEFAULT 0,
  CONSTRAINT unique_match_score UNIQUE (match_id, home_score, away_score)
);

-- Create Comments table (Note: will require auth later)
CREATE TABLE IF NOT EXISTS public.comments (
  comment_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  match_id INTEGER REFERENCES public.matches(match_id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (admin will manage data through dashboard)
-- Leagues policies
CREATE POLICY "Anyone can view leagues" ON public.leagues
  FOR SELECT USING (true);

-- Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT USING (true);

-- Match outcomes policies
CREATE POLICY "Anyone can view match outcomes" ON public.match_outcomes
  FOR SELECT USING (true);

-- User predictions policies (public read for vote counts)
CREATE POLICY "Anyone can view predictions" ON public.user_predictions
  FOR SELECT USING (true);

-- Score predictions policies
CREATE POLICY "Anyone can view score predictions" ON public.score_predictions
  FOR SELECT USING (true);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_matches_league ON public.matches(league_id);
CREATE INDEX idx_matches_home_team ON public.matches(home_team_id);
CREATE INDEX idx_matches_away_team ON public.matches(away_team_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_match_outcomes_match ON public.match_outcomes(match_id);
CREATE INDEX idx_user_predictions_match ON public.user_predictions(match_id);
CREATE INDEX idx_score_predictions_match ON public.score_predictions(match_id);
CREATE INDEX idx_comments_match ON public.comments(match_id);