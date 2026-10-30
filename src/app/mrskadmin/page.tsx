import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import { getSettings } from "@/lib/data";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (hasSupabase) {
    const { user } = await getAdminUser();
    if (user) redirect("/mrskadmin/dashboard");
  }
  const s = await getSettings();
  return <LoginForm name={s.name} configured={hasSupabase} />;
}
