/*
# Create spare_parts table with seed data

1. New Table
- `spare_parts` — inventory of spare parts available for repairs
  - id (uuid, primary key)
  - part_name (text, not null)
  - compatible_equipment (text, not null) — e.g. "Tractor", "Pump", "Sprayer"
  - price (numeric, not null) — cost in currency units
  - availability (text, not null) — one of: 'In Stock', 'Low Stock', 'Out of Stock'
  - supplier_name (text, not null)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS; allow anon + authenticated SELECT (shared reference data, no writes from app).
*/

CREATE TABLE IF NOT EXISTS spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name text NOT NULL,
  compatible_equipment text NOT NULL,
  price numeric(10,2) NOT NULL,
  availability text NOT NULL DEFAULT 'In Stock',
  supplier_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_spare_parts" ON spare_parts;
CREATE POLICY "anon_select_spare_parts" ON spare_parts FOR SELECT
  TO anon, authenticated USING (true);

-- Seed 12 sample parts covering different equipment types
INSERT INTO spare_parts (part_name, compatible_equipment, price, availability, supplier_name) VALUES
  ('Fuel filter', 'Tractor', 24.50, 'In Stock', 'AgriParts Co.'),
  ('Radiator hose', 'Tractor', 38.00, 'Low Stock', 'FarmEquip Supply'),
  ('Hydraulic seal kit', 'Tractor', 56.75, 'In Stock', 'AgriParts Co.'),
  ('Spray nozzle (set of 4)', 'Sprayer', 18.00, 'In Stock', 'SprayTech Ltd.'),
  ('Pressure regulator valve', 'Sprayer', 42.00, 'Out of Stock', 'SprayTech Ltd.'),
  ('Pump diaphragm', 'Sprayer', 31.50, 'Low Stock', 'AgriParts Co.'),
  ('Pump seal kit', 'Pump', 27.00, 'In Stock', 'WaterWorks Inc.'),
  ('Motor capacitor', 'Pump', 19.50, 'In Stock', 'WaterWorks Inc.'),
  ('Tiller drive belt', 'Tiller', 22.00, 'In Stock', 'FarmEquip Supply'),
  ('Harvester cutting blade', 'Harvester', 65.00, 'Low Stock', 'AgriParts Co.'),
  ('Planter seed meter', 'Planter', 48.00, 'In Stock', 'FarmEquip Supply'),
  ('Weeder tine set', 'Weeder', 34.00, 'Out of Stock', 'FarmEquip Supply')
ON CONFLICT DO NOTHING;
