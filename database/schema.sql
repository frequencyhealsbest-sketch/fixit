-- Consultations Table Schema
-- Run this SQL in your Supabase SQL Editor or PostgreSQL database

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  consultation_date DATE NOT NULL,
  consultation_time TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);

-- Enable Row Level Security (RLS)
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated users (or anonymous if needed)
-- Option 1: Allow anonymous inserts (public form submissions)
CREATE POLICY "Allow public inserts" ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Option 2: If you want to restrict to authenticated users only, use this instead:
-- CREATE POLICY "Allow authenticated inserts" ON consultations
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- Create policy for service role to read all records (for admin dashboard)
CREATE POLICY "Service role can read all" ON consultations
  FOR SELECT
  TO service_role
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE consultations IS 'Stores consultation form submissions from the website';
COMMENT ON COLUMN consultations.status IS 'Status values: pending, contacted, completed, cancelled';
