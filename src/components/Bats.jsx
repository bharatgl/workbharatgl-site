import { useEffect, useRef } from 'react'

export const BATS_EVENT = 'bats:burst'

/** Fire a burst of bats from a viewport point. */
export function releaseBats(x, y, count = 18) {
  window.dispatchEvent(new CustomEvent(BATS_EVENT, { detail: { x, y, count } }))
}

/**
 * Bat swarm on a full-screen canvas. Bats flap, drift outward and upward with
 * a little jitter, then fade. Also sends a small flock across the sky every so
 * often while the top of the page is on screen. Off for reduced motion.
 */
export default function Bats() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    const ctx = c.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const small = () => window.innerWidth < 700
    let bats = []
    let raf = 0
    let running = false

    const resize = () => {
      c.width = window.innerWidth * dpr
      c.height = window.innerHeight * dpr
      c.style.width = `${window.innerWidth}px`
      c.style.height = `${window.innerHeight}px`
    }

    const spawn = (x, y, count, mode = 'burst') => {
      const n = small() ? Math.ceil(count * 0.6) : count
      for (let i = 0; i < n; i++) {
        const a = mode === 'burst' ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5 : (Math.random() - 0.5) * 0.4
        const speed = mode === 'burst' ? 3 + Math.random() * 5 : 2.2 + Math.random() * 1.4
        bats.push({
          x: x + (mode === 'flock' ? -i * 26 : 0),
          y: y + (mode === 'flock' ? (Math.random() - 0.5) * 60 : 0),
          vx: Math.cos(a) * speed * (mode === 'flock' ? 1 : 1),
          vy: Math.sin(a) * speed - (mode === 'burst' ? 1 : 0),
          size: (small() ? 9 : 12) + Math.random() * (small() ? 8 : 12),
          phase: Math.random() * Math.PI * 2,
          flap: 0.32 + Math.random() * 0.12,
          life: 0,
          max: mode === 'burst' ? 110 + Math.random() * 70 : 600,
        })
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const drawBat = (b, alpha) => {
      const s = b.size * dpr
      const f = Math.sin(b.phase) // -1..1 wing beat
      ctx.save()
      ctx.translate(b.x * dpr, b.y * dpr)
      ctx.rotate(Math.atan2(b.vy, b.vx) * 0.15)
      ctx.globalAlpha = alpha
      ctx.beginPath()
      // left wing (scalloped trailing edge), right wing mirrored
      for (const side of [-1, 1]) {
        const tipY = -f * s * 0.8
        ctx.moveTo(0, -s * 0.12)
        ctx.quadraticCurveTo(side * s * 0.5, tipY - s * 0.3, side * s * 1.2, tipY)
        ctx.quadraticCurveTo(side * s * 0.95, tipY * 0.5 + s * 0.2, side * s * 0.8, tipY * 0.4 + s * 0.28)
        ctx.quadraticCurveTo(side * s * 0.6, s * 0.12, side * s * 0.45, s * 0.3)
        ctx.quadraticCurveTo(side * s * 0.3, s * 0.12, side * s * 0.12, s * 0.28)
        ctx.lineTo(0, s * 0.1)
      }
      ctx.fill()
      // body + ears
      ctx.beginPath()
      ctx.ellipse(0, s * 0.08, s * 0.13, s * 0.3, 0, 0, Math.PI * 2)
      ctx.moveTo(-s * 0.1, -s * 0.14)
      ctx.lineTo(-s * 0.07, -s * 0.34)
      ctx.lineTo(0, -s * 0.18)
      ctx.lineTo(s * 0.07, -s * 0.34)
      ctx.lineTo(s * 0.1, -s * 0.14)
      ctx.fill()
      ctx.restore()
    }

    function tick() {
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.fillStyle = '#020306'
      ctx.shadowColor = 'rgba(255, 196, 36, 0.35)'
      ctx.shadowBlur = 6 * dpr
      bats = bats.filter((b) => b.life < b.max && b.y > -80 && b.x > -200 && b.x < window.innerWidth + 200)
      for (const b of bats) {
        b.life++
        b.phase += b.flap
        b.vx += (Math.random() - 0.5) * 0.25
        b.vy += (Math.random() - 0.55) * 0.18
        b.x += b.vx
        b.y += b.vy + Math.sin(b.phase) * 0.6
        const fadeIn = Math.min(1, b.life / 8)
        const fadeOut = Math.min(1, (b.max - b.life) / 30)
        drawBat(b, Math.min(fadeIn, fadeOut))
      }
      if (bats.length) raf = requestAnimationFrame(tick)
      else {
        running = false
        ctx.clearRect(0, 0, c.width, c.height)
      }
    }

    const onBurst = (e) => spawn(e.detail.x, e.detail.y, e.detail.count, 'burst')
    // Occasional flock across the sky while near the top of the page.
    let flockTimer
    const flock = () => {
      if (window.scrollY < window.innerHeight * 0.8 && !document.hidden) {
        spawn(-40, window.innerHeight * (0.12 + Math.random() * 0.25), small() ? 4 : 6, 'flock')
      }
      flockTimer = setTimeout(flock, 9000 + Math.random() * 7000)
    }
    flockTimer = setTimeout(flock, 6000)

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener(BATS_EVENT, onBurst)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(flockTimer)
      window.removeEventListener('resize', resize)
      window.removeEventListener(BATS_EVENT, onBurst)
    }
  }, [])

  return <canvas className="bats" ref={ref} aria-hidden="true" />
}
