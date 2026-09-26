/*
# Add symptoms and likely_issue columns to requests table

1. New Columns
- `symptoms` (text[], nullable) — list of selected common symptoms for the equipment
- `likely_issue` (text, nullable) — rule-based likely issue suggestion shown to farmer and technician

2. Security
- No policy changes; RLS already enabled with anon+authenticated CRUD.
*/

ALTER TABLE requests ADD COLUMN IF NOT EXISTS symptoms text[];
ALTER TABLE requests ADD COLUMN IF NOT EXISTS likely_issue text;
