-- 1. Create a table to track uploaded documents
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_number TEXT NOT NULL REFERENCES public.student_basic_details(folder_number) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Allow public access for reading and uploading
DROP POLICY IF EXISTS "Public can read documents" ON public.student_documents;
CREATE POLICY "Public can read documents" ON public.student_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert documents" ON public.student_documents;
CREATE POLICY "Public can insert documents" ON public.student_documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete documents" ON public.student_documents;
CREATE POLICY "Public can delete documents" ON public.student_documents FOR DELETE USING (true);


-- 2. Create the Storage Bucket for holding the actual files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student_certificates', 'student_certificates', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies to allow public uploads and reads
-- (RLS is already enabled on storage.objects by default)

DROP POLICY IF EXISTS "Anyone can read certificates" ON storage.objects;
CREATE POLICY "Anyone can read certificates" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'student_certificates');

DROP POLICY IF EXISTS "Anyone can upload certificates" ON storage.objects;
CREATE POLICY "Anyone can upload certificates" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'student_certificates');

DROP POLICY IF EXISTS "Anyone can update certificates" ON storage.objects;
CREATE POLICY "Anyone can update certificates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'student_certificates');

DROP POLICY IF EXISTS "Anyone can delete certificates" ON storage.objects;
CREATE POLICY "Anyone can delete certificates" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'student_certificates');
