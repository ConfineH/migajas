import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminShell } from "@/app/admin/AdminShell";
import { FoodList } from "@/app/admin/foods/FoodList";
import { getContentCache } from "@/lib/content-cache";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin alimentos — Migajas",
};

export default async function AdminFoodsPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const foods = getContentCache().foods;

  return (
    <>
      <AppNavBar />
      <AdminShell
        title="Alimentos"
        description={`${foods.length} ítems editables`}
      >
        <FoodList foods={foods} />
      </AdminShell>
    </>
  );
}
