import { useEffect, useRef, useState } from 'react'
import { mystery, site } from '../content.js'
import { allFound, caseTime, resetCase, solveCase, totalClues, useCase, wrongAccusation } from '../lib/caseGame.js'
import { track } from '../lib/analytics.js'
import { releaseBats } from './Bats.jsx'
import { CLUE_EVENT } from './Clue.jsx'
import { copyEmail } from './EmailToast.jsx'

/**
 * The mystery's HUD: a small "Clues 2/5" chip that appears after the first clue (it never nags
 * before that), a drawer listing found clues with hints for the rest, and the accusation once all
 * five are bagged. Solving it shows the time and a share line. Nothing on the site is locked behind it.
 */
export default function CaseNotebook() {
  const s = useCase()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [reply, setReply] = useState('')
  const [copied, setCopied] = useState(false)
  const t = useRef(0)

  // a short note each time a clue is bagged
  useEffect(() => {
    const on = (e) => {
      const c = mystery.clues.find((x) => x.id === e.detail.id)
      setToast(`Clue ${Math.min(totalClues, s.found.length + 1)}/${totalClues}: ${c?.fact ?? ''}`)
      clearTimeout(t.current)
      t.current = setTimeout(() => setToast(''), 4200)
    }
    window.addEventListener(CLUE_EVENT, on)
    return () => window.removeEventListener(CLUE_EVENT, on)
  }, [s.found.length])

  // open the accusation automatically when the last clue is found
  useEffect(() => {
    if (allFound(s) && !s.solvedAt) setOpen(true)
  }, [s.found.length, s.solvedAt])

  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  if (!s.found.length) return null
  const accuse = (a, e) => {
    if (a.correct) {
      setReply('')
      solveCase()
      releaseBats(e.clientX, e.clientY, 26)
    } else {
      wrongAccusation(a.id)
      setReply(a.reply)
    }
  }
  const shareText = `I solved Bharat Goyal’s case in ${caseTime(s)}. Can you beat it? workbharatgl.online`
  const share = async () => {
    track('case_share')
    try {
      if (navigator.share) return void (await navigator.share({ text: shareText }))
    } catch {}
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  return (
    <>
      <button className={`nb-chip ${s.solvedAt ? 'is-solved' : ''}`} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="cf-label">{s.solvedAt ? `Solved · ${caseTime(s)}` : 'Case notebook'}</span>
        <b>
          {s.found.length}/{totalClues}
        </b>
      </button>

      {toast && (
        <p className="nb-toast" role="status">
          {toast}
        </p>
      )}

      {open && (
        <div className="nb-scrim" onClick={() => setOpen(false)}>
          <div className="nb" role="dialog" aria-modal="true" aria-label="Case notebook" onClick={(e) => e.stopPropagation()}>
            <button className="nb-close" onClick={() => setOpen(false)} aria-label="Close the notebook">
              ✕
            </button>
            <p className="cf-label nb-kicker">{mystery.title}</p>

            {s.solvedAt ? (
              <div className="nb-solved">
                <p className="nb-stamp cf-display">Case solved</p>
                <p className="nb-time">
                  in <b>{caseTime(s)}</b>
                </p>
                <p>{mystery.solved}</p>
                <div className="nb-actions">
                  <a className="cf-btn cf-btn--primary" href={site.resume} target="_blank" rel="noreferrer">
                    <span>Résumé (PDF)</span>
                  </a>
                  <a className="cf-btn cf-btn--secondary" href={`mailto:${site.email}`} onClick={() => copyEmail(site.email)}>
                    <span>Email him</span>
                  </a>
                  <button className="cf-btn cf-btn--ghost" onClick={share}>
                    <span>{copied ? 'Copied, go brag' : 'Share your time'}</span>
                  </button>
                </div>
                <button className="nb-reset" onClick={() => (resetCase(), setOpen(false))}>
                  Reset the case
                </button>
              </div>
            ) : allFound(s) ? (
              <div className="nb-accuse">
                <p className="nb-q cf-display">{mystery.question}</p>
                {mystery.answers.map((a) => (
                  <button key={a.id} className="nb-answer" onClick={(e) => accuse(a, e)}>
                    {a.label}
                  </button>
                ))}
                {reply && (
                  <p className="nb-reply" role="status">
                    {reply}
                  </p>
                )}
              </div>
            ) : (
              <ol className="nb-list">
                {mystery.clues.map((c) => {
                  const got = s.found.includes(c.id)
                  return (
                    <li key={c.id} className={got ? 'is-got' : ''}>
                      <span className="nb-mark">{got ? '✓' : '?'}</span>
                      <span>{got ? c.fact : <em>{c.hint}</em>}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}
