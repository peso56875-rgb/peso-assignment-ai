-- Create presentation_history table
CREATE TABLE public.presentation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  professor_name TEXT,
  college_name TEXT NOT NULL,
  department_name TEXT,
  university_logo TEXT,
  topic TEXT NOT NULL,
  slides_count INTEGER NOT NULL DEFAULT 10,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.presentation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own presentation history"
ON public.presentation_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentation history"
ON public.presentation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation history"
ON public.presentation_history
FOR DELETE
USING (auth.uid() = user_id);