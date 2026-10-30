import Dashboard from "@/components/admin/Dashboard";
import { getAdminUser } from "@/lib/supabase/server";

export default async function Page() {
  const { user } = await getAdminUser();
  return <Dashboard email={user?.email ?? ""} />;
}
