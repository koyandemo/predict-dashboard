-- Add allow_draw column to matches table (defaults to true for regular matches)
ALTER TABLE public.matches ADD COLUMN allow_draw BOOLEAN DEFAULT true;