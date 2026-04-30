
-- 1) Archivar duplicados canibales y registrar redirects 301
UPDATE public.blog_posts SET status='archived' WHERE slug IN ('escribir-mejor-con-ia','ia-para-crear-imagenes-gratis');

INSERT INTO public.blog_redirects (from_slug, to_slug, reason)
VALUES 
  ('escribir-mejor-con-ia','como-escribir-mejor-con-ia','meta_description duplicate / topic cannibalization'),
  ('ia-para-crear-imagenes-gratis','ia-crear-imagenes-gratis-2026','meta_description duplicate / topic cannibalization')
ON CONFLICT (from_slug) DO UPDATE SET to_slug=EXCLUDED.to_slug, reason=EXCLUDED.reason;

-- 2) Reforzar firewall: bloquear meta_description duplicada y slug >75
CREATE OR REPLACE FUNCTION public.prevent_seo_problems()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  base_slug text;
  content_len int;
BEGIN
  IF NEW.status <> 'published' THEN RETURN NEW; END IF;

  IF NEW.slug IS NULL OR char_length(NEW.slug) < 10 OR char_length(NEW.slug) > 75
     OR NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_invalid_slug','error',NEW.slug,'Formato/largo de slug inválido (10-75 chars kebab-case)', jsonb_build_object('id', NEW.id));
    RAISE EXCEPTION 'SEO_BLOCK_INVALID_SLUG: el slug "%" no cumple kebab-case (10-75 chars).', NEW.slug;
  END IF;

  IF NEW.slug ~ '-[0-9]{8}$' THEN
    base_slug := regexp_replace(NEW.slug, '-[0-9]{8}$', '');
    IF EXISTS (SELECT 1 FROM public.blog_posts WHERE slug=base_slug AND status='published' AND id<>NEW.id) THEN
      INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
      VALUES ('block_dated_duplicate','error',NEW.slug,'Duplicado dated suffix', jsonb_build_object('canonical', base_slug));
      RAISE EXCEPTION 'SEO_BLOCK_DATED_DUPLICATE: "%" canibaliza al canónico "%".', NEW.slug, base_slug;
    END IF;
  END IF;

  IF NEW.primary_keyword IS NOT NULL AND length(trim(NEW.primary_keyword)) > 0 THEN
    IF EXISTS (SELECT 1 FROM public.blog_posts WHERE status='published' AND id<>NEW.id AND lower(trim(primary_keyword))=lower(trim(NEW.primary_keyword))) THEN
      INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
      VALUES ('block_keyword_cannibalization','error',NEW.slug,'primary_keyword duplicada', jsonb_build_object('keyword', NEW.primary_keyword));
      RAISE EXCEPTION 'SEO_BLOCK_KEYWORD_CANNIBALIZATION: ya existe otro post publicado con primary_keyword "%".', NEW.primary_keyword;
    END IF;
  END IF;

  -- NUEVO: Bloquear meta_description duplicada
  IF NEW.meta_description IS NOT NULL AND length(trim(NEW.meta_description)) >= 60 THEN
    IF EXISTS (SELECT 1 FROM public.blog_posts WHERE status='published' AND id<>NEW.id AND lower(trim(meta_description))=lower(trim(NEW.meta_description))) THEN
      INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
      VALUES ('block_meta_duplicate','error',NEW.slug,'meta_description duplicada', '{}'::jsonb);
      RAISE EXCEPTION 'SEO_BLOCK_META_DUPLICATE: meta_description del post "%" ya existe en otro post publicado.', NEW.slug;
    END IF;
  END IF;

  IF (NEW.meta_description IS NULL OR length(trim(NEW.meta_description)) < 60)
     AND (NEW.excerpt IS NULL OR length(trim(NEW.excerpt)) < 60) THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_thin_meta','error',NEW.slug,'Sin meta_description ni excerpt válidos','{}'::jsonb);
    RAISE EXCEPTION 'SEO_BLOCK_THIN_META: el post "%" no tiene meta_description ni excerpt de al menos 60 chars.', NEW.slug;
  END IF;

  content_len := COALESCE(char_length(NEW.content_md), 0);
  IF content_len < 1500 THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_thin_content','error',NEW.slug,'Contenido demasiado corto', jsonb_build_object('len', content_len));
    RAISE EXCEPTION 'SEO_BLOCK_THIN_CONTENT: contenido de "%" es de % chars; mínimo 1500.', NEW.slug, content_len;
  END IF;

  IF NEW.publish_at IS NOT NULL AND NEW.publish_at > now() + interval '1 day' THEN
    INSERT INTO public.seo_health_log(event_type, severity, slug, reason, details)
    VALUES ('block_future_publish','warning',NEW.slug,'publish_at futuro lejano', jsonb_build_object('publish_at', NEW.publish_at));
    RAISE EXCEPTION 'SEO_BLOCK_FUTURE_PUBLISH: publish_at de "%" está más de 24h en el futuro (%).', NEW.slug, NEW.publish_at;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_seo_problems_trigger ON public.blog_posts;
CREATE TRIGGER prevent_seo_problems_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.prevent_seo_problems();
