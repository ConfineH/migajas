import foodsJson from "@/lib/data/foods.json";
import lessonsJson from "@/lib/data/lessons.json";
import examsJson from "@/lib/data/exams.json";
import type { FoodItem } from "@/lib/domain/foods";
import type { Lesson, LevelExam } from "@/lib/domain/lessons";

export interface ContentCache {
  foods: FoodItem[];
  lessons: Lesson[];
  exams: LevelExam[];
  source: "supabase" | "json";
}

let cache: ContentCache = {
  foods: foodsJson as FoodItem[],
  lessons: lessonsJson as Lesson[],
  exams: examsJson as LevelExam[],
  source: "json",
};

export function getContentCache(): ContentCache {
  return cache;
}

export function setContentCache(next: ContentCache): void {
  cache = next;
}

export function resetContentCacheForTests(): void {
  cache = {
    foods: foodsJson as FoodItem[],
    lessons: lessonsJson as Lesson[],
    exams: examsJson as LevelExam[],
    source: "json",
  };
}
