-- Add new countries to the country_code enum
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'ES';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'PE';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'DO';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'GT';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'SV';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'BO';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'HN';
ALTER TYPE public.country_code ADD VALUE IF NOT EXISTS 'NI';