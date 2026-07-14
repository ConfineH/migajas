import { getFoods } from "@/lib/data/foods";
import { getActiveRegion } from "@/lib/region-server";

export async function getRegionalContentContext() {
  const region = await getActiveRegion();
  return {
    region,
    foods: getFoods(),
  };
}
