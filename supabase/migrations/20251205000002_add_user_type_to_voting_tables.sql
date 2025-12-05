-- Add user_type column to user_predictions table
ALTER TABLE public.user_predictions 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(10) DEFAULT 'user' CHECK (user_type IN ('user', 'admin'));

-- Add user_type column to score_predictions table
ALTER TABLE public.score_predictions 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(10) DEFAULT 'user' CHECK (user_type IN ('user', 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_type ON public.user_predictions(user_type);
CREATE INDEX IF NOT EXISTS idx_score_predictions_user_type ON public.score_predictions(user_type);

-- Update existing records to have explicit user_type values
UPDATE public.user_predictions 
SET user_type = 'user' 
WHERE user_type IS NULL;

UPDATE public.score_predictions 
SET user_type = 'user' 
WHERE user_type IS NULL;

-- Add comments to describe the purpose of the new columns
COMMENT ON COLUMN public.user_predictions.user_type IS 'Type of user who made the prediction: user or admin';
COMMENT ON COLUMN public.score_predictions.user_type IS 'Type of user who made the prediction: user or admin';