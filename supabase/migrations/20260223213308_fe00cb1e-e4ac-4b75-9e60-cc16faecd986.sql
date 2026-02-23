-- Expand business_category enum to support universal profiles
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'ecommerce';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'servicio_profesional';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'freelancer';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'empleado';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'comercio';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'b2b';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'salud';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'educacion';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'agencia';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'creador';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'industria';
ALTER TYPE public.business_category ADD VALUE IF NOT EXISTS 'otro';