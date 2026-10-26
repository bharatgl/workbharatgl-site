import { useEffect, useRef, useState } from 'react'

const TRAIL = 6

/**
 * Custom cursor: a ball with a fading dot trail. Over any element with
 * data-cursor="label" it turns into that word. Sections with data-tone="dark"
 * flip it to light ink. Only mounts for a real mouse/trackpad.
 */
export default function Cursor() {
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const root = useRef(null)
  const ball = useRef(null)
  const verb = useRef(null)
  const dots = useRef([])
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const target = { x: -200, y: -200 }
    const pos = { x: -200, y: -200 }
    const trail = Array.from({ length: TRAIL }, () => ({ x: -200, y: -200 }))
    let raf
    let shown = false

    const move = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!shown) {
        shown = true
        pos.x = target.x
        pos.y = target.y
        trail.forEach((t) => Object.assign(t, target))
        root.current.dataset.on = 'true'
      }
      const el = e.target.closest?.('[data-cursor]')
      const word = el?.dataset.cursor ?? ''
      root.current.dataset.mode = word ? 'word' : 'idle'
      setLabel((prev) => (prev === word || !word ? prev : word))
      const toneEl = e.target.closest?.('[data-tone]')
      root.current.dataset.tone = toneEl?.dataset.tone ?? 'light'
    }
    const leave = () => {
      shown = false
      root.current.dataset.on = 'false'
    }
    const down = () => root.current.classList.add('is-down')
    const up = () => root.current.classList.remove('is-down')

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.35
      pos.y += (target.y - pos.y) * 0.35
      const t = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      ball.current.style.transform = t
      verb.current.style.transform = `${t} translate(-50%, -50%)`
      let prev = pos
      trail.forEach((p, i) => {
        p.x += (prev.x - p.x) * 0.45
        p.y += (prev.y - p.y) * 0.45
        dots.current[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
        prev = p
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <span className="tc" ref={root} data-on="false" data-mode="idle" data-tone="light" aria-hidden="true">
      <span className="tc-trail">
        {Array.from({ length: TRAIL }, (_, i) => (
          <span className="tc-dot" key={i} ref={(el) => (dots.current[i] = el)} />
        ))}
      </span>
      <span className="tc-ball" ref={ball}>
        <span className="tc-ball-in" />
      </span>
      <span className="tc-verb" ref={verb}>
        <span className="tc-verb-in">
          {Array.from(label).map((ch, i) => (
            <span className="tc-ch" key={label + i} style={{ '--i': i }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span className="tc-arrow">↗</span>
        </span>
      </span>
    </span>
  )
}
