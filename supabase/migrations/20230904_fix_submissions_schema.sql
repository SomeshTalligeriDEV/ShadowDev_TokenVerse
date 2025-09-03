-- First ensure the campaign_id column exists and has the proper foreign key
ALTER TABLE IF EXISTS public.submissions 
  ADD COLUMN IF NOT EXISTS campaign_id uuid,
  ADD CONSTRAINT submissions_campaign_id_fkey 
  FOREIGN KEY (campaign_id) 
  REFERENCES public.campaigns(id) 
  ON DELETE CASCADE;

-- Ensure the user_id column exists and has the proper foreign key
ALTER TABLE IF EXISTS public.submissions 
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD CONSTRAINT submissions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

-- Add other necessary columns if they don't exist
ALTER TABLE IF EXISTS public.submissions 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
