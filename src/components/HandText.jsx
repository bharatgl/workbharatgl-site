import { useMemo, forwardRef } from 'react'
import { layoutHand } from '../lib/handfont.js'

/**
 * Renders text with the pen font as stroked SVG paths. Every glyph path gets
 * class "hand-stroke" so callers can animate stroke-dashoffset to "write" it.
 * `weight` is the pen thickness in font units (~40 thin, ~90 marker).
 */
const HandText = forwardRef(function HandText(
  { text, maxWidth, align = 'center', weight = 60, lineHeight = 1.25, wobble = 1, seed, className = '', label, style },
  ref
) {
  const layout = useMemo(
    () => layoutHand(text, { maxWidth, align, lineHeight, wobble, seed }),
    [text, maxWidth, align, lineHeight, wobble, seed]
  )
  const pad = weight + 40
  const top = layout.ascent + pad
  const vbW = layout.width + pad * 2
  const vbH = layout.height - 1000 * lineHeight + layout.ascent + layout.descent + pad * 2 + 120
  return (
    <svg
      ref={ref}
      className={`hand ${className}`}
      viewBox={`${-pad} ${-top} ${vbW} ${vbH}`}
      role="img"
      aria-label={label ?? text}
      style={style}
    >
      <g fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
        {layout.lines.map((line, li) =>
          line.words.map((w, wi) => (
            <g
              key={`${li}-${wi}`}
              className="hand-word"
              transform={`translate(${w.x} ${w.y}) rotate(${w.rotate} ${w.w / 2} -250) scale(1 -1)`}
            >
              {w.glyphs.map((gl, gi) => (
                <path key={gi} className="hand-stroke" transform={`translate(${gl.x} 0)`} d={gl.d} />
              ))}
            </g>
          ))
        )}
      </g>
    </svg>
  )
})

export default HandText

/** Prepares every .hand-stroke inside `root` for drawing; returns the paths in order. */
export function primeStrokes(root) {
  const paths = Array.from(root.querySelectorAll('.hand-stroke'))
  paths.forEach((p) => {
    const len = p.getTotalLength() + 1
    p.style.strokeDasharray = `${len} ${len}`
    p.style.strokeDashoffset = `${len}`
    p.dataset.len = len
  })
  return paths
}
