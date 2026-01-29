-- Agregar EC y PY al enum country_code
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'EC';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'PY';