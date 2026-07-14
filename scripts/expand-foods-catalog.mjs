import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const foodsPath = join(root, "src/lib/data/foods.json");

const expansion = [
  // España — additional staples
  ["es-chapata","España","Pan","Chapata","1 rebanada",35,15,"Baja","base"],
  ["es-molde-integral","España","Pan","Pan de molde integral","1 rebanada",25,10,"Baja","base"],
  ["es-croissant","España","Pan","Croissant","1 unidad",60,30,"Media","base"],
  ["es-avena-cocida","España","Cereales","Avena cocida","1/2 taza",120,15,"Baja","base"],
  ["es-muesli","España","Cereales","Muesli","1/2 taza",40,25,"Media","base"],
  ["es-quinoa","España","Cereales","Quinoa cocida","1/3 taza",50,15,"Media","base"],
  ["es-maiz-tortilla","España","Cereales","Tortilla de maíz","1 unidad",30,15,"Baja","base"],
  ["es-galleta-maria","España","Cereales","Galleta María","3 unidades",18,12,"Baja","base"],
  ["es-galleta-integral","España","Cereales","Galleta integral","2 unidades",20,12,"Baja","base"],
  ["es-pan-rallado","España","Cereales","Pan rallado","2 cucharadas",15,10,"Media","base"],
  ["es-pure-patata","España","Tubérculos","Puré de patata","1/2 taza",100,15,"Baja","base"],
  ["es-nachos","España","Tubérculos","Nachos / patatas fritas bolsa","1 ración",30,15,"Media","base"],
  ["es-judias-verdes","España","Legumbres","Judías verdes cocidas","1 taza",80,10,"Baja","base"],
  ["es-soja-cocida","España","Legumbres","Soja cocida","1/2 taza",90,10,"Media","base"],
  ["es-queso-fresco","España","Lácteos","Queso fresco","1 porción",60,3,"Baja","base"],
  ["es-leche-desnatada","España","Lácteos","Leche desnatada","1 taza",250,12,"Baja","base"],
  ["es-leche-avena","España","Lácteos","Bebida de avena","1 taza",200,16,"Media","base"],
  ["es-helado","España","Lácteos","Helado","1 bola",50,15,"Media","base"],
  ["es-mandarina","España","Fruta","Mandarina","1 unidad",100,12,"Baja","base"],
  ["es-kiwi","España","Fruta","Kiwi","1 unidad",75,10,"Baja","base"],
  ["es-pina","España","Fruta","Piña","1 taza",140,15,"Baja","base"],
  ["es-ciruela","España","Fruta","Ciruela","2 unidades",120,15,"Baja","base"],
  ["es-cerezas","España","Fruta","Cerezas","1 taza",120,15,"Media","base"],
  ["es-arandanos","España","Fruta","Arándanos","1 taza",140,15,"Media","base"],
  ["es-lechuga","España","Verdura","Lechuga","2 tazas",100,5,"Baja","base"],
  ["es-pepino","España","Verdura","Pepino","1 taza",120,5,"Baja","base"],
  ["es-pimiento","España","Verdura","Pimiento","1/2 taza",75,5,"Baja","base"],
  ["es-brocoli","España","Verdura","Brócoli cocido","1 taza",90,10,"Baja","base"],
  ["es-espinacas","España","Verdura","Espinacas cocidas","1/2 taza",90,5,"Baja","base"],
  ["es-champinones","España","Verdura","Champiñones","1 taza",70,5,"Baja","base"],
  ["es-atun","España","Proteína","Atún","1 lata pequeña",80,0,"Baja","modulator"],
  ["es-jamon","España","Proteína","Jamón serrano","2 lonchas",30,0,"Baja","modulator"],
  ["es-queso-curado","España","Proteína","Queso curado","1 porción",30,0,"Baja","modulator"],
  ["es-tortilla-francesa","España","Plato mixto","Tortilla francesa","1 porción",120,5,"Media","mixed"],
  ["es-ensalada-pasta","España","Plato mixto","Ensalada de pasta","1 plato",250,35,"Alta","mixed"],
  ["es-sandwich-mixto","España","Plato mixto","Sandwich mixto","1 unidad",150,30,"Alta","mixed"],
  ["es-crema-verduras","España","Plato mixto","Crema de verduras","1 bol",300,20,"Media","mixed"],
  ["es-lentejas-sopa","España","Plato mixto","Sopa de lentejas","1 bol",300,25,"Alta","mixed"],
  ["es-croqueta","España","Plato mixto","Croqueta","2 unidades",60,15,"Alta","mixed"],
  ["es-empanada","España","Plato mixto","Empanada","1 unidad",120,25,"Alta","mixed"],
  ["es-churro","España","Plato mixto","Churro","1 unidad",40,20,"Alta","mixed"],
  ["es-flan","España","Plato mixto","Flan","1 ración",120,30,"Media","mixed"],
  ["es-arroz-leche","España","Plato mixto","Arroz con leche","1 ración",200,35,"Alta","mixed"],

  // República Dominicana — additional staples
  ["do-pan-agua","República Dominicana","Pan","Pan de agua","1 unidad",50,30,"Baja","base"],
  ["do-hallulla","República Dominicana","Pan","Hallulla","1 unidad",60,35,"Baja","base"],
  ["do-arepa-maiz","República Dominicana","Pan","Arepa de maíz","1 unidad",80,30,"Media","base"],
  ["do-avena-do","República Dominicana","Cereales","Avena cocida","1/2 taza",120,15,"Baja","base"],
  ["do-harina-maiz","República Dominicana","Cereales","Harina de maíz","1/3 taza",40,25,"Media","base"],
  ["do-cereal-maiz","República Dominicana","Cereales","Cereal de maíz","1 taza",30,25,"Media","base"],
  ["do-galleta-soda","República Dominicana","Cereales","Galleta soda","4 unidades",24,16,"Baja","base"],
  ["do-pasta-do","República Dominicana","Cereales","Pasta cocida","1/3 taza",50,15,"Baja","base"],
  ["do-habichuelas-negras","República Dominicana","Legumbres","Habichuelas negras","1/2 taza",100,15,"Media","base"],
  ["do-habichuelas-blancas","República Dominicana","Legumbres","Habichuelas blancas","1/2 taza",100,15,"Media","base"],
  ["do-lentejas-do","República Dominicana","Legumbres","Lentejas cocidas","1/2 taza",100,15,"Media","base"],
  ["do-yuca","República Dominicana","Tubérculos","Yuca cocida","1/2 taza",80,15,"Baja","base"],
  ["do-name","República Dominicana","Tubérculos","Ñame cocido","1/2 taza",80,15,"Media","base"],
  ["do-aoi","República Dominicana","Tubérculos","Auyama","1/2 taza",100,10,"Baja","base"],
  ["do-papas-do","República Dominicana","Tubérculos","Papa cocida","1/2 taza",75,15,"Baja","base"],
  ["do-chicharron-platano","República Dominicana","Tubérculos","Chicharrón de plátano","3 piezas",50,15,"Media","base"],
  ["do-yaniqueque","República Dominicana","Tubérculos","Yaniqueque","1 unidad",60,20,"Media","base"],
  ["do-leche-condensada","República Dominicana","Lácteos","Leche condensada","2 cucharadas",40,20,"Media","base"],
  ["do-yogur-do","República Dominicana","Lácteos","Yogur natural","1 unidad",125,8,"Baja","base"],
  ["do-queso-frito","República Dominicana","Lácteos","Queso frito","1 porción",50,2,"Baja","base"],
  ["do-guayaba","República Dominicana","Fruta","Guayaba","1 unidad",90,12,"Baja","base"],
  ["do-papaya","República Dominicana","Fruta","Papaya","1 taza",140,15,"Baja","base"],
  ["do-banana","República Dominicana","Fruta","Banana","1 unidad",90,15,"Baja","base"],
  ["do-toronja","República Dominicana","Fruta","Toronja","1/2 unidad",120,12,"Baja","base"],
  ["do-zapote","República Dominicana","Fruta","Zapote","1/2 taza",100,15,"Media","base"],
  ["do-lechosa","República Dominicana","Fruta","Lechosa","1 taza",140,15,"Baja","base"],
  ["do-coco-agua","República Dominicana","Fruta","Agua de coco","1 vaso",240,10,"Baja","base"],
  ["do-aguacate","República Dominicana","Verdura","Aguacate","1/2 unidad",80,4,"Baja","base"],
  ["do-berenjena","República Dominicana","Verdura","Berenjena guisada","1/2 taza",90,8,"Media","base"],
  ["do-ayote","República Dominicana","Verdura","Ayote","1/2 taza",100,8,"Baja","base"],
  ["do-repollo","República Dominicana","Verdura","Repollo","1 taza",90,5,"Baja","base"],
  ["do-carne-res","República Dominicana","Proteína","Carne de res","1 porción",100,0,"Baja","modulator"],
  ["do-pescado-frito","República Dominicana","Proteína","Pescado frito","1 porción",120,5,"Media","modulator"],
  ["do-huevo-do","República Dominicana","Proteína","Huevo","1 unidad",60,0,"Baja","modulator"],
  ["do-salami","República Dominicana","Proteína","Salami","2 lonchas",40,1,"Baja","modulator"],
  ["do-chicharron","República Dominicana","Proteína","Chicharrón","1 porción",50,0,"Baja","modulator"],
  ["do-sancocho","República Dominicana","Plato mixto","Sancocho","1 plato",350,30,"Alta","mixed"],
  ["do-pastelon","República Dominicana","Plato mixto","Pastelón","1 porción",200,25,"Alta","mixed"],
  ["do-chimi","República Dominicana","Plato mixto","Chimichurri","1 unidad",250,35,"Alta","mixed"],
  ["do-yaroa","República Dominicana","Plato mixto","Yaroa","1 porción",250,40,"Alta","mixed"],
  ["do-empanada-do","República Dominicana","Plato mixto","Empanada","1 unidad",120,25,"Alta","mixed"],
  ["do-pastelito","República Dominicana","Plato mixto","Pastelito","1 unidad",80,20,"Alta","mixed"],
  ["do-arroz-con-leche-do","República Dominicana","Plato mixto","Arroz con leche","1 ración",200,35,"Alta","mixed"],
  ["do-habichuelas-con-dulce","República Dominicana","Plato mixto","Habichuelas con dulce","1 ración",180,40,"Alta","mixed"],
  ["do-yaniqueques-huevos","República Dominicana","Plato mixto","Yaniqueques con huevos","1 plato",220,25,"Alta","mixed"],
  ["do-moro-guandules","República Dominicana","Plato mixto","Moro de guandules","1 plato",250,45,"Alta","mixed"],
  ["do-pescado-escabeche","República Dominicana","Plato mixto","Pescado en escabeche","1 plato",250,10,"Media","mixed"],
  ["do-pollo-guisado","República Dominicana","Plato mixto","Pollo guisado con viandas","1 plato",300,25,"Alta","mixed"],
  ["do-locrio-pollo","República Dominicana","Plato mixto","Locrio de pollo","1 plato",300,45,"Alta","mixed"],
  ["do-spaghetti-do","República Dominicana","Plato mixto","Espagueti con salsa","1 plato",280,40,"Alta","mixed"],
  ["do-pizza-do","República Dominicana","Plato mixto","Pizza","1 porción",150,25,"Alta","mixed"],
  ["do-hamburguesa-do","República Dominicana","Plato mixto","Hamburguesa","1 unidad",200,35,"Alta","mixed"],
  ["do-dulce-leche","República Dominicana","Plato mixto","Dulce de leche","2 cucharadas",40,20,"Media","mixed"],
  ["do-maiz-cocido","República Dominicana","Cereales","Maíz cocido","1/2 taza",80,15,"Baja","base"],
  ["do-cafe-con-leche","República Dominicana","Lácteos","Café con leche","1 taza",200,10,"Baja","base"],
  ["do-jugo-naranja","República Dominicana","Fruta","Jugo de naranja natural","1 vaso",200,20,"Baja","base"],
  ["do-coco-rallado","República Dominicana","Fruta","Coco rallado","2 cucharadas",15,3,"Baja","base"],
  ["do-tostada-casabe","República Dominicana","Pan","Tostada de casabe","1 unidad",25,12,"Baja","base"],
  ["do-arepita-maiz","República Dominicana","Pan","Arepita de maíz","1 unidad",50,20,"Baja","base"],
  ["do-arroz-integral-do","República Dominicana","Cereales","Arroz integral","1/3 taza",50,15,"Media","base"],
  ["do-frijoles-pintos","República Dominicana","Legumbres","Frijoles pintos","1/2 taza",100,15,"Media","base"],
  ["do-platano-horneado","República Dominicana","Tubérculos","Plátano horneado","1/2 unidad",80,18,"Baja","base"],
  ["do-calamondin","República Dominicana","Fruta","Limoncillo","2 unidades",60,8,"Baja","base"],
  ["do-tamarindo","República Dominicana","Fruta","Tamarindo","1/4 taza",60,15,"Media","base"],
];

const existing = JSON.parse(readFileSync(foodsPath, "utf8"));
const existingIds = new Set(existing.map((food) => food.id));

const newFoods = expansion
  .filter(([id]) => !existingIds.has(id))
  .map(([id, country, category, name, portionText, grams, carbsG, difficulty, itemType]) => ({
    id,
    country,
    category,
    name,
    portionText,
    grams,
    carbsG,
    difficulty,
    itemType,
    notes: itemType === "modulator" ? "Modulador" : itemType === "mixed" ? "Mixto" : "Base",
  }));

const merged = [...existing, ...newFoods];
writeFileSync(foodsPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

const countByCountry = merged.reduce((acc, food) => {
  acc[food.country] = (acc[food.country] ?? 0) + 1;
  return acc;
}, {});

console.log(`Added ${newFoods.length} foods. Totals:`, countByCountry);
