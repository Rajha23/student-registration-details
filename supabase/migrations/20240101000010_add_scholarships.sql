ALTER TABLE public.first_year_data
ADD COLUMN IF NOT EXISTS apply_pmss_scholarship TEXT,
ADD COLUMN IF NOT EXISTS apply_bc_mbc_scholarship TEXT;
