-- ============================================================================
-- PAYMENT MIGRATION — Add payment columns to consultations table
-- Run this in Supabase SQL Editor BEFORE deploying the payment feature
-- ============================================================================

-- Add payment_id column (stores Razorpay payment ID e.g. pay_abc123)
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add payment_status column (values: paid | failed | pending)
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Index for querying by payment status
CREATE INDEX IF NOT EXISTS idx_consultations_payment_status
  ON consultations(payment_status);

-- ============================================================================
-- VERIFY THE MIGRATION
-- ============================================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'consultations'
ORDER BY ordinal_position;

-- Expected output should now include:
--   payment_id      | text | YES | null
--   payment_status  | text | NO  | 'pending'

-- ============================================================================
-- NOTES
-- ============================================================================
-- payment_id     : Razorpay payment ID (e.g. "pay_PJlb5fTYTihkFN")
--                  Only set after payment is verified server-side.
-- payment_status : "paid"    → payment verified, consultation active
--                  "failed"  → payment failed (reserved for future use)
--                  "pending" → legacy rows created before payment feature
-- ============================================================================
