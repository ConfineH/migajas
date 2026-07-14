import {
  getContentCache,
  setContentCache,
  type ContentCache,
} from "@/lib/content-cache";
import {
  mapFoodRow,
  mapLessonRow,
  mapLevelExamRow,
  type FoodRow,
  type LessonRow,
  type LevelExamRow,
} from "@/lib/domain/content-mappers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

let hydratePromise: Promise<void> | null = null;

export async function refreshContentFromSupabase(): Promise<boolean> {
  hydratePromise = null;
  const remote = await fetchFromSupabase();
  if (!remote) return false;
  setContentCache(remote);
  return true;
}

async function fetchFromSupabase(): Promise<ContentCache | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const [foodsRes, lessonsRes, examsRes] = await Promise.all([
      supabase.from("foods").select("*").order("name"),
      supabase.from("lessons").select("*").order("order_index"),
      supabase.from("level_exams").select("*").order("level_id"),
    ]);

    if (foodsRes.error || lessonsRes.error || examsRes.error) return null;
    if (!foodsRes.data?.length || !lessonsRes.data?.length) return null;

    return {
      foods: (foodsRes.data as FoodRow[]).map(mapFoodRow),
      lessons: (lessonsRes.data as LessonRow[]).map(mapLessonRow),
      exams: (examsRes.data as LevelExamRow[]).map(mapLevelExamRow),
      source: "supabase",
    };
  } catch {
    return null;
  }
}

export async function hydrateContentFromSupabase(): Promise<void> {
  if (getContentCache().source === "supabase") return;
  if (hydratePromise) {
    await hydratePromise;
    return;
  }

  hydratePromise = (async () => {
    const remote = await fetchFromSupabase();
    if (remote) setContentCache(remote);
  })();

  await hydratePromise;
}
