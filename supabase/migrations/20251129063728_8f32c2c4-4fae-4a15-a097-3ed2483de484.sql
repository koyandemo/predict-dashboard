-- Drop triggers first
DROP TRIGGER IF EXISTS set_league_slug ON public.leagues;
DROP TRIGGER IF EXISTS set_team_slug ON public.teams;
DROP TRIGGER IF EXISTS set_match_slug ON public.matches;

-- Drop and recreate functions with search_path
DROP FUNCTION IF EXISTS public.generate_league_slug();
DROP FUNCTION IF EXISTS public.generate_team_slug();
DROP FUNCTION IF EXISTS public.generate_match_slug();
DROP FUNCTION IF EXISTS public.slugify(TEXT);

-- Recreate slugify function with search_path
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(trim(regexp_replace(text_input, '[^a-zA-Z0-9]+', '-', 'g'), '-'));
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Recreate generate_league_slug function with search_path
CREATE OR REPLACE FUNCTION public.generate_league_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name || '-' || NEW.country);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate generate_team_slug function with search_path
CREATE OR REPLACE FUNCTION public.generate_team_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := slugify(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate generate_match_slug function with search_path
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate triggers
CREATE TRIGGER set_league_slug
BEFORE INSERT OR UPDATE ON public.leagues
FOR EACH ROW
EXECUTE FUNCTION public.generate_league_slug();

CREATE TRIGGER set_team_slug
BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.generate_team_slug();

CREATE TRIGGER set_match_slug
BEFORE INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.generate_match_slug();