import { NavBar } from "@/components/NavBar";
import { getFreeModeStatus } from "@/lib/free-mode";

export async function AppNavBar() {
  const freeMode = await getFreeModeStatus();
  return <NavBar freeMode={freeMode} />;
}
