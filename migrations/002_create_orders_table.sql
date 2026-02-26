-- Orders Table Migration
-- Run this in Supabase SQL Editor to create the orders table

-- Step 1: Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  service_name TEXT NOT NULL,
  agreed_price TEXT NOT NULL,
  status TEXT DEFAULT 'Pending Configuration',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policies

-- Policy: Allow public read access to orders (for client portal)
CREATE POLICY "Allow public read access to orders"
ON orders FOR SELECT USING (true);

-- Policy: Allow webhook/API to insert orders
CREATE POLICY "Allow anon insert on orders"
ON orders FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated users to update orders
CREATE POLICY "Allow authenticated update on orders"
ON orders FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete orders
CREATE POLICY "Allow authenticated delete on orders"
ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
