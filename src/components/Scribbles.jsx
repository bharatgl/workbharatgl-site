import { useEffect, useMemo, useRef } from 'react'

// Procedural marker doodles (zigzags, coils, stars, arrows, question marks) that scratch themselves in.
function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function shape(kind, r) {
  const j = (n) => (r() - 0.5) * n
  switch (kind) {
    case 'zig': {
      let d = 'M4 30'
      for (let i = 1; i <= 6; i++) d += ` L${4 + i * 9 + j(3)} ${i % 2 ? 8 + j(4) : 30 + j(4)}`
      return d
    }
    case 'coil': {
      let d = 'M4 26'
      for (let i = 0; i < 4; i++) d += ` c 6 -${18 + j(4)}, 14 -${14 + j(4)}, 8 0 s -2 ${12 + j(4)}, 8 4`
      return d
    }
    case 'star':
      return 'M30 4 L35 22 L54 24 L39 35 L44 54 L30 43 L16 54 L21 35 L6 24 L25 22 Z'
    case 'sparkle':
      return 'M30 4 C31 22 38 29 56 30 C38 31 31 38 30 56 C29 38 22 31 4 30 C22 29 29 22 30 4 Z'
    case 'arrow':
      return `M6 ${46 + j(4)} C 20 ${20 + j(6)}, 36 ${16 + j(6)}, 52 ${12 + j(4)} M40 6 L53 12 L44 24`
    case 'q':
      return 'M18 18 C18 6 42 6 42 20 C42 30 30 30 30 40 M30 52 L30 53'
    default:
      return 'M30 30 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0'
  }
}

const KINDS = ['sparkle', 'zig', 'q', 'arrow', 'coil', 'star', 'sparkle', 'zig', 'dot', 'q']

/** A scatter of doodles at the given spots ([x, y] in 0..1). They scratch in when the area scrolls into view. */
export default function Scribbles({ spots, seed = 11, color = 'var(--cf-yellow)', className = '' }) {
  const ref = useRef(null)
  const items = useMemo(() => {
    const r = rng(seed)
    return spots.map(([x, y], i) => ({
      x,
      y,
      d: shape(KINDS[(i + seed) % KINDS.length], r),
      rot: (r() - 0.5) * 50,
      size: 34 + r() * 30,
      beat: (r() * 0.8).toFixed(2),
      wide: i >= 4,
    }))
  }, [spots, seed])

  useEffect(() => {
    const el = ref.current
    el.querySelectorAll('path').forEach((p) => p.style.setProperty('--len', p.getTotalLength() + 1))
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (el.classList.add('in'), io.disconnect()), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={`scribbles ${className}`} ref={ref} aria-hidden="true" style={{ '--sc': color }}>
      {items.map((s, i) => (
        <svg key={i} className={`scribble ${s.wide ? 'scribble--wide' : ''}`} viewBox="0 0 60 60" style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: s.size, '--rot': `${s.rot}deg`, '--beat': `${s.beat}s` }}>
          <path d={s.d} />
        </svg>
      ))}
    </div>
  )
}
