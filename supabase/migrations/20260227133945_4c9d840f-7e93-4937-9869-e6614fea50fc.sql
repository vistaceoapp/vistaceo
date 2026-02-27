-- Drop the partial unique index and create a full one
DROP INDEX IF EXISTS idx_external_data_external_id_integration_id;
CREATE UNIQUE INDEX idx_external_data_ext_id_int_id 
ON public.external_data (external_id, integration_id);