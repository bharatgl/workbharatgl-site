import { useEffect, useRef } from 'react'
import { tape } from '../content.js'

/** Crime-scene tape that crawls across the page and speeds up with scroll. */
export default function CrimeTape({ tilt = -2, reverse = false, className = '' }) {
  const track = useRef(null)
  useEffect(() => {
    const el = track.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let x = 0
    let v = 0
    let lastY = window.scrollY
    let raf = 0
    let visible = false
    const dir = reverse ? 1 : -1
    const tick = () => {
      const y = window.scrollY
      v += (Math.abs(y - lastY) * 0.3 - v) * 0.12
      lastY = y
      x += dir * (0.7 + v)
      const half = el.scrollWidth / 2
      if (x <= -half) x += half
      if (x > 0) x -= half
      el.style.transform = `translate3d(${x}px,0,0)`
      if (visible) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(tick)
    })
    io.observe(el.parentElement)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [reverse])
  const words = [...tape, ...tape, ...tape]
  return (
    <div className={`tape ${className}`} style={{ '--tilt': `${tilt}deg` }} aria-hidden="true">
      <div className="tape-track" ref={track}>
        {[...words, ...words].map((w, i) => (
          <span key={i}>
            {w}
            <b>✕</b>
          </span>
        ))}
      </div>
    </div>
  )
}
