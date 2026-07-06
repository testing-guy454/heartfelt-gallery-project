
-- Anniversary Timeline schema

CREATE TABLE public.milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  date date NOT NULL,
  description text,
  handwritten_note text,
  cover_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  location_name text,
  latitude numeric,
  longitude numeric,
  music_url text,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  emoji text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX milestones_date_idx ON public.milestones (date);
CREATE INDEX milestones_sort_idx ON public.milestones (sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Only admins can write milestones.
CREATE POLICY "Admins manage milestones"
ON public.milestones
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Signed-in users can read (server fns using publishable client bypass this;
-- authenticated readers may still peek).
CREATE POLICY "Authenticated can read milestones"
ON public.milestones
FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER milestones_set_updated_at
BEFORE UPDATE ON public.milestones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- Single-row relationship settings

CREATE TABLE public.relationship_settings (
  id boolean NOT NULL PRIMARY KEY DEFAULT true CHECK (id = true),
  start_date date,
  tagline text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.relationship_settings TO authenticated;
GRANT ALL ON public.relationship_settings TO service_role;

ALTER TABLE public.relationship_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage relationship settings"
ON public.relationship_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read relationship settings"
ON public.relationship_settings
FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER relationship_settings_set_updated_at
BEFORE UPDATE ON public.relationship_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the singleton row so admins can update it in-place.
INSERT INTO public.relationship_settings (id, start_date, tagline)
VALUES (true, NULL, 'Every day has become another beautiful memory.')
ON CONFLICT (id) DO NOTHING;
