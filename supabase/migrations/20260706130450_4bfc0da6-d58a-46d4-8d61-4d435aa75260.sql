
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles public read" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles user insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles user update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- created_by on chapters
ALTER TABLE public.chapters ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_chapters_created_by ON public.chapters(created_by);

-- Owner policies (admin policies already exist)
CREATE POLICY "chapters owner insert" ON public.chapters
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "chapters owner update" ON public.chapters
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "chapters owner delete" ON public.chapters
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Photos: owner of parent chapter can manage
CREATE POLICY "photos owner insert" ON public.photos
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.chapters c WHERE c.id = chapter_id AND c.created_by = auth.uid()));

CREATE POLICY "photos owner update" ON public.photos
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chapters c WHERE c.id = chapter_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.chapters c WHERE c.id = chapter_id AND c.created_by = auth.uid()));

CREATE POLICY "photos owner delete" ON public.photos
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.chapters c WHERE c.id = chapter_id AND c.created_by = auth.uid()));
