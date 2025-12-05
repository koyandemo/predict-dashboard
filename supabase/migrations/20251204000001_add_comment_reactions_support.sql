-- Add columns and tables for comment replies and reactions if they don't exist

-- Add parent_comment_id to comments table for replies (if not exists)
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE;

-- Add foreign key constraint for user_id in comments table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_user_id_fkey' 
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create comment_reactions table for likes and other reactions (if not exists)
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  reaction_id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES public.comments(comment_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES public.users(user_id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'dislike', etc.
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_match ON public.comments(match_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.comment_reactions(reaction_type);

-- Update RLS policies for the new columns and tables (if not exists)
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comment reactions policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view comment reactions'
  ) THEN
    CREATE POLICY "Anyone can view comment reactions" ON public.comment_reactions
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Anyone can insert comment reactions'
  ) THEN
    CREATE POLICY "Anyone can insert comment reactions" ON public.comment_reactions
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Anyone can update comment reactions'
  ) THEN
    CREATE POLICY "Anyone can update comment reactions" ON public.comment_reactions
      FOR UPDATE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Anyone can delete comment reactions'
  ) THEN
    CREATE POLICY "Anyone can delete comment reactions" ON public.comment_reactions
      FOR DELETE USING (true);
  END IF;
END $$;

-- Create a function to count reactions for a comment (if not exists)
CREATE OR REPLACE FUNCTION count_reactions_for_comment(comment_id_param INTEGER, reaction_type_param VARCHAR DEFAULT 'like')
RETURNS INTEGER AS $$
DECLARE
  reaction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO reaction_count
  FROM public.comment_reactions
  WHERE comment_id = comment_id_param
  AND reaction_type = reaction_type_param;
  
  RETURN reaction_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to count likes for a comment
CREATE OR REPLACE FUNCTION count_likes_for_comment(comment_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN count_reactions_for_comment(comment_id_param, 'like');
END;
$$ LANGUAGE plpgsql;

-- Create a function to count dislikes for a comment
CREATE OR REPLACE FUNCTION count_dislikes_for_comment(comment_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN count_reactions_for_comment(comment_id_param, 'dislike');
END;
$$ LANGUAGE plpgsql;