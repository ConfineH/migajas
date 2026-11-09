import { PHOTOS } from './photos.mjs'

/**
 * Batch 01 — Posts P03–P09 (P01 y P02 ya producidos fuera del export).
 * @typedef {{ post: string, filename: string, label: string, type: string, badge?: 'es' | 'do' | null }} SlideBase
 */

/** @type {SlideBase[]} */
export const SLIDES = [
  // Post 03 — Migajas de confianza
  {
    post: '03',
    filename: '03-confidence.png',
    label: 'Confianza — memorizar',
    type: 'confidence',
    lines: ['No hace falta memorizar todo.', '', 'Hace falta empezar a mirar distinto.'],
    accent: 'mirar distinto',
    showWordmark: true,
    badge: null,
  },

  // Post 04 — La Porción · Arroz
  {
    post: '04',
    filename: '04-slide-01-cover.png',
    label: 'Porción arroz — cover',
    type: 'portion-cover',
    title: 'Un plato de arroz.',
    subtitle: '¿Cuentas el plato o el cereal?',
    photo: PHOTOS.arroz,
    badge: 'es',
  },
  {
    post: '04',
    filename: '04-slide-02-list.png',
    label: 'Porción arroz — lista',
    type: 'portion-list',
    items: ['Arroz cocido', 'Guarnición'],
    badge: 'es',
  },
  {
    post: '04',
    filename: '04-slide-03-reveal.png',
    label: 'Porción arroz — revelación',
    type: 'portion-reveal',
    lines: ['El arroz aporta', 'la mayor parte de', 'los carbohidratos.'],
    accent: 'arroz',
    badge: 'es',
  },
  {
    post: '04',
    filename: '04-slide-04-close.png',
    label: 'Porción arroz — cierre',
    type: 'portion-close',
    lines: ['Separar componentes', '= ver más claro.'],
    accent: 'claro',
    badge: 'es',
  },

  // Post 05 — ¿Tú qué harías?
  {
    post: '05',
    filename: '05-question.png',
    label: 'Pregunta — calcular',
    type: 'question',
    lines: ['¿Qué alimento', 'te cuesta más', 'calcular?'],
    accent: 'calcular?',
    showWordmark: true,
    badge: null,
  },

  // Post 06 — Dentro de Migajas
  {
    post: '06',
    filename: '06-product.png',
    label: 'Producto — práctica',
    type: 'product',
    lines: ['Así practicamos', 'antes de pasar', 'al siguiente nivel.'],
    screenshot: 'practice',
    badge: null,
  },

  // Post 07 — La Porción · Mangú 🇩🇴
  {
    post: '07',
    filename: '07-slide-01-cover.png',
    label: 'Porción mangú — cover',
    type: 'portion-cover',
    title: 'Un mangú.',
    subtitle: '¿Qué aporta los carbohidratos?',
    photo: PHOTOS.mangu,
    badge: 'do',
  },
  {
    post: '07',
    filename: '07-slide-02-list.png',
    label: 'Porción mangú — lista',
    type: 'portion-list',
    items: ['Plátano', 'Aceite', 'Huevo'],
    badge: 'do',
  },
  {
    post: '07',
    filename: '07-slide-03-reveal.png',
    label: 'Porción mangú — revelación',
    type: 'portion-reveal',
    lines: ['El plátano verde', 'aporta la mayor parte.'],
    accent: 'plátano verde',
    badge: 'do',
  },
  {
    post: '07',
    filename: '07-slide-04-close.png',
    label: 'Porción mangú — cierre',
    type: 'portion-close',
    lines: ['Observar el', 'ingrediente base.'],
    accent: 'base',
    badge: 'do',
  },

  // Post 08 — Lo que solemos pensar
  {
    post: '08',
    filename: '08-slide-01-question.png',
    label: 'Mito — pregunta',
    type: 'myth-question',
    lines: ['¿Si algo es integral,', 'tiene menos', 'carbohidratos?'],
    badge: 'es',
  },
  {
    post: '08',
    filename: '08-slide-02-clarify.png',
    label: 'Mito — aclaración',
    type: 'myth-clarify',
    lines: ['Integral no siempre', 'significa menos', 'carbohidratos.'],
    accent: 'no siempre',
    badge: 'es',
  },
  {
    post: '08',
    filename: '08-slide-03-close.png',
    label: 'Mito — cierre',
    type: 'myth-close',
    lines: ['Significa otro', 'tipo de harina.'],
    accent: 'harina',
    badge: 'es',
  },

  // Post 09 — Migajas de confianza
  {
    post: '09',
    filename: '09-confidence.png',
    label: 'Confianza — tranquilidad',
    type: 'confidence',
    lines: ['Entender', 'da tranquilidad.'],
    accent: 'tranquilidad',
    showWordmark: true,
    badge: null,
  },
]
