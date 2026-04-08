-- Run this SQL in your Supabase SQL Editor to create the static_data table

-- Create the static_data table
CREATE TABLE IF NOT EXISTS static_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional - can be adjusted based on needs)
ALTER TABLE static_data ENABLE ROW LEVEL SECURITY;

-- Create a policy for admin access (adjust as needed)
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON static_data;
CREATE POLICY "Allow all access to authenticated users" 
    ON static_data FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_static_data_category ON static_data(category);

-- Insert sample data (you can delete or modify these)
INSERT INTO static_data (category, name, description, icon, order_index) VALUES
('language', 'Java', 'A high-level, class-based programming language', 'java', 1),
('language', 'React', 'A JavaScript library for building user interfaces', 'react', 2),
('language', 'CSS', 'Cascading Style Sheets for styling web pages', 'css', 3),
('language', 'TypeScript', 'JavaScript with syntax for types', 'typescript', 4),
('language', 'Python', 'A high-level programming language', 'python', 5),
('framework', 'Next.js', 'The React Framework for the Web', 'nextjs', 1),
('framework', 'Node.js', 'JavaScript runtime built on Chrome V8', 'nodejs', 2),
('framework', 'Express', 'Fast, unopinionated web framework for Node.js', 'express', 3),
('tool', 'VS Code', 'Visual Studio Code editor', 'vscode', 1),
('tool', 'Git', 'Distributed version control system', 'git', 2),
('tool', 'Docker', 'Platform to use containers', 'docker', 3);

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update
DROP TRIGGER IF EXISTS update_static_data_updated_at ON static_data;
CREATE TRIGGER update_static_data_updated_at 
    BEFORE UPDATE ON static_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
