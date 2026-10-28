import { useEffect, useState } from 'react'
import { nav, site } from '../content.js'
import { Button } from '../ds/index.jsx'
import Roll from './Roll.jsx'
import { SECTIONS, useGoTo, useUrlFollowsScroll } from '../lib/sectionRoutes.js'
import { copyEmail } from './EmailToast.jsx'
import { sectionSeen } from '../lib/analytics.js'
import { SOUND_EVENT, setSound, soundOn } from '../lib/sound.js'

const IDS = ['top', ...SECTIONS] // 'top' is watched so the URL goes back to / at the top

function useActive() {
  const [active, setActive] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
  return active
}

export default function Nav() {
  const active = useActive()
  const goTo = useGoTo()
  const [sound, setSoundState] = useState(soundOn)
  useEffect(() => {
    const on = (e) => setSoundState(e.detail)
    window.addEventListener(SOUND_EVENT, on)
    return () => window.removeEventListener(SOUND_EVENT, on)
  }, [])
  useUrlFollowsScroll(active)
  useEffect(() => sectionSeen(active), [active])
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(window.scrollY > 30)
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav-bar">
        <a href="/" className="nav-id" onClick={goTo('top', () => setOpen(false))} data-cursor="home">
          {/* police-badge mark: same hexagon as the badge on Inspector Byte's cap */}
          <svg className="nav-badge" viewBox="0 0 40 44" aria-hidden="true">
            <path d="M20 2 L37 11.5 L37 32.5 L20 42 L3 32.5 L3 11.5 Z" />
            <text x="20" y="27.5" textAnchor="middle">BG</text>
          </svg>
          <span className="nav-name">
            <span className="cf-display">{site.name}</span>
            <span className="nav-case cf-label">Case #001</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={goTo(n.href.slice(1))} className={active === n.href.slice(1) ? 'is-active' : ''} aria-current={active === n.href.slice(1) ? 'location' : undefined}>
              <Roll>{n.label}</Roll>
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <button className={`nav-sound ${sound ? 'is-on' : ''}`} onClick={() => setSound(!sound)} aria-pressed={sound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} title={sound ? 'Sound on' : 'Sound off'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9h4l5-4v14l-5-4H4z" />
              {sound ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" /> : <path d="M17 9l5 6M22 9l-5 6" fill="none" />}
            </svg>
          </button>
          <Button href={site.resume} variant="secondary" target="_blank" rel="noreferrer" className="nav-resume" data-cursor="download">
            Résumé
          </Button>
          <button className="nav-menu" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            <i />
            <i />
          </button>
        </div>
      </div>
      <span className="nav-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

      <div id="menu" className="menu" aria-hidden={!open}>
        <nav aria-label="Menu">
          {nav.map((n, i) => (
            <a key={n.href} href={n.href} onClick={goTo(n.href.slice(1), () => setOpen(false))} tabIndex={open ? 0 : -1} style={{ '--i': i, '--t': `${(i % 2 ? 1 : -1) * (1 + i * 0.4)}deg` }}>
              <span className="menu-idx cf-label">exhibit {String.fromCharCode(65 + i)}</span>
              <span className="cf-display">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <Button href={`mailto:${site.email}`} onClick={() => copyEmail(site.email)} tabIndex={open ? 0 : -1}>Email me</Button>
          <Button href={site.resume} variant="secondary" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Résumé</Button>
        </div>
      </div>
    </header>
  )
}
