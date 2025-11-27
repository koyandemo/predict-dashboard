-- Add INSERT, UPDATE, DELETE policies for leagues
CREATE POLICY "Anyone can insert leagues" ON public.leagues
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update leagues" ON public.leagues
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete leagues" ON public.leagues
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for teams
CREATE POLICY "Anyone can insert teams" ON public.teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update teams" ON public.teams
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete teams" ON public.teams
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for matches
CREATE POLICY "Anyone can insert matches" ON public.matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update matches" ON public.matches
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete matches" ON public.matches
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for match_outcomes
CREATE POLICY "Anyone can insert match outcomes" ON public.match_outcomes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update match outcomes" ON public.match_outcomes
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete match outcomes" ON public.match_outcomes
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for score_predictions
CREATE POLICY "Anyone can insert score predictions" ON public.score_predictions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update score predictions" ON public.score_predictions
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete score predictions" ON public.score_predictions
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for comments
CREATE POLICY "Anyone can insert comments" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update comments" ON public.comments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete comments" ON public.comments
  FOR DELETE USING (true);