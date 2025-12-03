-- Update matches table to support new status values and fix default
ALTER TABLE public.matches 
ALTER COLUMN status TYPE VARCHAR(50),
ALTER COLUMN status SET DEFAULT 'scheduled';

-- Update existing records with old status values
UPDATE public.matches 
SET status = CASE 
  WHEN status = 'Upcoming' THEN 'scheduled'
  WHEN status = 'Live' THEN 'live'
  WHEN status = 'Finished' THEN 'finished'
  ELSE status
END;

-- Add constraint to ensure valid status values
ALTER TABLE public.matches 
ADD CONSTRAINT matches_status_check 
CHECK (status IN ('scheduled', 'live', 'finished', 'postponed'));