-- Add audit_notes column to all request tables

-- Membership Requests
ALTER TABLE membership_requests
ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- Training Requests
ALTER TABLE training_requests
ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- Office Opening Requests
ALTER TABLE office_opening_requests
ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- Promotion Requests
ALTER TABLE promotion_requests
ADD COLUMN IF NOT EXISTS audit_notes TEXT;
