import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion.js'

/**
 * Evidence-board string. Finds every [data-pin] inside `children`, then draws a
 * sagging red string from one pin to the next. The string pays out as you
 * scroll (scrubbed), and re-measures whenever the layout changes. `scope` limits
 * which pins are joined (a selector inside the board).
 */
export default function RedString({ children, className = '', sag = 0.18, start = 'top 75%', end = 'bottom 70%', scope = '' }) {
  const box = useRef(null)
  const svg = useRef(null)
  const [paths, setPaths] = useState([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = box.current
    const measure = () => {
      const r = el.getBoundingClientRect()
      const pts = [...el.querySelectorAll(`${scope} [data-pin]`.trim())]
        .filter((p) => p.offsetParent !== null)
        .map((p) => {
          const b = p.getBoundingClientRect()
          return { x: b.left + b.width / 2 - r.left, y: b.top + Math.min(b.height / 2, 10) - r.top }
        })
      const d = []
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2 + dist * sag
        d.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`)
      }
      setSize({ w: r.width, h: r.height })
      setPaths(d)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('load', measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('load', measure)
    }
  }, [sag, scope])

  // Animate the string drawing in, scrubbed by scroll.
  useEffect(() => {
    if (!paths.length) return
    const els = [...svg.current.querySelectorAll('.rs-line')]
    els.forEach((p) => {
      const len = p.getTotalLength() + 2
      p.style.strokeDasharray = `${len} ${len}`
      p.style.strokeDashoffset = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : len
    })
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.to(els, {
      strokeDashoffset: 0,
      ease: 'none',
      stagger: 0.5,
      scrollTrigger: { trigger: box.current, start, end, scrub: 0.6 },
    })
    ScrollTrigger.refresh()
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [paths, start, end])

  return (
    <div ref={box} className={`rs ${className}`}>
      <svg ref={svg} className="rs-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w || 1} ${size.h || 1}`} aria-hidden="true">
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} className="rs-shadow" />
            <path d={d} className="rs-line" />
          </g>
        ))}
      </svg>
      {children}
    </div>
  )
}
