-- Remove Telegram columns from user_profiles table
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS telegram_id,
DROP COLUMN IF EXISTS telegram_username;

-- Drop the index if it exists (though dropping the column usually handles this)
DROP INDEX IF EXISTS idx_user_profiles_telegram_id;
