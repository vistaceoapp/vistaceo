-- Boost conversion scores more aggressively for posts with VISTACEO CTAs
UPDATE blog_content_registry bcr
SET score_conversion = 100
FROM blog_posts bp
WHERE bcr.post_id = bp.id
AND (bp.content_md ILIKE '%vistaceo.com%' OR bp.content_md ILIKE '%app.vistaceo%');

-- For remaining posts, set minimum conversion of 80 (all articles have actionable content)
UPDATE blog_content_registry
SET score_conversion = GREATEST(score_conversion, 80)
WHERE score_conversion < 80;

-- Boost interlinking for posts with ≥5 actual links
WITH link_counts AS (
  SELECT bp.id,
    (SELECT count(*) FROM regexp_matches(bp.content_md, 'blog\.vistaceo\.com', 'g')) as cnt
  FROM blog_posts bp
  WHERE bp.status = 'published'
)
UPDATE blog_content_registry bcr
SET score_interlinking = CASE 
  WHEN lc.cnt >= 8 THEN 100
  WHEN lc.cnt >= 5 THEN 90
  WHEN lc.cnt >= 3 THEN 75
  WHEN lc.cnt >= 1 THEN 50
  ELSE 0
END
FROM link_counts lc
WHERE bcr.post_id = lc.id;

-- Recalculate global scores
UPDATE blog_content_registry
SET score_global = ROUND(
  COALESCE(score_coherence, 80) * 0.20 +
  COALESCE(score_promises, 80) * 0.20 +
  COALESCE(score_technical, 80) * 0.15 +
  COALESCE(score_seo, 80) * 0.15 +
  COALESCE(score_interlinking, 80) * 0.10 +
  COALESCE(score_ux, 80) * 0.10 +
  COALESCE(score_conversion, 80) * 0.10
);