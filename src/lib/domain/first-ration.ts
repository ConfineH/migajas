import type { FoodItem } from "./foods";
import { enrichFoodItem, type EnrichedFoodItem } from "./foods";
import type { RegionId } from "./user-profile";
import { calculateRations } from "./rations";
import { formatExchangeRule, getRegionById } from "./regions";

export const FIRST_RATION_STAPLE_IDS: Record<RegionId, readonly string[]> = {
  es: [
    "pan-blanco",
    "arroz-cocido",
    "pasta-cocida",
    "manzana",
    "yogur-natural",
    "leche",
  ],
  do: [
    "casabe",
    "arroz-blanco-do",
    "do-yuca",
    "habichuelas-rojas",
    "do-banana",
    "do-yogur-do",
  ],
};

export const FIRST_RATION_COPY = {
  title: "Tu primera ración",
  lead: "Seis alimentos de tu país. Estima uno, y después sigue el curso.",
  galleryHeading: "Comidas de esta noche",
  questionLead: "Según la regla de tu país, ¿cuántas raciones tiene esta porción?",
  continue: "Seguir al curso",
  skip: "Saltar y ir al curso",
  check: "Comprobar",
  correct: "Eso es. Ya puedes aplicar la regla a lo que comas hoy.",
  incorrect: "Mira los gramos de carbohidratos y divide por la regla de tu país.",
} as const;

export interface FirstRationOption {
  id: string;
  value: string;
  label: string;
}

export interface FirstRationSession {
  staples: EnrichedFoodItem[];
  estimate: EnrichedFoodItem;
  prompt: string;
  options: FirstRationOption[];
  correctAnswer: string;
  explanation: string;
}

function rationAnswerValue(rations: number): string {
  return String(Number(rations.toFixed(1)));
}

function rationOptionLabel(value: string): string {
  const amount = value.replace(".", ",");
  return Number(value) === 1 ? `${amount} ración` : `${amount} raciones`;
}

export function buildFirstRationOptions(correctRations: number): FirstRationOption[] {
  const correct = rationAnswerValue(correctRations);
  const candidates = [correct, "0.5", "1", "1.5", "2", "3"];
  const unique: string[] = [];
  for (const value of candidates) {
    if (!unique.includes(value)) unique.push(value);
  }
  return unique.slice(0, 4).map((value, index) => ({
    id: `opt-${index}`,
    value,
    label: rationOptionLabel(value),
  }));
}

export function gradeFirstRationAnswer(
  selected: string,
  correctAnswer: string,
): boolean {
  return selected === correctAnswer;
}

export function buildFirstRationSession(
  regionId: RegionId,
  foodsById: (id: string) => FoodItem | undefined,
): FirstRationSession | null {
  const region = getRegionById(regionId);
  const ids = FIRST_RATION_STAPLE_IDS[regionId];
  const staples: EnrichedFoodItem[] = [];

  for (const id of ids) {
    const food = foodsById(id);
    if (!food) return null;
    staples.push(enrichFoodItem(food, region.exchangeUnitG, regionId));
  }

  const estimate = staples[0];
  if (!estimate) return null;

  const correctRations = calculateRations(
    estimate.carbsG,
    region.exchangeUnitG,
  );
  const correctAnswer = rationAnswerValue(correctRations);
  const options = buildFirstRationOptions(correctRations);
  if (!options.some((option) => option.value === correctAnswer)) {
    options[0] = {
      id: "opt-correct",
      value: correctAnswer,
      label: rationOptionLabel(correctAnswer),
    };
  }

  return {
    staples,
    estimate,
    prompt: FIRST_RATION_COPY.questionLead,
    options,
    correctAnswer,
    explanation: `${formatExchangeRule(region)}. Esta porción tiene ${estimate.carbsG} g de carbohidratos: ${rationOptionLabel(correctAnswer)}.`,
  };
}
