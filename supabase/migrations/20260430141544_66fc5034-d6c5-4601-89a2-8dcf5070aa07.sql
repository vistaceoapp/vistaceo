-- 1. Tabla de redirects 301 públicos
CREATE TABLE IF NOT EXISTS public.blog_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_slug text NOT NULL UNIQUE,
  to_slug text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_redirects_public_read"
  ON public.blog_redirects FOR SELECT
  USING (true);

CREATE POLICY "blog_redirects_admin_insert"
  ON public.blog_redirects FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blog_redirects_admin_update"
  ON public.blog_redirects FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blog_redirects_admin_delete"
  ON public.blog_redirects FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Registrar los redirects de los duplicados ANTES de archivarlos
INSERT INTO public.blog_redirects (from_slug, to_slug, reason) VALUES
  ('agentes-ia-que-son-como-funcionan-20260312', 'agentes-ia-que-son-como-funcionan', 'duplicate_dated_suffix'),
  ('como-reconvertirte-sin-empezar-de-cero-plan-realista-en-90-dias-20260320', 'como-reconvertirte-sin-empezar-de-cero-plan-realista-en-90-dias', 'duplicate_dated_suffix'),
  ('como-armar-un-cv-que-demuestre-impacto-sin-inflar-experiencia-20260215', 'como-armar-un-cv-que-demuestre-impacto-sin-inflar-experiencia', 'duplicate_dated_suffix'),
  ('los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican-20260320', 'los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican', 'duplicate_dated_suffix'),
  ('los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican-20260216', 'los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican', 'duplicate_dated_suffix'),
  ('ia-para-restaurantes-operaciones-20260314', 'ia-para-restaurantes-operaciones', 'duplicate_dated_suffix'),
  -- URL malformada histórica que Google rastreó (sin trailing slash)
  ('automatizacion-ia-pymes-sin-programar20', 'automatizacion-ia-pymes-sin-programar', 'malformed_historic_url')
ON CONFLICT (from_slug) DO NOTHING;

-- 3. Archivar los duplicados (no borrar para preservar historia)
UPDATE public.blog_posts
SET status = 'archived',
    updated_at = now()
WHERE status = 'published'
  AND slug IN (
    'agentes-ia-que-son-como-funcionan-20260312',
    'como-reconvertirte-sin-empezar-de-cero-plan-realista-en-90-dias-20260320',
    'como-armar-un-cv-que-demuestre-impacto-sin-inflar-experiencia-20260215',
    'los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican-20260320',
    'los-trabajos-que-mas-crecen-con-ia-y-los-que-se-achican-20260216',
    'ia-para-restaurantes-operaciones-20260314'
  );

-- 4. Trigger preventivo: bloquear futuros duplicados con sufijo -YYYYMMDD
CREATE OR REPLACE FUNCTION public.prevent_duplicate_slug_versions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
BEGIN
  -- Solo aplica cuando el post se va a publicar
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  -- Si el slug NO termina en -YYYYMMDD, dejamos pasar
  IF NEW.slug !~ '-[0-9]{8}$' THEN
    RETURN NEW;
  END IF;

  base_slug := regexp_replace(NEW.slug, '-[0-9]{8}$', '');

  -- Si ya existe la versión base publicada, bloquear
  IF EXISTS (
    SELECT 1 FROM public.blog_posts
    WHERE slug = base_slug
      AND status = 'published'
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'SEO_DUPLICATE_BLOCK: el slug "%" canibaliza al canónico "%". Edita el post canónico en lugar de crear un duplicado con sufijo de fecha.', NEW.slug, base_slug;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_slug_versions_trigger ON public.blog_posts;
CREATE TRIGGER prevent_duplicate_slug_versions_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_slug_versions();

-- 5. Index para lookups rápidos
CREATE INDEX IF NOT EXISTS blog_redirects_from_slug_idx ON public.blog_redirects(from_slug);