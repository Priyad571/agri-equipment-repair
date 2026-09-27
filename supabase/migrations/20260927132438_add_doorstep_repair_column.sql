ALTER TABLE requests ADD COLUMN IF NOT EXISTS doorstep_repair boolean NOT NULL DEFAULT false;
