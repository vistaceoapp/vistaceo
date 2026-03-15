-- Fix interlinking scores based on actual content link counts
-- Update scores for posts that actually have internal links in their content

-- First update interlinking scores based on actual link count in content
WITH link_counts AS (
  SELECT bp.id,
    (SELECT count(*) FROM regexp_matches(bp.content_md, 'blog\.vistaceo\.com', 'g')) as cnt
  FROM blog_posts bp
  WHERE bp.status = 'published'
)
UPDATE blog_content_registry bcr
SET score_interlinking = CASE 
  WHEN lc.cnt >= 8 THEN 100
  WHEN lc.cnt >= 5 THEN 80
  WHEN lc.cnt >= 3 THEN 60
  WHEN lc.cnt >= 1 THEN 30
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
  COALESCE(score_conversion, 70) * 0.10
);

-- Mark interlinking issues as fixed for posts that now have ≥3 links
UPDATE blog_audit_issues bai
SET fix_applied = true, fixed_at = now()
FROM blog_content_registry bcr
WHERE bai.registry_id = bcr.id
AND bai.issue_type = 'interlinking'
AND bai.fix_applied = false
AND bcr.score_interlinking >= 60;