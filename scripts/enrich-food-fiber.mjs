#!/usr/bin/env node
/**
 * Enrich Spain catalog foods with BEDCA-oriented fiber per 100 g in notes + fiberG.
 * Usage: node scripts/enrich-food-fiber.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const foodsPath = join(root, "src/lib/data/foods.json");

/** Fiber (g) per 100 g food — BEDCA-oriented rounded values for ES staples. */
const FIBER_PER_100G = {
  "pan-blanco": 3.5,
  "pan-integral": 7,
  "pan-integral-100g": 8,
  "pan-molde": 2,
  "pan-sobao": 2.5,
  "tostadas-pan": 3.5,
  "es-chapata": 3,
  "es-molde-integral": 5,
  "es-galleta-integral": 4,
  "es-pan-integral": 7,
  "es-pan-tostado": 3.5,
  "es-pan-pita": 3,
  "arroz-cocido": 0.4,
  "arroz-integral-cocido-150g": 1.8,
  "pasta-cocida": 1.8,
  "pasta-cocida-140g": 1.8,
  "es-avena-cocida": 1.5,
  "es-muesli": 6,
  "es-quinoa": 2.5,
  "patata-cocida-150g": 1.8,
  "boniato-asado-130g": 2.5,
  "es-pure-patata": 1.5,
  "lentejas-cocidas": 5,
  "lentejas-cocidas-200g": 5,
  "lentejas-estofadas": 5,
  "es-lentejas-sopa": 4,
  "es-lentejas-estofado": 5,
  "garbanzos-cocidos": 4,
  "es-garbanzos-cocidos": 4,
  "alubias-cocidas": 3.5,
  "es-alubias": 3.5,
  "es-judias-verdes": 2.5,
  "es-soja-cocida": 3,
  "guisantes-cocidos": 5,
  "maiz-grano": 2,
  "manzana": 2,
  "platano": 1.5,
  "fresas": 2,
  "uvas": 1,
  "es-mandarina": 2,
  "es-kiwi": 2.5,
  "es-pina": 1.5,
  "es-arandanos": 2.5,
  "es-brocoli": 2.5,
  "es-espinacas": 2,
  "es-lechuga": 1,
  "ensalada-mixta": 1.5,
  "nueces": 7,
  "es-gazpacho": 1,
  "es-fabada": 4,
  "paella": 1,
};

function fiberNote(per100g) {
  return `${per100g} g fibra/100 g (BEDCA)`;
}

function stripOldFiberNote(notes) {
  return notes
    .replace(/\s*·?\s*\d+(?:[.,]\d+)?\s*g\s*fibra\/100\s*g\s*\(BEDCA\)/gi, "")
    .replace(/\d+(?:[.,]\d+)?\s*g\s*fibra\/100\s*g(?:\s*\(BEDCA\))?/gi, "")
    .replace(/,\s*5\s*g\s*fibra\/100\s*g/gi, "")
    .trim();
}

function enrichFood(food) {
  const per100 = FIBER_PER_100G[food.id];
  if (per100 == null || food.grams <= 0) return food;

  const fiberG = Math.round(((per100 * food.grams) / 100) * 10) / 10;
  if (fiberG <= 0) return food;

  const baseNotes = stripOldFiberNote(food.notes);
  const fiberSuffix = fiberNote(per100);
  const notes = baseNotes
    ? baseNotes.includes("BEDCA") && baseNotes.includes("fibra")
      ? baseNotes
      : `${baseNotes} · ${fiberSuffix}`
    : fiberSuffix;

  return { ...food, fiberG, notes };
}

const foods = JSON.parse(readFileSync(foodsPath, "utf8"));
let enriched = 0;

const updated = foods.map((food) => {
  const next = enrichFood(food);
  if (next.fiberG !== food.fiberG || next.notes !== food.notes) enriched += 1;
  return next;
});

writeFileSync(foodsPath, `${JSON.stringify(updated, null, 2)}\n`);
console.log(`Enriched fiber on ${enriched} foods (${Object.keys(FIBER_PER_100G).length} mapped ids).`);
