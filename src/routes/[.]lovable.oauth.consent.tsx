import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNamespace = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{
    data: {
      client?: { name?: string } | null;
      redirect_url?: string | null;
      redirect_to?: string | null;
    } | null;
    error: { message: string } | null;
  }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string | null; redirect_to?: string | null } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string | null; redirect_to?: string | null } | null;
    error: { message: string } | null;
  }>;
};

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) {
      throw redirect({ to: "/", search: { next } as never });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p className="serif italic text-ink">
        Could not load this authorization request: {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauth();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10 bg-[color:var(--paper)]">
      <div
        className="w-full max-w-md bg-[color:var(--letter-paper)] border border-[color:var(--sepia)]/30 shadow-[0_20px_50px_-24px_rgba(80,40,30,0.5)] px-8 py-9"
        style={{ transform: "rotate(-0.3deg)" }}
      >
        <p className="stamp-font text-[0.55rem] tracking-[0.42em] text-[color:var(--sepia)]/85 uppercase text-center">
          authorize connection
        </p>
        <h1 className="serif italic text-3xl text-ink mt-2 text-center">
          Connect {clientName}
        </h1>
        <p className="serif text-ink/80 mt-4 text-center">
          This lets <em>{clientName}</em> read your album on your behalf.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-800 text-center">
            {error}
          </p>
        )}
        <div className="mt-7 flex gap-3 justify-center">
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="px-5 py-2 border border-[color:var(--sepia)]/50 text-ink serif disabled:opacity-50"
          >
            Deny
          </button>
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="px-5 py-2 bg-[color:var(--sepia)] text-[color:var(--paper)] serif disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
    </main>
  );
}
