import { useEffect, useRef } from 'react'

export const EVIDENCE_EVENT = 'evidence:burst'

/** Pop a burst of evidence markers and paper scraps from a viewport point. */
export function releaseEvidence(x, y, count = 18) {
  window.dispatchEvent(new CustomEvent(EVIDENCE_EVENT, { detail: { x, y, count } }))
}

const YELLOW = '#ffd23f'
const PAPER = '#efe6d2'
const INK = '#1a1712'

/**
 * Evidence burst on a full-screen canvas: numbered yellow crime-scene markers and torn paper scraps
 * pop up, tumble under gravity, then fade. Only ever runs in response to a click; off for reduced motion.
 */
export default function EvidenceBurst() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    const ctx = c.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const small = () => window.innerWidth < 700
    let bits = []
    let raf = 0
    let running = false
    let label = 0

    const resize = () => {
      c.width = window.innerWidth * dpr
      c.height = window.innerHeight * dpr
      c.style.width = `${window.innerWidth}px`
      c.style.height = `${window.innerHeight}px`
    }

    const spawn = (x, y, count) => {
      const n = small() ? Math.ceil(count * 0.6) : count
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1
        const speed = 4 + Math.random() * 6
        const marker = Math.random() < 0.45
        bits.push({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          rot: (Math.random() - 0.5) * 0.6,
          spin: (Math.random() - 0.5) * 0.2,
          size: (small() ? 12 : 16) + Math.random() * (small() ? 6 : 10),
          marker,
          n: marker ? (label++ % 9) + 1 : 0,
          life: 0,
          max: 70 + Math.random() * 50,
        })
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const drawMarker = (b) => {
      const s = b.size * dpr
      ctx.fillStyle = YELLOW
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.6)
      ctx.lineTo(s * 0.55, s * 0.45)
      ctx.lineTo(-s * 0.55, s * 0.45)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = INK
      ctx.font = `700 ${Math.round(s * 0.5)}px "Bebas Neue", sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(String(b.n), 0, s * 0.36)
    }

    const drawScrap = (b) => {
      const s = b.size * dpr
      ctx.fillStyle = PAPER
      ctx.beginPath()
      ctx.moveTo(-s * 0.45, -s * 0.32)
      ctx.lineTo(s * 0.4, -s * 0.38)
      ctx.lineTo(s * 0.48, s * 0.3)
      ctx.lineTo(s * 0.1, s * 0.22)
      ctx.lineTo(-s * 0.42, s * 0.34)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(26, 23, 18, .35)'
      ctx.lineWidth = dpr
      ctx.beginPath()
      ctx.moveTo(-s * 0.3, -s * 0.08)
      ctx.lineTo(s * 0.3, -s * 0.12)
      ctx.stroke()
    }

    function tick() {
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.shadowColor = 'rgba(0, 0, 0, .4)'
      ctx.shadowBlur = 4 * dpr
      bits = bits.filter((b) => b.life < b.max && b.y < window.innerHeight + 60)
      for (const b of bits) {
        b.life++
        b.vy += 0.32 // gravity
        b.vx *= 0.985
        b.x += b.vx
        b.y += b.vy
        b.rot += b.spin
        ctx.save()
        ctx.translate(b.x * dpr, b.y * dpr)
        ctx.rotate(b.rot)
        ctx.globalAlpha = Math.min(1, (b.max - b.life) / 25)
        if (b.marker) drawMarker(b)
        else drawScrap(b)
        ctx.restore()
      }
      if (bits.length) raf = requestAnimationFrame(tick)
      else {
        running = false
        ctx.clearRect(0, 0, c.width, c.height)
      }
    }

    const onBurst = (e) => spawn(e.detail.x, e.detail.y, e.detail.count)

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener(EVIDENCE_EVENT, onBurst)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener(EVIDENCE_EVENT, onBurst)
    }
  }, [])

  return <canvas className="evidence-burst" ref={ref} aria-hidden="true" />
}
