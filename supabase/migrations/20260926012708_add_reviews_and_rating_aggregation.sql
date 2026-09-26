/*
# Add reviews table and technician rating aggregation

1. New Tables
- `reviews` — farmer feedback for completed repair jobs
  - id (uuid, primary key)
  - request_id (uuid, foreign key to requests, unique — one review per request)
  - technician_id (uuid, foreign key to technicians)
  - farmer_name (text, not null)
  - rating (integer, 1–5, not null)
  - feedback (text, nullable — optional short comment)
  - created_at (timestamptz, default now())

2. New Columns
- `technicians.rating_count` (integer, default 0) — number of ratings received
- `technicians.rating_sum` (integer, default 0) — sum of all ratings for average calculation

3. Security
- Enable RLS on `reviews`.
- Allow anon + authenticated CRUD (single-tenant, no-auth app; data is intentionally shared).

4. Notes
- The `rating` column on technicians already exists (numeric 0–5). We now maintain it as
  rating_sum / rating_count via a trigger that fires on insert into reviews.
- A trigger function `update_technician_rating()` recalculates rating and rating_count/rating_sum
  whenever a review is inserted.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid UNIQUE NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  farmer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- Add rating_count and rating_sum to technicians for efficient average calculation
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS rating_sum integer NOT NULL DEFAULT 0;

-- Trigger function to update technician rating when a review is inserted
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE technicians
  SET
    rating_count = rating_count + 1,
    rating_sum = rating_sum + NEW.rating,
    rating = ROUND((rating_sum + NEW.rating)::numeric / (rating_count + 1), 1)
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_inserted ON reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_technician_rating();
