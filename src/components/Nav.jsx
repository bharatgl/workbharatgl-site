import { useEffect, useRef, useState } from 'react'
import { nav, site } from '../content.js'
import { Button } from '../ds/index.jsx'
import HandText, { primeStrokes } from './HandText.jsx'
import Roll from './Roll.jsx'
import { gsap, onReady, reducedMotion } from '../lib/motion.js'
import { SECTIONS, useGoTo, useUrlFollowsScroll } from '../lib/sectionRoutes.js'

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
  useUrlFollowsScroll(active)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const logo = useRef(null)

  // The handwritten logo writes itself once the intro is done.
  useEffect(() => {
    const paths = primeStrokes(logo.current)
    if (reducedMotion()) return void gsap.set(paths, { strokeDashoffset: 0 })
    let t
    onReady(() => (t = gsap.to(paths, { strokeDashoffset: 0, duration: 0.3, stagger: 0.06, delay: 0.4, ease: 'power1.inOut' })))
    return () => t?.kill()
  }, [])

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
          <HandText ref={logo} text="bharat" weight={90} wobble={0.4} seed={3} align="left" maxWidth={3200} label={site.name} className="nav-logo" />
          <span className="nav-case cf-label">case #001</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={goTo(n.href.slice(1))} className={active === n.href.slice(1) ? 'is-active' : ''} aria-current={active === n.href.slice(1) ? 'location' : undefined}>
              <Roll>{n.label}</Roll>
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <Button href={site.resume} variant="secondary" target="_blank" rel="noreferrer" className="nav-resume" data-cursor="download">
            résumé
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
          <Button href={`mailto:${site.email}`} tabIndex={open ? 0 : -1}>email me</Button>
          <Button href={site.resume} variant="secondary" target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>résumé</Button>
        </div>
      </div>
    </header>
  )
}
