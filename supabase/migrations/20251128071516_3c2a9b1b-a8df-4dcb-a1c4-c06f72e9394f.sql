-- Add slug column to leagues table
ALTER TABLE public.leagues ADD COLUMN slug VARCHAR UNIQUE;

-- Add slug column to teams table
ALTER TABLE public.teams ADD COLUMN slug VARCHAR UNIQUE;

-- Add slug column to matches table
ALTER TABLE public.matches ADD COLUMN slug VARCHAR UNIQUE;

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(text_input, '[^a-zA-Z0-9]+', '-', 'g'), '-'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate league slug
CREATE OR REPLACE FUNCTION public.generate_league_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name || '-' || NEW.country);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate team slug
CREATE OR REPLACE FUNCTION public.generate_team_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate match slug
CREATE OR REPLACE FUNCTION public.generate_match_slug()
RETURNS TRIGGER AS $$
DECLARE
  home_team_name VARCHAR;
  away_team_name VARCHAR;
BEGIN
  SELECT name INTO home_team_name FROM public.teams WHERE team_id = NEW.home_team_id;
  SELECT name INTO away_team_name FROM public.teams WHERE team_id = NEW.away_team_id;
  NEW.slug := slugify(home_team_name || '-' || away_team_name || '-' || NEW.match_date::TEXT);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for leagues
CREATE TRIGGER set_league_slug
BEFORE INSERT OR UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.generate_league_slug();

-- Create triggers for teams
CREATE TRIGGER set_team_slug
BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.generate_team_slug();

-- Create triggers for matches
CREATE TRIGGER set_match_slug
BEFORE INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.generate_match_slug();

-- Backfill existing data
UPDATE public.leagues SET slug = slugify(name || '-' || country);
UPDATE public.teams SET slug = slugify(name);

-- Backfill matches with slugs
UPDATE public.matches m
SET slug = slugify(
  (SELECT name FROM public.teams WHERE team_id = m.home_team_id) || '-' ||
  (SELECT name FROM public.teams WHERE team_id = m.away_team_id) || '-' ||
  m.match_date::TEXT
);