/**
 * Plain-language copy for República Dominicana.
 * Avoids nutrition jargon (HC, moduladores, viandas, legumbres…) for users
 * without clinical background.
 */
export function formatCarbsDo(carbsG: number): string {
  return `${carbsG} g de carbohidratos`;
}

export function applyPlainLanguageDo(text: string): string {
  let plain = text
    .replaceAll(" g de HC", " g de carbohidratos")
    .replaceAll("gramos de HC", "gramos de carbohidratos")
    .replaceAll("(HC)", "(carbohidratos)")
    .replaceAll(" los HC ", " los carbohidratos ")
    .replaceAll(" los HC.", " los carbohidratos.")
    .replaceAll(" de HC ", " de carbohidratos ")
    .replaceAll(" con HC", " con carbohidratos")
    .replaceAll(" aportan HC", " tienen carbohidratos")
    .replaceAll("concentran HC", "tienen carbohidratos")
    .replaceAll("contenido de HC", "carbohidratos")
    .replaceAll("viandas", "yuca, plátano y batata")
    .replaceAll("vianda", "yuca o plátano")
    .replaceAll("moduladores", "pollo, huevo y carne (no suman raciones)")
    .replaceAll("modulador", "alimento que no suma raciones")
    .replaceAll("platos mixtos", "platos con varias cosas")
    .replaceAll("plato mixto", "plato con varias cosas")
    .replaceAll("Plato mixto", "Plato con varias cosas")
    .replaceAll("legumbres", "habichuelas")
    .replaceAll("Legumbres", "Habichuelas")
    .replaceAll("frutas tropicales", "frutas como mango, chinola y plátano")
    .replaceAll("fruta tropical", "fruta como mango o plátano")
    .replaceAll("lácteos", "leche y queso")
    .replaceAll("Lácteos", "Leche y queso")
    .replaceAll("tubérculos", "yuca, batata y plátano")
    .replaceAll("tubérculo", "yuca o batata")
    .replaceAll("porción estándar", "cantidad que comes de costumbre")
    .replaceAll("porción típica", "cantidad normal")
    .replaceAll("porciones habituales", "cantidades normales")
    .replaceAll("vegetales", "verduras")
    .replaceAll("moro de habichuelas", "arroz con habichuelas")
    .replaceAll("Moro de habichuelas", "Arroz con habichuelas");

  if (/\bHC\b/.test(plain)) {
    plain = plain.replaceAll(/\bHC\b/g, "carbohidratos");
  }

  return plain;
}

export function buildPlainReferenceTipsDo(exchangeUnitG: number): string[] {
  const half = exchangeUnitG / 2;
  const oneAndHalf = exchangeUnitG * 1.5;
  return [
    "Cuenta solo los carbohidratos del alimento, no todo el peso del plato.",
    `En República Dominicana: ${exchangeUnitG} gramos de carbohidratos = 1 ración.`,
    `Puedes contar medias raciones: ${half} g = media ración, ${oneAndHalf} g = 1 ración y media.`,
    "El pollo, el huevo y la carne no suman raciones porque casi no tienen carbohidratos.",
  ];
}
