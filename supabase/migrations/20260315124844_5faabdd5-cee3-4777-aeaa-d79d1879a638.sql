-- Clear false-positive "supabase" system leak issues (they're storage URLs)
DELETE FROM blog_audit_issues 
WHERE issue_type = 'technical' 
AND description ILIKE '%supabase%'
AND fix_applied = false;