/*
# Create requests and technicians tables for One-Stop Agri Equipment Repair

1. New Tables
- `requests` — repair requests submitted by farmers
  - id (uuid, primary key)
  - farmer_name (text, not null)
  - equipment_type (text, not null)
  - problem_description (text, not null)
  - urgency (text, not null, one of: low, medium, high, critical)
  - status (text, not null, default 'pending', one of: pending, assigned, in_progress, completed, cancelled)
  - technician_id (uuid, nullable, foreign key to technicians)
  - created_at (timestamptz, default now())
- `technicians` — repair technicians
  - id (uuid, primary key)
  - name (text, not null)
  - specialization (text, not null)
  - rating (numeric, default 0, range 0–5)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD (single-tenant, no-auth app; data is intentionally shared).

3. Seed Data
- Insert 4 sample technicians with different specializations and ratings.
*/

CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  equipment_type text NOT NULL,
  problem_description text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','in_progress','completed','cancelled')),
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- requests policies
DROP POLICY IF EXISTS "anon_select_requests" ON requests;
CREATE POLICY "anon_select_requests" ON requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_requests" ON requests;
CREATE POLICY "anon_insert_requests" ON requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_requests" ON requests;
CREATE POLICY "anon_update_requests" ON requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_requests" ON requests;
CREATE POLICY "anon_delete_requests" ON requests FOR DELETE
  TO anon, authenticated USING (true);

-- technicians policies
DROP POLICY IF EXISTS "anon_select_technicians" ON technicians;
CREATE POLICY "anon_select_technicians" ON technicians FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_technicians" ON technicians;
CREATE POLICY "anon_insert_technicians" ON technicians FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_technicians" ON technicians;
CREATE POLICY "anon_update_technicians" ON technicians FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_technicians" ON technicians;
CREATE POLICY "anon_delete_technicians" ON technicians FOR DELETE
  TO anon, authenticated USING (true);

-- Seed sample technicians
INSERT INTO technicians (name, specialization, rating) VALUES
  ('John Martinez', 'Tractors & Harvesters', 4.8),
  ('Sarah Chen', 'Irrigation Systems', 4.6),
  ('David Okoro', 'Drones & Precision Ag Tech', 4.9),
  ('Emily Rodriguez', 'Generators & Power Equipment', 4.5)
ON CONFLICT DO NOTHING;
