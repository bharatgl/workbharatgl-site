import { useEffect, useState } from 'react'
import { site, summary } from '../content.js'
import { track } from '../lib/analytics.js'
import { copyEmail } from './EmailToast.jsx'

export const openSummary = () => window.dispatchEvent(new Event('cf:summary'))

/** A plain, scannable 30-second summary for recruiters: no theme, no game, just the facts and links. */
export default function RecruiterCard() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => {
      setOpen(true)
      track('recruiter_summary_open')
    }
    window.addEventListener('cf:summary', on)
    return () => window.removeEventListener('cf:summary', on)
  }, [])
  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  if (!open) return null
  return (
    <div className="qsum-scrim" onClick={() => setOpen(false)}>
      <section className="qsum" role="dialog" aria-modal="true" aria-labelledby="qsum-title" onClick={(e) => e.stopPropagation()}>
        <button className="qsum-close" onClick={() => setOpen(false)} aria-label="Close the summary">
          ✕
        </button>
        <p className="qsum-kicker">30-second summary</p>
        <h2 id="qsum-title" className="qsum-title">
          {summary.title}
        </h2>
        <p className="qsum-line">{summary.line}</p>
        <ul className="qsum-wins">
          {summary.wins.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <p className="qsum-meta">
          <b>Stack</b> {summary.stack}
        </p>
        <p className="qsum-meta">
          <b>Location</b> {summary.where}
        </p>
        <div className="qsum-actions">
          <a className="cf-btn cf-btn--primary" href={site.resume} target="_blank" rel="noreferrer">
            <span>Résumé (PDF)</span>
          </a>
          <a className="cf-btn cf-btn--secondary" href={`mailto:${site.email}`} onClick={() => copyEmail(site.email)}>
            <span>Email {site.email}</span>
          </a>
          <a className="cf-btn cf-btn--ghost" href={site.linkedin} target="_blank" rel="noreferrer">
            <span>LinkedIn ↗</span>
          </a>
        </div>
      </section>
    </div>
  )
}
