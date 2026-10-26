import { useEffect, useRef, useState } from 'react'
import { site } from '../content.js'
import { releaseBats } from './Bats.jsx'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Floating 3D envelope (pure CSS 3D, driven by a small spring loop):
 * - swings like it hangs on the board when you scroll, then settles
 * - leans toward the cursor as it approaches, and the flap starts to lift
 * - opens fully on hover (letter slides out)
 * - gives a "you've got mail" wiggle every few seconds while idle
 * - on click: opens, flies up, then the mail client opens
 * Shows after the hero, hides over the contact section.
 */
export default function Envelope() {
  const btn = useRef(null)
  const [visible, setVisible] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const on = () => {
      const c = document.getElementById('contact')?.getBoundingClientRect()
      const overContact = c && c.top < window.innerHeight * 0.8 && c.bottom > 0
      setVisible(window.scrollY > window.innerHeight * 0.7 && !overContact)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Spring physics for swing (scroll) and lean/flap (cursor proximity).
  useEffect(() => {
    if (reduced()) return
    const el = btn.current
    const state = { swing: 0, vel: 0, rx: 0, ry: 0, open: 0, tRx: 0, tRy: 0, tOpen: 0 }
    let lastY = window.scrollY
    let raf = 0
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const onScroll = () => {
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      state.vel += Math.max(-6, Math.min(6, dy * 0.08)) // kick the pendulum
    }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dyy = e.clientY - cy
      const dist = Math.hypot(dx, dyy)
      const near = Math.max(0, 1 - dist / 260) // 0 far … 1 touching
      state.tRy = (dx / 260) * 28 * near
      state.tRx = (-dyy / 260) * 22 * near
      state.tOpen = el.matches(':hover') ? 1 : near * 0.45
    }
    const tick = () => {
      // damped spring back to 0 for the swing
      state.vel += -state.swing * 0.06
      state.vel *= 0.9
      state.swing += state.vel
      state.rx += (state.tRx - state.rx) * 0.12
      state.ry += (state.tRy - state.ry) * 0.12
      state.open += (state.tOpen - state.open) * 0.14
      el.style.setProperty('--swing', `${state.swing.toFixed(2)}deg`)
      el.style.setProperty('--rx', `${state.rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${state.ry.toFixed(2)}deg`)
      el.style.setProperty('--open', state.open.toFixed(3))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('scroll', onScroll, { passive: true })
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  // "You've got mail" nudge every ~7s while visible.
  useEffect(() => {
    if (!visible || reduced()) return
    const el = btn.current
    const id = setInterval(() => {
      el.classList.remove('is-nudge')
      void el.offsetWidth // restart the animation
      el.classList.add('is-nudge')
    }, 7000)
    return () => clearInterval(id)
  }, [visible])

  const send = (e) => {
    if (reduced()) return // plain link
    e.preventDefault()
    setSending(true)
    const r = btn.current.getBoundingClientRect()
    releaseBats(r.left + r.width / 2, r.top, 8)
    setTimeout(() => (window.location.href = `mailto:${site.email}`), 650)
    setTimeout(() => setSending(false), 1500)
  }

  return (
    <a
      ref={btn}
      className={`env ${sending ? 'is-sending' : ''}`}
      href={`mailto:${site.email}`}
      onClick={send}
      data-visible={visible}
      data-cursor="send a tip"
      aria-label={`Email ${site.name}`}
      tabIndex={visible ? 0 : -1}
    >
      <span className="env-swing">
        <span className="env-bob">
          <span className="env-3d">
            <span className="env-back" />
            <span className="env-letter">hi bharat,</span>
            <span className="env-front" />
            <span className="env-flap" />
            <span className="env-seal">BG</span>
          </span>
        </span>
      </span>
    </a>
  )
}
