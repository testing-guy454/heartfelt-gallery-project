
-- Switch SECURITY DEFINER functions to SECURITY INVOKER and lock down EXECUTE.
-- has_role only reads public.user_roles, which authenticated users can already
-- read for their own user_id via existing RLS, so INVOKER is sufficient for the
-- self-role checks used across the app's policies.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Lock down EXECUTE. set_updated_at is only used as a trigger, so no client
-- role needs EXECUTE. has_role stays callable by authenticated (RLS policies
-- run as the querying role and reference it).
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
