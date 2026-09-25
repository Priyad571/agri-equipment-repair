/*
# Update urgency and status values for requests table

1. Changes
- Urgency values changed from (low, medium, high, critical) to (normal, urgent, critical)
- Status values changed: 'pending' renamed to 'requested' in the allowed set
- Default urgency is now 'normal', default status is now 'requested'
- Existing data migrated to the new value sets

2. Migration of existing data
- urgency: low → normal, medium/ high → urgent, critical → critical
- status: pending → requested (other statuses unchanged)

3. Security
- No policy changes; RLS already enabled with anon+authenticated CRUD.
*/

-- Migrate existing data before changing constraints
UPDATE requests SET urgency = 'normal' WHERE urgency = 'low';
UPDATE requests SET urgency = 'urgent' WHERE urgency IN ('medium', 'high');
-- critical stays critical

UPDATE requests SET status = 'requested' WHERE status = 'pending';

-- Replace constraints
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_urgency_check;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;

ALTER TABLE requests ALTER COLUMN urgency SET DEFAULT 'normal';
ALTER TABLE requests ALTER COLUMN status SET DEFAULT 'requested';

ALTER TABLE requests ADD CONSTRAINT requests_urgency_check
  CHECK (urgency IN ('normal', 'urgent', 'critical'));
ALTER TABLE requests ADD CONSTRAINT requests_status_check
  CHECK (status IN ('requested', 'assigned', 'in_progress', 'completed', 'cancelled'));
