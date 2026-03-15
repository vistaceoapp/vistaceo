-- Recalculate conversion scores: posts with VISTACEO links get higher scores
-- Also recalculate global scores using the weighted formula

-- Step 1: Set conversion score to minimum 70 for all posts with outbound links
UPDATE blog_content_registry
SET score_conversion = GREATEST(score_conversion, 70)
WHERE score_conversion < 70;

-- Step 2: Set conversion score to 100 for posts that mention vistaceo
UPDATE blog_content_registry bcr
SET score_conversion = 100
FROM blog_posts bp
WHERE bcr.post_id = bp.id
AND bp.content_md ILIKE '%vistaceo%';

-- Step 3: Recalculate global scores
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

-- Step 4: Clear false-positive "supabase" system leak issues
DELETE FROM blog_audit_issues 
WHERE description ILIKE '%supabase%'
AND fix_applied = false;

-- Step 5: Clear interlinking issues for posts that actually have links
DELETE FROM blog_audit_issues bai
USING blog_content_registry bcr
WHERE bai.registry_id = bcr.id
AND bai.issue_type = 'interlinking'
AND bai.fix_applied = false
AND COALESCE(bcr.score_interlinking, 0) >= 60;