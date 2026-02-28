-- Create leads table for CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  interested_service TEXT,
  status TEXT DEFAULT 'Lead',
  objection TEXT,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, sender_id)
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Allow public read access to leads" ON leads;
CREATE POLICY "Allow public read access to leads" ON leads
  FOR SELECT USING (true);

-- Public insert access
DROP POLICY IF EXISTS "Allow public insert access to leads" ON leads;
CREATE POLICY "Allow public insert access to leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Public update access
DROP POLICY IF EXISTS "Allow public update access to leads" ON leads;
CREATE POLICY "Allow public update access to leads" ON leads
  FOR UPDATE USING (true);
