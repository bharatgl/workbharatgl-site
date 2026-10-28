import { mystery } from '../content.js'
import { findClue, useCase } from '../lib/caseGame.js'
import { releaseBats } from './Bats.jsx'

export const CLUE_EVENT = 'cf:clue'

// Small hand-drawn evidence icons (original artwork).
const ICONS = {
  coffee: (
    <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
      <circle cx="24" cy="24" r="15" opacity=".85" />
      <path d="M12 21 C 18 14, 31 13, 37 22" opacity=".45" />
      <circle cx="24" cy="24" r="11" opacity=".3" />
    </g>
  ),
  ticket: (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
      <path d="M6 14 H42 V20 a4 4 0 0 0 0 8 V34 H6 V28 a4 4 0 0 0 0-8 Z" />
      <path d="M30 14 V34" strokeDasharray="2 3" />
      <path d="M12 21 H24 M12 27 H20" strokeLinecap="round" />
    </g>
  ),
  print: (
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M24 8 C 14 8, 10 16, 10 24" />
      <path d="M24 13 C 17 13, 15 19, 15 26 C 15 32, 18 37, 22 40" />
      <path d="M24 18 C 21 18, 20 22, 20 26 C 20 31, 22 35, 26 38" />
      <path d="M24 8 C 34 8, 38 16, 38 24 C 38 30, 36 35, 33 39" />
      <path d="M28 14 C 32 16, 33 20, 33 25 C 33 31, 31 35, 29 38" />
      <path d="M24 23 C 25 28, 26 32, 30 36" />
    </g>
  ),
  note: (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
      <path d="M10 8 H38 V30 L34 34 L30 30 L26 35 L22 30 L18 35 L14 30 L10 34 Z" />
      <path d="M16 16 H32 M16 22 H28" />
    </g>
  ),
  key: (
    <g fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="24" r="8" />
      <path d="M23 24 H42 M36 24 V31 M41 24 V29" />
    </g>
  ),
}

/** A hidden clue. Place it inside a positioned parent; `className` sets where it sits. */
export default function Clue({ id, className = '' }) {
  const s = useCase()
  const clue = mystery.clues.find((c) => c.id === id)
  if (!clue) return null
  const found = s.found.includes(id)
  const bag = (e) => {
    e.stopPropagation()
    if (!findClue(id)) return
    releaseBats(e.clientX, e.clientY, 10)
    window.dispatchEvent(new CustomEvent(CLUE_EVENT, { detail: { id } }))
  }
  return (
    <button
      type="button"
      className={`clue clue--${clue.icon} ${found ? 'is-found' : ''} ${className}`}
      onClick={bag}
      aria-label={found ? `Clue found: ${clue.label}` : `Hidden clue: ${clue.label}`}
      aria-pressed={found}
      data-cursor={found ? 'bagged' : 'clue?'}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">{ICONS[clue.icon]}</svg>
      {found && <span className="clue-tag cf-label">bagged</span>}
    </button>
  )
}
