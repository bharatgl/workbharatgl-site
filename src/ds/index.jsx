// CASEFILE design system: React primitives. Styles live in ds/components.css.
import { useEffect, useMemo, useRef, useState } from 'react'
import useInView from '../lib/useInView.js'
import HandText, { primeStrokes } from '../components/HandText.jsx'
import { gsap } from '../lib/motion.js'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/** A ragged clip-path polygon so paper looks torn, not cut. `edges` picks which sides tear. */
export function tornPath(seed = 1, edges = 'tb', depth = 2.2) {
  const r = rng(seed)
  const pts = []
  const n = 26
  const j = () => (r() * depth).toFixed(2)
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${edges.includes('t') ? j() : 0}%`)
  for (let i = 1; i < n; i++) pts.push(`${edges.includes('r') ? 100 - j() : 100}% ${((i / n) * 100).toFixed(2)}%`)
  for (let i = n; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${edges.includes('b') ? 100 - j() : 100}%`)
  for (let i = n - 1; i > 0; i--) pts.push(`${edges.includes('l') ? j() : 0}% ${((i / n) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(',')})`
}

/** Any scrap on the board. tone: paper | news | manila | white. fix: 'pin' | 'tape' | 'tapes' | none. */
export function Paper({ as: Tag = 'div', tone = 'paper', tilt = 0, fix, torn, lined, lift, className = '', style, children, ...rest }) {
  const tornClip = useMemo(() => (torn ? tornPath(torn.seed ?? 3, torn.edges ?? 'tb') : null), [torn])
  return (
    <Tag
      className={`cf-paper cf-paper--${tone} ${torn ? 'is-torn' : ''} ${lined ? 'cf-paper--lined' : ''} ${lift ? 'is-lift' : ''} ${className}`}
      style={{ '--tilt': `${tilt}deg`, ...(tornClip ? { '--torn': tornClip } : {}), ...style }}
      {...rest}
    >
      {fix === 'pin' && <span className="cf-pin" data-pin="" aria-hidden="true" />}
      {fix === 'tape' && <span className="cf-tape cf-tape--top" aria-hidden="true" />}
      {fix === 'tapes' && (
        <>
          <span className="cf-tape cf-tape--tl" aria-hidden="true" />
          <span className="cf-tape cf-tape--tr" aria-hidden="true" />
        </>
      )}
      {children}
    </Tag>
  )
}

/** Polaroid photo with a handwritten caption. */
export function Polaroid({ src, alt, caption, tilt = -3, fix = 'tape', ratio = '4 / 5', children, className = '', imgClass = '', priority = false, ...rest }) {
  return (
    <Paper tone="white" tilt={tilt} fix={fix} className={`cf-polaroid ${className}`} {...rest}>
      <div className="cf-polaroid-img" style={{ '--ratio': ratio }}>
        {src && <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : undefined} decoding="async" width="680" height="850" className={imgClass} />}
        {children}
      </div>
      {caption && <p className="cf-polaroid-cap">{caption}</p>}
    </Paper>
  )
}

/** Yellow sticky note. */
export function Sticky({ children, tilt = 2, className = '', ...rest }) {
  return (
    <Paper tone="paper" tilt={tilt} className={`cf-sticky ${className}`} {...rest}>
      {children}
    </Paper>
  )
}

/** Rubber stamp that thunks in when `on` becomes true. tone: paper (default) | board | yellow. */
export function Stamp({ children, on = true, tone }) {
  return <span className={`cf-stamp ${tone ? `cf-stamp--${tone}` : ''} ${on ? 'is-on' : ''}`}>{children}</span>
}

/** Manila evidence tag. tone: manila | paper | yellow. */
export function EvidenceTag({ children, tone = 'manila', className = '' }) {
  return <span className={`cf-etag ${tone !== 'manila' ? `cf-etag--${tone}` : ''} ${className}`}>{children}</span>
}

/** Primary action. variant: 'primary' (yellow label) | 'secondary' (paper label) | 'ghost' (underlined). */
export function Button({ as: Tag = 'a', variant = 'primary', icon, children, className = '', ...rest }) {
  return (
    <Tag className={`cf-btn cf-btn--${variant} ${className}`} {...rest}>
      {icon}
      <span>{children}</span>
    </Tag>
  )
}

/** Wraps text in a hand-drawn marker circle that draws itself when scrolled into view. */
export function Circled({ children, color, seed = 2 }) {
  const [ref, inView] = useInView(0.6)
  // A full oval that stays inside its box, with a small overshoot where the pen closes the loop.
  const d = useMemo(() => {
    const r = rng(seed)
    const w = (n) => ((r() - 0.5) * n).toFixed(1)
    return `M ${52 + +w(6)} ${3 + +w(2)} C ${86 + +w(4)} ${3 + +w(3)}, ${99 + +w(1)} ${24 + +w(4)}, ${98 + +w(1)} ${50 + +w(4)} C ${97 + +w(1)} ${79 + +w(4)}, ${78 + +w(4)} ${97 + +w(1)}, ${49 + +w(4)} ${97 + +w(1)} C ${18 + +w(4)} ${97 + +w(1)}, ${2 + +w(1)} ${76 + +w(4)}, ${3 + +w(1)} ${48 + +w(4)} C ${4 + +w(1)} ${20 + +w(4)}, ${24 + +w(4)} ${4 + +w(2)}, ${64 + +w(6)} ${8 + +w(3)}`
  }, [seed])
  return (
    <span ref={ref} className={`cf-circled ${inView ? 'is-in' : ''}`} style={color ? { '--c': color } : undefined}>
      {children}
      <svg className="cf-circle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={d} vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}

/** Highlighter swipe behind text when it scrolls into view. */
export function Highlight({ children }) {
  const [ref, inView] = useInView(0.8)
  return (
    <mark ref={ref} className={`cf-hl ${inView ? 'is-in' : ''}`}>
      {children}
    </mark>
  )
}

/** Handwriting that writes itself (pen strokes) when it scrolls into view. */
export function HandNote({ text, maxWidth = 7000, weight = 64, className = '', speed = 0.03, delay = 0, align = 'left', seed = 5 }) {
  const ref = useRef(null)
  const [wrap, inView] = useInView(0.5)
  useEffect(() => {
    const paths = primeStrokes(ref.current)
    if (reduced()) gsap.set(paths, { strokeDashoffset: 0 })
  }, [text])
  useEffect(() => {
    if (!inView || reduced()) return
    const t = gsap.to(ref.current.querySelectorAll('.hand-stroke'), { strokeDashoffset: 0, duration: 0.16, stagger: speed, delay, ease: 'power1.inOut' })
    return () => t.kill()
  }, [inView, speed, delay])
  return (
    <span ref={wrap} className={`cf-handnote ${className}`}>
      <HandText ref={ref} text={text} maxWidth={maxWidth} weight={weight} align={align} seed={seed} />
    </span>
  )
}

/** Fades/slides children in when scrolled into view. `delay` steps of 90ms, `from` = starting tilt. */
export function Reveal({ as: Tag = 'div', delay = 0, from = 0, children, className = '', style, ...rest }) {
  const [ref, inView] = useInView(0.15)
  return (
    <Tag ref={ref} className={`cf-reveal ${inView ? 'is-in' : ''} ${className}`} style={{ '--d': delay, '--r0': `${from}deg`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

/** Chapter header: evidence-tag chapter label, a plain readable title, one-line summary. */
export function Chapter({ n, label, title, sub }) {
  return (
    <header className="cf-chapter">
      <EvidenceTag className="cf-chapter-tag">
        Chapter {n} · {label}
      </EvidenceTag>
      <h2 className="cf-chapter-title cf-display">{title}</h2>
      {sub && <p className="cf-chapter-sub">{sub}</p>}
    </header>
  )
}

/** Types text out like a typewriter once visible. */
export function Typewriter({ text, speed = 24, className = '', as: Tag = 'span' }) {
  const [ref, inView] = useInView(0.6)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduced()) return setN(text.length)
    if (n >= text.length) return
    const t = setTimeout(() => setN((v) => v + 1), speed)
    return () => clearTimeout(t)
  }, [inView, n, text, speed])
  return (
    <Tag ref={ref} className={`cf-type ${className}`} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>{text.slice(n)}</span>
    </Tag>
  )
}
