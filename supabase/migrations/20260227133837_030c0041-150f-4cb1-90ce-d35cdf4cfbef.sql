-- Add unique constraint for upsert to work on external_data
CREATE UNIQUE INDEX IF NOT EXISTS idx_external_data_external_id_integration_id 
ON public.external_data (external_id, integration_id) 
WHERE external_id IS NOT NULL;