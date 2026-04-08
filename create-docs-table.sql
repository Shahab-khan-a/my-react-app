-- Create the docs table for the documentary app
CREATE TABLE IF NOT EXISTS docs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100) DEFAULT 'General',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
-- ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

-- For now, disable RLS to allow public access without authentication
ALTER TABLE docs DISABLE ROW LEVEL SECURITY;

-- Create policies for public access (commented out since RLS is disabled)
-- DROP POLICY IF EXISTS "Allow all operations on docs" ON docs;
-- CREATE POLICY "Allow all operations on docs"
--     ON docs FOR ALL
--     TO public
--     USING (true)
--     WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_docs_category ON docs(category);
CREATE INDEX IF NOT EXISTS idx_docs_status ON docs(status);
CREATE INDEX IF NOT EXISTS idx_docs_created_at ON docs(created_at DESC);

-- Create a function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_docs_updated_at ON docs;
CREATE TRIGGER update_docs_updated_at
    BEFORE UPDATE ON docs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample documents (optional - you can remove this)
INSERT INTO docs (title, content, category, status) VALUES
('Getting Started with React', '# Getting Started with React\n\nReact is a JavaScript library for building user interfaces.\n\n## Installation\n\n```bash\nnpm install react react-dom\n```\n\n## Basic Example\n\n```jsx\nfunction App() {\n  return <h1>Hello, World!</h1>;\n}\n```', 'Tutorial', 'published'),
('TypeScript Best Practices', '# TypeScript Best Practices\n\nTypeScript adds static typing to JavaScript.\n\n## Key Features\n- Type safety\n- Better IDE support\n- Easier refactoring\n\n## Example\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}!`;\n}\n```', 'Guide', 'published');