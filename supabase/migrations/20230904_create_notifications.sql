-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    is_read boolean DEFAULT false,
    submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
    type varchar(255) DEFAULT 'info'
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own notifications
CREATE POLICY "Users can read their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow inserting notifications
CREATE POLICY "Enable insert access for all users"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
