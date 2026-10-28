import { useEffect, useRef, useState } from 'react'
import InspectorAvatar from './InspectorAvatar.jsx'
import { logCall } from '../lib/callLog.js'

const KEY = 'cf-call-rang' // remembered per visitor, not per tab
const REMEMBER_DAYS = 30
const MIN_TIME = 15000 // ms on the page before it may ring
const GIVE_UP = 20000 // stop ringing if ignored

/** Ask the inspector to pick up (from a click, so the browser allows audio). */
export const answerInspector = () => window.dispatchEvent(new Event('inspector:answer'))

/**
 * A polite "incoming call": at most once per visitor (30 days), and only after they have spent a while on
 * the page and scrolled past the opening board, so it never interrupts the first read. Answer opens the
 * live voice call with Inspector Byte; Decline leaves a cheeky note. Every outcome is logged.
 */
export default function IncomingCall() {
  const [state, setState] = useState('idle') // idle | ringing | declined | gone
  const timers = useRef([])

  useEffect(() => {
    let rangAt = 0
    try {
      rangAt = Number(localStorage.getItem(KEY)) || 0
    } catch {}
    if (Date.now() - rangAt < REMEMBER_DAYS * 864e5) return
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
    const opened = Date.now()
    let done = false
    const ring = () => {
      if (done) return
      // only once they've had time to read and have scrolled past the opening board
      const pastHero = window.scrollY > window.innerHeight * 0.9
      if (Date.now() - opened < MIN_TIME || !pastHero) return
      // never interrupt someone already talking to the inspector
      if (document.querySelector('.stage.is-open')) return
      done = true
      window.removeEventListener('scroll', ring)
      try {
        localStorage.setItem(KEY, String(Date.now()))
      } catch {}
      setState('ringing')
      logCall('ring')
      later(() => {
        setState((s) => {
          if (s !== 'ringing') return s
          logCall('ignore')
          return 'gone'
        })
      }, GIVE_UP)
    }
    window.addEventListener('scroll', ring, { passive: true })
    // also check once a second, so it doesn't depend on a scroll happening after the minimum time
    const tick = setInterval(() => (done ? clearInterval(tick) : ring()), 1000)
    timers.current.push(tick)
    return () => {
      window.removeEventListener('scroll', ring)
      timers.current.forEach((t) => (clearTimeout(t), clearInterval(t)))
    }
  }, [])

  const answer = () => {
    setState('gone')
    logCall('answer')
    answerInspector()
  }
  const decline = () => {
    setState('declined')
    logCall('decline')
    timers.current.push(setTimeout(() => setState('gone'), 4200))
  }

  if (state === 'idle' || state === 'gone') return null
  return (
    <div className={`ring ring--${state}`} role="dialog" aria-label="Incoming call from Inspector Byte" aria-live="polite">
      {state === 'ringing' ? (
        <>
          <div className="ring-who">
            <span className="ring-av">
              <InspectorAvatar size={54} talking />
            </span>
            <span>
              <b>Inspector Byte</b>
              <span className="ring-sub">incoming call · about Bharat</span>
            </span>
          </div>
          <div className="ring-actions">
            <button className="ring-btn ring-btn--no" onClick={decline} aria-label="Decline the call">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3-2v-2.6c-2.3-.7-4.7-.7-7 0v2.6l-3 2z" /></svg>
            </button>
            <button className="ring-btn ring-btn--yes" onClick={answer} aria-label="Answer the call">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
            </button>
          </div>
          <p className="ring-note">Voice calls are recorded as text to improve this site.</p>
        </>
      ) : (
        <p className="ring-declined">No worries. I’ll be in the corner when you need me.</p>
      )}
    </div>
  )
}
