
-- Limpiar candado seeding para negocios sin oportunidades ni misiones, así el seed vuelve a correr con el fix de contexto
UPDATE businesses
SET settings = COALESCE(settings, '{}'::jsonb) - 'seeding_completed_at' - 'seeding_started_at'
WHERE setup_completed = true
  AND id IN (
    SELECT b.id FROM businesses b
    LEFT JOIN opportunities o ON o.business_id = b.id
    LEFT JOIN missions m ON m.business_id = b.id
    WHERE b.setup_completed = true
    GROUP BY b.id
    HAVING COUNT(o.id) = 0 AND COUNT(m.id) = 0
  );
