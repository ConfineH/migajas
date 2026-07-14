import { AppNavBar } from "@/components/AppNavBar";
import {
  ClinicalAccessMessage,
} from "@/components/ClinicalModePrompt";
import { DiaryClient, type DiaryEntryView } from "@/components/DiaryClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireClinicalAccess } from "@/lib/clinical-access";
import { getFoodsForCountry, getFoodById } from "@/lib/data/foods";
import { enrichFoods } from "@/lib/domain/foods";
import { formatExchangeRule, getRegionById } from "@/lib/domain/regions";
import { listIntakeEntries } from "@/lib/supabase/intake";

export const metadata = {
  title: "Diario — Migajas",
};

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function DiaryPage() {
  const access = await requireClinicalAccess();
  const today = getTodayLocalDate();

  if (!access.ok) {
    const action =
      access.reason === "auth"
        ? { href: "/login?next=/diario", label: "Iniciar sesión" }
        : access.reason === "nivel"
          ? { href: "/learn", label: "Ir al curso" }
          : access.reason === "opt-in"
            ? { href: "/onboarding", label: "Abrir configuración" }
            : undefined;

    return (
      <>
        <AppNavBar />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
          <ClinicalAccessMessage
            title={
              access.reason === "auth"
                ? "Inicia sesión para usar el diario"
                : access.reason === "nivel"
                  ? "Completa el nivel 3 primero"
                  : "Activa el modo clínico"
            }
            description={access.error}
            actionHref={action?.href}
            actionLabel={action?.label}
          />
        </main>
      </>
    );
  }

  const region = getRegionById(access.profile.region_id);
  const foods = enrichFoods(
    getFoodsForCountry(region.foodCountry),
    region.exchangeUnitG,
  );
  const rawEntries = await listIntakeEntries(access.user.id, today, today);
  const entries: DiaryEntryView[] = rawEntries.map((entry) => {
    const food = getFoodById(entry.food_id);
    return {
      ...entry,
      foodName: food?.name ?? entry.food_id,
      portionText: food?.portionText ?? "",
      editable: entry.local_date === today,
    };
  });

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Diario de ingesta"
          description="Registra lo que comes hoy para llevar un seguimiento de carbohidratos."
        />
        <DiaryClient
          initialEntries={entries}
          foods={foods}
          localDate={today}
          dailyGoalG={access.profile.daily_carb_goal_g}
          exchangeRuleLabel={formatExchangeRule(region)}
        />
      </main>
    </>
  );
}
