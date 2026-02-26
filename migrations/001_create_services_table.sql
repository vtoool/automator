-- Services Table Migration
-- Run this in Supabase SQL Editor to create the services table

-- Step 1: Create the services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policies

-- Policy: Allow public read access to all services (using anon key)
-- This enables the webhook to read services without authentication
CREATE POLICY "Allow public read access to services"
ON services FOR SELECT
USING (true);

-- Policy: Allow authenticated users to insert services
CREATE POLICY "Allow authenticated insert on services"
ON services FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update services
CREATE POLICY "Allow authenticated update on services"
ON services FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete services
CREATE POLICY "Allow authenticated delete on services"
ON services FOR DELETE
USING (auth.role() = 'authenticated');

-- Step 4: Add some sample data (optional - comment out if not needed)
-- INSERT INTO services (name, description, price) VALUES
--   ('Basic Website', 'A simple, professional website with up to 5 pages', '$499'),
--   ('E-commerce Platform', 'Full online store with payment processing', '$1,499'),
--   ('Custom Web App', 'Bespoke web application tailored to your needs', 'Starting at $2,999');
