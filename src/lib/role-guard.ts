import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export async function currentUserIsAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!role;
}

export async function requireAdminOrRedirect() {
  if (!(await currentUserIsAdmin())) {
    throw redirect({ to: "/my/chapters" });
  }
}

export async function requireNonAdminOrRedirect() {
  if (await currentUserIsAdmin()) {
    throw redirect({ to: "/admin" });
  }
}
