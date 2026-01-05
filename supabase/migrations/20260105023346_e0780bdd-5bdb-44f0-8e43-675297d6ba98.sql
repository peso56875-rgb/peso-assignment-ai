-- Create user_credits table for storing user credit balances
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
ON public.user_credits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

-- Create credit_transactions table for tracking all transactions
CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create exam_history table for storing generated exams
CREATE TABLE public.exam_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    content TEXT NOT NULL,
    questions JSONB NOT NULL,
    difficulty TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on exam_history
ALTER TABLE public.exam_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for exam_history
CREATE POLICY "Users can view their own exam history"
ON public.exam_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam history"
ON public.exam_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam history"
ON public.exam_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on user_credits
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize user credits on signup (callable via trigger or manually)
CREATE OR REPLACE FUNCTION public.initialize_user_credits(p_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (p_user_id, 100)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_user_id, 100, 'credit', 'رصيد ترحيبي للمستخدم الجديد');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check and deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits INTO current_credits FROM public.user_credits WHERE user_id = p_user_id;
    
    IF current_credits IS NULL OR current_credits < p_amount THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.user_credits SET credits = credits - p_amount WHERE user_id = p_user_id;
    
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_user_id, p_amount, 'debit', p_description);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;