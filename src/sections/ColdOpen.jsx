import { useEffect, useRef, useState } from 'react'
import RedString from '../components/RedString.jsx'
import { releaseBats } from '../components/Bats.jsx'
import { hero, site } from '../content.js'
import { Button, HandNote, Paper, Polaroid, Sticky } from '../ds/index.jsx'
import { onReady, reducedMotion } from '../lib/motion.js'
import { track } from '../lib/analytics.js'
import useMedia from '../lib/useMedia.js'
import { useGoTo } from '../lib/sectionRoutes.js'
import { copyEmail } from '../components/EmailToast.jsx'
import { openSummary } from '../components/RecruiterCard.jsx'

// Numbered crime-scene evidence markers in the open spaces of the board (x, y as fractions of the hero).
const MARKERS = [[0.44, 0.17], [0.47, 0.93], [0.9, 0.9]]

function EvidenceMarkers() {
  return (
    <div className="co-markers" aria-hidden="true">
      {MARKERS.map(([x, y], i) => (
        <span key={i} className="co-marker" style={{ left: `${x * 100}%`, top: `${y * 100}%`, '--i': i }}>
          <b>{i + 1}</b>
        </span>
      ))}
    </div>
  )
}

const LIGHTS_ON_AFTER = 5200 // ms: nobody stays in the dark for long

/**
 * Flashlight: the board opens in darkness with a torch beam that sweeps by itself, then follows the
 * mouse or finger. Lights come on by themselves after a few seconds, or on click, tap, scroll or the button.
 */
function Flashlight({ host }) {
  const [phase, setPhase] = useState(() => (reducedMotion() ? 'off' : 'wait')) // wait | dark | on | off
  const dark = useRef(null)

  useEffect(() => {
    if (phase === 'off') return
    const el = host.current
    let raf = 0
    let followed = false
    let t0 = 0
    const set = (x, y) => {
      dark.current?.style.setProperty('--fx', `${x}px`)
      dark.current?.style.setProperty('--fy', `${y}px`)
    }
    const lightsOn = (how) => {
      setPhase((p) => {
        if (p === 'on' || p === 'off') return p
        track('flashlight_lights_on', { how })
        if (import.meta.env.DEV) console.debug('[flashlight] lights on:', how)
        return 'on'
      })
    }
    const sweep = (t) => {
      if (!t0) t0 = t
      const k = (t - t0) / 1000
      const r = el.getBoundingClientRect()
      if (!followed) set(r.width * (0.5 + Math.sin(k * 1.1) * 0.36), r.height * (0.45 + Math.sin(k * 1.9) * 0.22))
      raf = requestAnimationFrame(sweep)
    }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      followed = true
      set(p.clientX - r.left, p.clientY - r.top)
    }
    let timer
    const go = onReady(() => {
      setPhase('dark')
      raf = requestAnimationFrame(sweep)
      timer = setTimeout(() => lightsOn('timer'), LIGHTS_ON_AFTER)
    })
    const click = () => lightsOn('click')
    const scroll = () => window.scrollY > 40 && lightsOn('scroll')
    el.addEventListener('pointermove', move)
    el.addEventListener('touchmove', move, { passive: true })
    el.addEventListener('click', click)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      go?.()
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('click', click)
      window.removeEventListener('scroll', scroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'off'])

  if (phase === 'off') return null
  return (
    <>
      <div ref={dark} className={`co-dark is-${phase}`} aria-hidden="true" />
      {phase === 'dark' && (
        <button className="co-lights" onClick={(e) => (e.stopPropagation(), setPhase('on'), track('flashlight_lights_on', { how: 'button' }))}>
          Lights on
        </button>
      )}
    </>
  )
}

export default function ColdOpen() {
  const ref = useRef(null)
  const goTo = useGoTo()
  // Stacked on phones: no hero string, so it never crosses the text or the photo.
  const stacked = useMedia('(max-width: 767px)')
  useEffect(() => onReady(() => ref.current?.classList.add('in')), [])
  const tap = (e) => {
    if (e.target.closest('a, button')) return
    releaseBats(e.clientX, e.clientY, 12)
  }
  return (
    <section className="co" id="top" ref={ref} onClick={tap}>
      <div className="co-moon" aria-hidden="true" />
      <EvidenceMarkers />
      <Flashlight host={ref} />
      <RedString className="co-board cf-wrap" start="top 90%" end="bottom 40%" scope={stacked ? '.co-no-string' : ''}>
        <div className="co-copy">
          <Sticky tilt={-3} className="co-hello" fix="pin">
            <span className="co-hello-tab cf-label">Case #001 · open</span>
            {hero.sticky}
          </Sticky>
          <h1 className="co-title cf-display">
            <span className="cf-sr">{site.name}, {site.role}. </span>
            <span className="co-line" style={{ '--i': 0 }}>
              <span>{hero.headline[0]}</span>
            </span>
            <span className="co-line" style={{ '--i': 1 }}>
              <span className="co-yellow">{hero.headline[1]}</span>
            </span>
          </h1>
          <p className="co-role">{hero.role}</p>
          <div className="co-ctas">
            <Button href="/about" onClick={goTo('about')} data-cursor="investigate">{hero.cta} ↓</Button>
            <Button href={`mailto:${site.email}`} onClick={() => copyEmail(site.email)} variant="secondary" data-cursor="say hi">Email me</Button>
            <Button href={site.resume} variant="ghost" target="_blank" rel="noreferrer" data-cursor="download">Résumé (PDF)</Button>
          </div>
          <button type="button" className="co-quick" onClick={(e) => (e.stopPropagation(), openSummary())}>
            Recruiter in a hurry? <b>30-second summary →</b>
          </button>
        </div>

        <div className="co-evidence">
          <Polaroid src={site.heroPhoto} alt={`${site.name} relaxing at a garden bench, in sunglasses and a black jacket`} caption={hero.polaroid} tilt={4} fix="pin" className="co-photo" imgClass="co-photo-img" priority>
          </Polaroid>
          <Paper tone="news" tilt={-4} fix="pin" className="co-clip" torn={{ seed: 9, edges: 'tblr' }}>
            <p className="co-clip-paper cf-label">{hero.clipping.paper}</p>
            <p className="co-clip-title cf-display">{hero.clipping.title}</p>
            <p className="co-clip-body">{hero.clipping.body}</p>
          </Paper>
          <div className="co-note" aria-hidden="true">
            <svg viewBox="0 0 120 80" className="co-arrow">
              <path d="M110 70 C 80 66, 40 52, 16 16 M10 30 L14 12 L32 18" />
            </svg>
            <HandNote text={hero.note} maxWidth={5200} weight={78} seed={6} delay={1.2} />
          </div>
        </div>
      </RedString>
      <p className="co-hint cf-label" aria-hidden="true">Psst: tap the board. The bats live here.</p>
    </section>
  )
}
