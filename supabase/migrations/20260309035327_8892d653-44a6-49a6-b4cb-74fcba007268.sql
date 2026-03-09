-- Allow authenticated users with admin role to read social_publications
CREATE POLICY "Admins can read social_publications"
ON public.social_publications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete social_publications (for regeneration)
CREATE POLICY "Admins can delete social_publications"
ON public.social_publications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));