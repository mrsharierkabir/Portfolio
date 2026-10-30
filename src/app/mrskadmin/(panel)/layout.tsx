import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) redirect("/mrskadmin");
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect("/mrskadmin");
  if (!isAdmin) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-6">
        <div className="max-w-md rounded-2xl border border-line bg-card p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">Almost there</h1>
          <p className="mt-3 text-ink-2">You&apos;re signed in as <strong>{user.email}</strong>, but this account isn&apos;t an admin yet. Run this once in Supabase → SQL Editor:</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-xs text-paper">{`insert into public.admins (user_id)\nselect id from auth.users\nwhere email = '${user.email}';`}</pre>
          <p className="mt-4 text-sm text-muted">Then refresh this page.</p>
        </div>
      </main>
    );
  }
  return <AdminShell email={user.email ?? ""}>{children}</AdminShell>;
}
