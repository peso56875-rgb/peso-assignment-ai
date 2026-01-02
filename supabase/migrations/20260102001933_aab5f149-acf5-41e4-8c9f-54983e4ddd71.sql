-- Create table for storing user quiz history
CREATE TABLE public.quiz_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  question_image TEXT,
  solution TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing user assignment history
CREATE TABLE public.assignment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  professor_name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  department_name TEXT NOT NULL,
  university_logo TEXT,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_history
CREATE POLICY "Users can view their own quiz history"
ON public.quiz_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz history"
ON public.quiz_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz history"
ON public.quiz_history
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for assignment_history
CREATE POLICY "Users can view their own assignment history"
ON public.assignment_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignment history"
ON public.assignment_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignment history"
ON public.assignment_history
FOR DELETE
USING (auth.uid() = user_id);