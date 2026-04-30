-- 1. Tabla de auditoría SEO
CREATE TABLE IF NOT EXISTS public.seo_health_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  slug text,
  reason text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_health_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_health_log_admin_read"
  ON public.seo_health_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "seo_health_log_admin_delete"
  ON public.seo_health_log FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "seo_health_log_service_write"
  ON public.seo_health_log FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS seo_health_log_created_idx ON public.seo_health_log(created_at DESC);

-- 2. Reemplazar trigger anti-canibalización con uno EXHAUSTIVO
DROP TRIGGER IF EXISTS prevent_duplicate_slug_versions_trigger ON public.blog_posts;
DROP FUNCTION IF EXISTS public.prevent_duplicate_slug_versions();

CREATE OR REPLACE FUNCTION public.prevent_seo_problems()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  content_len int;
BEGIN
  -- Solo aplica al publicar
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  -- A) Validar formato del slug (kebab-case estricto, 10..120 chars)
  IF NEW.slug IS NULL
     OR char_length(NEW.slug) < 10
     OR char_length(NEW.slug) > 120
     OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_invalid_slug', 'error', NEW.slug, 'Formato de slug inválido', jsonb_build_object('id', NEW.id));
    RAISE EXCEPTION 'SEO_BLOCK_INVALID_SLUG: el slug "%" no cumple kebab-case (a-z, 0-9, guiones simples, 10-120 chars).', NEW.slug;
  END IF;

  -- B) Bloquear duplicado con sufijo -YYYYMMDD si ya existe el base publicado
  IF NEW.slug ~ '-[0-9]{8}$' THEN
    base_slug := regexp_replace(NEW.slug, '-[0-9]{8}$', '');
    IF EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE slug = base_slug AND status = 'published' AND id <> NEW.id
    ) THEN
      INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
      VALUES ('block_dated_duplicate', 'error', NEW.slug, 'Duplicado dated suffix', jsonb_build_object('canonical', base_slug));
      RAISE EXCEPTION 'SEO_BLOCK_DATED_DUPLICATE: "%" canibaliza al canónico "%". Editá el canónico en lugar de duplicar con sufijo de fecha.', NEW.slug, base_slug;
    END IF;
  END IF;

  -- C) Bloquear primary_keyword duplicado entre posts publicados (canibalización temática)
  IF NEW.primary_keyword IS NOT NULL AND length(trim(NEW.primary_keyword)) > 0 THEN
    IF EXISTS (
      SELECT 1 FROM public.blog_posts
      WHERE status = 'published'
        AND id <> NEW.id
        AND lower(trim(primary_keyword)) = lower(trim(NEW.primary_keyword))
    ) THEN
      INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
      VALUES ('block_keyword_cannibalization', 'error', NEW.slug, 'primary_keyword duplicada', jsonb_build_object('keyword', NEW.primary_keyword));
      RAISE EXCEPTION 'SEO_BLOCK_KEYWORD_CANNIBALIZATION: ya existe otro post publicado con primary_keyword "%". Diferenciá el ángulo o usá otra palabra clave.', NEW.primary_keyword;
    END IF;
  END IF;

  -- D) Exigir meta_description o excerpt
  IF (NEW.meta_description IS NULL OR length(trim(NEW.meta_description)) < 60)
     AND (NEW.excerpt IS NULL OR length(trim(NEW.excerpt)) < 60) THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_thin_meta', 'error', NEW.slug, 'Sin meta_description ni excerpt válidos', '{}'::jsonb);
    RAISE EXCEPTION 'SEO_BLOCK_THIN_META: el post "%" no tiene meta_description ni excerpt de al menos 60 caracteres.', NEW.slug;
  END IF;

  -- E) Bloquear thin content (<1500 chars)
  content_len := COALESCE(char_length(NEW.content_md), 0);
  IF content_len < 1500 THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_thin_content', 'error', NEW.slug, 'Contenido demasiado corto', jsonb_build_object('len', content_len));
    RAISE EXCEPTION 'SEO_BLOCK_THIN_CONTENT: contenido de "%" es de % chars; mínimo 1500 para publicar.', NEW.slug, content_len;
  END IF;

  -- F) publish_at no puede estar más de 1 día en el futuro (cron quedaría bloqueado)
  IF NEW.publish_at IS NOT NULL AND NEW.publish_at > now() + interval '1 day' THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_future_publish', 'warning', NEW.slug, 'publish_at futuro lejano', jsonb_build_object('publish_at', NEW.publish_at));
    RAISE EXCEPTION 'SEO_BLOCK_FUTURE_PUBLISH: publish_at de "%" está más de 24h en el futuro (%). Si querés programar, dejalo en draft.', NEW.slug, NEW.publish_at;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_seo_problems_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_seo_problems();