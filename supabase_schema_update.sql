-- Add Telegram columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id bigint,
ADD COLUMN IF NOT EXISTS telegram_username text;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON public.user_profiles(telegram_id);

-- Add constraint to ensure telegram_id is unique if it's not null
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_telegram_id_key;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_telegram_id_key UNIQUE (telegram_id);
