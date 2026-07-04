-- 1. Create student_profiles table
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  application_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  course TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert profiles" ON public.student_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update profiles" ON public.student_profiles FOR UPDATE USING (true);

-- 2. Rename folder_number to application_number

-- Drop foreign key constraint in student_documents
ALTER TABLE public.student_documents DROP CONSTRAINT IF EXISTS student_documents_folder_number_fkey;

-- Drop existing application_number in first_year_data to avoid collision
ALTER TABLE public.first_year_data DROP COLUMN IF EXISTS application_number;

-- Rename the column in both tables
ALTER TABLE public.first_year_data RENAME COLUMN folder_number TO application_number;
ALTER TABLE public.student_documents RENAME COLUMN folder_number TO application_number;

-- Re-add the foreign key constraint
ALTER TABLE public.student_documents ADD CONSTRAINT student_documents_application_number_fkey 
FOREIGN KEY (application_number) REFERENCES public.first_year_data(application_number) ON DELETE CASCADE;
