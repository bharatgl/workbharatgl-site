// Single-stroke "pen" font (EMS Felix, SIL Open Font License) laid out as SVG paths,
// so text can be drawn stroke-by-stroke like real handwriting.
import fontSrc from '../assets/hand-font.svg?raw'

const UNITS = 1000
let glyphs = null
let fallbackAdvance = 378

function load() {
  if (glyphs) return glyphs
  const doc = new DOMParser().parseFromString(fontSrc, 'image/svg+xml')
  fallbackAdvance = Number(doc.querySelector('font').getAttribute('horiz-adv-x')) || fallbackAdvance
  glyphs = {}
  doc.querySelectorAll('glyph').forEach((g) => {
    glyphs[g.getAttribute('unicode')] = {
      d: g.getAttribute('d') || '',
      w: Number(g.getAttribute('horiz-adv-x') || fallbackAdvance),
    }
  })
  return glyphs
}

const NORMALISE = { '’': "'", '‘': "'", '…': '...', '→': '-', '×': 'x' }

// Tiny deterministic PRNG so the "wobble" is the same on every render.
function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function wordWidth(word, tracking) {
  const g = load()
  let w = 0
  for (const ch of word) w += (g[ch]?.w ?? fallbackAdvance) + tracking
  return w
}

/**
 * Lay text out into lines of words.
 * Returns { width, height, lines: [{ words: [{ x, y, rotate, glyphs: [{ x, d }] }] }] } in font units.
 * `maxWidth` is in font units (1000 = 1em). `align` is 'left' | 'center'.
 */
export function layoutHand(text, { maxWidth = 14000, lineHeight = 1.25, tracking = 20, wobble = 1, align = 'center', seed = 7 } = {}) {
  const g = load()
  const rand = rng(seed)
  const space = (g[' ']?.w ?? 300) + tracking * 2
  const paragraphs = Array.from(text, (c) => NORMALISE[c] ?? c).join('').split('\n')
  const rows = []
  for (const para of paragraphs) {
    let row = []
    let rowW = 0
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const w = wordWidth(word, tracking)
      if (row.length && rowW + space + w > maxWidth) {
        rows.push({ row, rowW })
        row = []
        rowW = 0
      }
      rowW += (row.length ? space : 0) + w
      row.push({ word, w })
    }
    rows.push({ row, rowW })
  }

  const lh = UNITS * lineHeight
  let width = 0
  const lines = rows.map(({ row, rowW }, li) => {
    width = Math.max(width, rowW)
    let x = align === 'center' ? (maxWidth - rowW) / 2 : 0
    const words = row.map(({ word, w }) => {
      const out = {
        x,
        y: li * lh + (rand() - 0.5) * 60 * wobble,
        rotate: (rand() - 0.5) * 3.2 * wobble,
        w,
        glyphs: [],
      }
      let gx = 0
      for (const ch of word) {
        const gl = g[ch] ?? { d: '', w: fallbackAdvance }
        if (gl.d) out.glyphs.push({ x: gx, d: gl.d })
        gx += gl.w + tracking
      }
      x += w + space
      return out
    })
    return { words }
  })
  return { width: align === 'center' ? maxWidth : width, height: rows.length * lh, lines, ascent: 800, descent: 200 }
}
