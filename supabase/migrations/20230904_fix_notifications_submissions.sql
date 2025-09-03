-- Ensure submissions table has the correct structure
CREATE TABLE IF NOT EXISTS public.submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    content text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    reviewed_at timestamp with time zone,
    instagram_link text,
    facebook_link text,
    youtube_link text,
    x_link text
);

-- Ensure notifications table exists with correct structure
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add points column to users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
