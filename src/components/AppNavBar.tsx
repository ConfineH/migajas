import { NavBar } from "@/components/NavBar";
import { getFreeModeStatus } from "@/lib/free-mode";
import { getAuthUser } from "@/lib/supabase/auth";

export async function AppNavBar() {
  const [freeMode, user] = await Promise.all([
    getFreeModeStatus(),
    getAuthUser(),
  ]);
  return <NavBar freeMode={freeMode} user={user} />;
}
