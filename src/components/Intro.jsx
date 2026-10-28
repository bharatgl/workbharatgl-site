import { useEffect, useState } from 'react'
import { intro } from '../content.js'
import { READY_EVENT, reducedMotion } from '../lib/motion.js'
import { releaseEvidence } from './EvidenceBurst.jsx'

const SEEN = 'cf-intro-seen'

function ready() {
  document.documentElement.classList.remove('is-intro')
  document.documentElement.dataset.ready = 'true'
  window.dispatchEvent(new Event(READY_EVENT))
}

/**
 * ~1.8s cold open: a case folder label types out, a red stamp thunks on,
 * a camera flash pops and the folder flips open onto the board. Tap/any key skips.
 */
export default function Intro() {
  const [skip] = useState(() => {
    try {
      return sessionStorage.getItem(SEEN) === '1' || reducedMotion()
    } catch {
      return reducedMotion()
    }
  })
  const [phase, setPhase] = useState(skip ? 'done' : 'file')

  useEffect(() => {
    if (skip) return ready()
    document.documentElement.classList.add('is-intro')
    let opened = false
    const open = () => {
      if (opened) return
      opened = true
      ready()
      releaseEvidence(window.innerWidth / 2, window.innerHeight * 0.45, 26)
      try {
        sessionStorage.setItem(SEEN, '1')
      } catch {}
      setPhase('open')
    }
    const t = setTimeout(open, 1700)
    window.addEventListener('keydown', open, { once: true })
    window.addEventListener('pointerdown', open, { once: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', open)
      window.removeEventListener('pointerdown', open)
    }
  }, [skip])

  useEffect(() => {
    if (phase !== 'open') return
    const t = setTimeout(() => setPhase('done'), 1000)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null
  return (
    <div className={`intro is-${phase}`} aria-hidden="true">
      <div className="intro-flash" />
      <div className="intro-folder">
        <span className="intro-tab cf-label">{intro.file}</span>
        <div className="intro-cover">
          <p className="intro-name cf-display">{intro.name}</p>
          <span className="intro-stamp">{intro.flag}</span>
        </div>
      </div>
    </div>
  )
}
