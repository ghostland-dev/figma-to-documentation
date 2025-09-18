-- Create export logs table for tracking export activity
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'html', 'markdown', 'presentation')),
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export logs" ON export_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export logs" ON export_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_project_id ON export_logs(project_id);
CREATE INDEX idx_export_logs_created_at ON export_logs(created_at);
