CREATE POLICY "Anon can read milestones" ON public.milestones FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read relationship settings" ON public.relationship_settings FOR SELECT TO anon USING (true);
GRANT SELECT ON public.milestones TO anon;
GRANT SELECT ON public.relationship_settings TO anon;