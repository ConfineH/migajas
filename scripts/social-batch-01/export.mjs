import { chromium } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const OUT_DIR = path.join(ROOT, 'public', 'social', 'batch-01')

const BRAND = {
  cream: '#F9F7F1',
  sage: '#6B7F62',
  sageLight: '#B8C9AF',
  terracotta: '#D98A6D',
  text: '#3D3429',
  muted: '#6B635A',
  white: '#ffffff',
}

const { SLIDES } = await import('./slides.mjs')

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function lineWithAccent(line, accent, accentClass = 'accent-sage') {
  if (!line || !accent || !line.includes(accent)) {
    return `<div class="line">${escapeHtml(line)}</div>`
  }
  const [before, after] = line.split(accent)
  return `<div class="line">${escapeHtml(before)}<span class="${accentClass}">${escapeHtml(accent)}</span>${escapeHtml(after)}</div>`
}

function renderLines(lines, accent, accentClass = 'accent-sage') {
  return lines
    .map((line) => {
      if (line === '') return '<div class="line gap"></div>'
      return lineWithAccent(line, accent, accentClass)
    })
    .join('')
}

function badgeHtml(badge) {
  if (!badge) return ''
  const flag = badge === 'es' ? '🇪🇸' : '🇩🇴'
  return `<div class="badge">${flag}</div>`
}

function wordmarkHtml() {
  return `<div class="wordmark">migajas</div>`
}

function baseHtml(body) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1080px;
      overflow: hidden;
      font-family: 'DM Sans', system-ui, sans-serif;
      color: ${BRAND.text};
      background: ${BRAND.cream};
    }
    .frame {
      width: 1080px;
      height: 1080px;
      padding: 96px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 4px;
    }
    .playfair {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 500;
      font-size: 56px;
      line-height: 1.35;
      letter-spacing: -0.02em;
      color: ${BRAND.text};
    }
    .playfair-sm {
      font-size: 48px;
      line-height: 1.4;
    }
    .playfair-lg {
      font-size: 64px;
      line-height: 1.2;
    }
    .sans {
      font-family: 'DM Sans', sans-serif;
      font-size: 34px;
      line-height: 1.45;
      color: ${BRAND.text};
    }
    .sans-sm {
      font-size: 28px;
    }
    .line.gap { height: 20px; }
    .accent-sage { color: ${BRAND.sage}; }
    .accent-terra { color: ${BRAND.terracotta}; }
    .subtitle { color: ${BRAND.sage}; font-size: 40px; margin-top: 12px; }
    .badge {
      position: absolute;
      top: 40px;
      right: 40px;
      font-size: 28px;
      line-height: 1;
    }
    .wordmark {
      position: absolute;
      bottom: 48px;
      right: 96px;
      font-family: 'DM Sans', sans-serif;
      font-size: 20px;
      font-weight: 500;
      color: ${BRAND.sage};
      letter-spacing: 0.02em;
    }
    .micro {
      font-size: 24px;
      color: ${BRAND.muted};
      margin-top: 32px;
    }
    .list-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding-left: 8px;
      gap: 28px;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 34px;
    }
    .bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${BRAND.terracotta};
      flex-shrink: 0;
    }
    .sage-bg { background: ${BRAND.sageLight}; }
    .error-box {
      border: 2px solid ${BRAND.sage};
      padding: 48px 56px;
      max-width: 720px;
    }
    .cover {
      width: 1080px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      position: relative;
      background: ${BRAND.cream};
    }
    .cover-photo {
      height: 65%;
      overflow: hidden;
    }
    .cover-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cover-text {
      height: 35%;
      padding: 40px 96px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: ${BRAND.cream};
    }
    .cover-title {
      font-family: 'Playfair Display', serif;
      font-size: 56px;
      color: ${BRAND.text};
      margin-bottom: 8px;
    }
    .product-frame {
      justify-content: flex-start;
      gap: 40px;
    }
    .product-shot {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-height: 640px;
    }
    .product-shot img {
      max-width: 72%;
      max-height: 100%;
      border-radius: 24px;
      box-shadow: 0 24px 60px -24px rgba(61, 52, 41, 0.25);
    }
    .placeholder {
      width: 72%;
      height: 480px;
      border-radius: 24px;
      background: #e8e4dc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${BRAND.muted};
      font-size: 22px;
      padding: 24px;
      text-align: center;
    }
  </style>
</head>
<body>${body}</body>
</html>`
}

function renderSlide(slide, screenshotDataUris) {
  switch (slide.type) {
    case 'confidence':
      return baseHtml(
        `<div class="frame">
          ${badgeHtml(slide.badge)}
          <div class="center playfair playfair-sm">${renderLines(slide.lines, slide.accent)}</div>
          ${slide.showWordmark ? wordmarkHtml() : ''}
        </div>`
      )

    case 'question':
      return baseHtml(
        `<div class="frame">
          <div class="center playfair playfair-lg">${renderLines(slide.lines, slide.accent, 'accent-terra')}</div>
          <div class="center micro">Te leemos en comentarios.</div>
          ${slide.showWordmark ? wordmarkHtml() : ''}
        </div>`
      )

    case 'portion-cover':
      return baseHtml(
        `<div class="cover">
          ${badgeHtml(slide.badge)}
          <div class="cover-photo"><img src="${slide.photo}" alt="" /></div>
          <div class="cover-text">
            <div class="cover-title">${escapeHtml(slide.title)}</div>
            <div class="cover-title subtitle">${escapeHtml(slide.subtitle)}</div>
          </div>
        </div>`
      )

    case 'portion-list':
      return baseHtml(
        `<div class="frame">
          ${badgeHtml(slide.badge)}
          <div class="list-wrap">
            ${slide.items
              .map(
                (item) =>
                  `<div class="list-item"><span class="bullet"></span><span>${escapeHtml(item)}</span></div>`
              )
              .join('')}
          </div>
        </div>`
      )

    case 'portion-reveal':
      return baseHtml(
        `<div class="frame sage-bg">
          ${badgeHtml(slide.badge)}
          <div class="center playfair playfair-sm">${renderLines(slide.lines, slide.accent)}</div>
        </div>`
      )

    case 'portion-close':
      return baseHtml(
        `<div class="frame">
          ${badgeHtml(slide.badge)}
          <div class="center playfair playfair-sm">${renderLines(slide.lines, slide.accent, 'accent-terra')}</div>
          ${wordmarkHtml()}
        </div>`
      )

    case 'myth-question':
      return baseHtml(
        `<div class="frame">
          ${badgeHtml(slide.badge)}
          <div class="center playfair playfair-sm">${renderLines(slide.lines)}</div>
        </div>`
      )

    case 'myth-clarify':
      return baseHtml(
        `<div class="frame sage-bg">
          ${badgeHtml(slide.badge)}
          <div class="center sans">${renderLines(slide.lines, slide.accent, 'accent-terra')}</div>
        </div>`
      )

    case 'myth-close':
      return baseHtml(
        `<div class="frame">
          ${badgeHtml(slide.badge)}
          <div class="center playfair playfair-sm">${renderLines(slide.lines, slide.accent)}</div>
          ${wordmarkHtml()}
        </div>`
      )

    case 'product': {
      const shot = screenshotDataUris[slide.screenshot]
      const img = shot
        ? `<img src="${shot}" alt="" />`
        : `<div class="placeholder">Añade public/screenshots/practice-exercise.png y vuelve a exportar</div>`
      return baseHtml(
        `<div class="frame product-frame">
          <div class="center playfair playfair-sm" style="margin-top:8px">${renderLines(slide.lines)}</div>
          <div class="product-shot">${img}</div>
          ${wordmarkHtml()}
        </div>`
      )
    }

    default:
      throw new Error(`Unknown slide type: ${slide.type}`)
  }
}

async function toDataUri(filePath) {
  try {
    const buffer = await readFile(filePath)
    const ext = path.extname(filePath).slice(1)
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const screenshotDataUris = {
    practice: await toDataUri(path.join(ROOT, 'public', 'screenshots', 'practice-exercise.png')),
  }

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } })

  for (const slide of SLIDES) {
    const html = renderSlide(slide, screenshotDataUris)
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    const outPath = path.join(OUT_DIR, slide.filename)
    await page.screenshot({ path: outPath, type: 'png' })
    console.log(`✓ ${slide.filename}`)
  }

  await browser.close()

  const posts = [...new Set(SLIDES.map((s) => s.post))]
  const indexHtml = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Migajas Batch 01 — P03–P09</title>
<style>
  body { font-family: system-ui, sans-serif; background:#f0ebe3; padding:24px; color:#3d3429; }
  h1 { font-weight:500; }
  section { margin-bottom:40px; }
  h2 { font-size:18px; margin-bottom:12px; }
  .grid { display:flex; flex-wrap:wrap; gap:12px; }
  img { width:240px; height:240px; object-fit:cover; border-radius:8px; background:#fff; }
  figcaption { font-size:12px; color:#6b635a; margin-top:4px; max-width:240px; }
</style></head><body>
  <h1>Migajas — Batch 01 (P03–P09)</h1>
  <p>Export automático. P01 y P02 se gestionan aparte (ya producidos).</p>
  ${posts
    .map((postId) => {
      const items = SLIDES.filter((s) => s.post === postId)
      return `<section><h2>Post ${postId}</h2><div class="grid">${items
        .map(
          (s) =>
            `<figure><img src="./${s.filename}" alt=""/><figcaption>${s.filename}</figcaption></figure>`
        )
        .join('')}</div></section>`
    })
    .join('')}
</body></html>`

  await writeFile(path.join(OUT_DIR, 'index-p03-p09.html'), indexHtml)

  const captions = `# Captions — Batch 01 P03–P09

## P03
Aprender no es acumular datos. Es ganar claridad, poco a poco.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P04
Un plato mixto se entiende mejor por partes. Hoy: arroz y lo que lo acompaña.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P05
No hay respuesta incorrecta. Nos ayuda a saber qué explicar después.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P06
El curso avanza cuando practicas. Sin prisa, con claridad.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P07
En República Dominicana, 15 g de carbohidratos = 1 ración. Hoy miramos un plato cotidiano.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P08
Integral describe la harina, no siempre la cantidad de carbohidratos. Vale la pena mirar la etiqueta.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.

## P09
Ese es el objetivo. No la perfección.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.
`

  await writeFile(path.join(OUT_DIR, 'captions-p03-p09.md'), captions)

  console.log(`\nDone. ${SLIDES.length} PNGs → public/social/batch-01/`)
  console.log('Preview: public/social/batch-01/index-p03-p09.html')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
