-- Add 'cancelled' to transaction_status enum
-- Run this in Supabase SQL Editor

ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'cancelled';
