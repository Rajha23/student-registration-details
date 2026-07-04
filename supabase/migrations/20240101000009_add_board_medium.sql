ALTER TABLE public.first_year_data
ADD COLUMN IF NOT EXISTS tenth_board TEXT,
ADD COLUMN IF NOT EXISTS tenth_medium TEXT,
ADD COLUMN IF NOT EXISTS twelfth_board TEXT,
ADD COLUMN IF NOT EXISTS twelfth_medium TEXT;
