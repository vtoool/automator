-- Add missing columns to bot_configs if they don't exist
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (needed for API routes using anon key)
DROP POLICY IF EXISTS "Allow public read access to bot_configs" ON bot_configs;
CREATE POLICY "Allow public read access to bot_configs" ON bot_configs
  FOR SELECT USING (true);

-- Create policy for public insert access
DROP POLICY IF EXISTS "Allow public insert access to bot_configs" ON bot_configs;
CREATE POLICY "Allow public insert access to bot_configs" ON bot_configs
  FOR INSERT WITH CHECK (true);

-- Create policy for public update access
DROP POLICY IF EXISTS "Allow public update access to bot_configs" ON bot_configs;
CREATE POLICY "Allow public update access to bot_configs" ON bot_configs
  FOR UPDATE USING (true);

-- Create policy for public delete access
DROP POLICY IF EXISTS "Allow public delete access to bot_configs" ON bot_configs;
CREATE POLICY "Allow public delete access to bot_configs" ON bot_configs
  FOR DELETE USING (true);

-- Insert sample data if table is empty
INSERT INTO bot_configs (page_id, page_name, system_prompt, is_active)
SELECT '123456789', 'Victor IT Agency', 'You are a helpful AI assistant for Victor IT Agency...', true
WHERE NOT EXISTS (SELECT 1 FROM bot_configs LIMIT 1);
