import { useEffect, useRef, useState } from 'react'
import RedString from '../components/RedString.jsx'
import Scribbles from '../components/Scribbles.jsx'
import { releaseBats } from '../components/Bats.jsx'
import { hero, site } from '../content.js'
import { Button, HandNote, Paper, Polaroid, Sticky } from '../ds/index.jsx'
import { onReady } from '../lib/motion.js'
import useMedia from '../lib/useMedia.js'
import { useGoTo } from '../lib/sectionRoutes.js'

const NAME_KEY = 'cf-visitor-name'
const SPOTS = [[0.04, 0.2], [0.95, 0.22], [0.44, 0.93], [0.9, 0.9], [0.06, 0.86], [0.62, 0.96], [0.34, 0.46]]

// "hello {{ first name }}" — the visitor can type their name; it's remembered.
function NameSlot() {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const update = (e) => {
    const v = e.target.value.replace(/[^\p{L} .'-]/gu, '').slice(0, 16)
    setName(v)
    try {
      localStorage.setItem(NAME_KEY, v)
    } catch {}
  }
  return (
    <label className="co-slot" data-cursor="type">
      {'{{ '}
      <input value={name} onChange={update} placeholder={hero.namePlaceholder} size={Math.max(name.length, hero.namePlaceholder.length)} spellCheck="false" autoComplete="given-name" aria-label="Your first name" />
      {' }}'}
    </label>
  )
}

export default function ColdOpen() {
  const ref = useRef(null)
  const goTo = useGoTo()
  // Stacked on phones: no hero string, so it never crosses the text or the photo.
  const stacked = useMedia('(max-width: 1023px)')
  useEffect(() => onReady(() => ref.current?.classList.add('in')), [])
  const tap = (e) => {
    if (e.target.closest('a, button, input, label')) return
    releaseBats(e.clientX, e.clientY, 12)
  }
  return (
    <section className="co" id="top" ref={ref} onClick={tap}>
      <div className="co-moon" aria-hidden="true" />
      <Scribbles spots={SPOTS} seed={7} />
      <RedString className="co-board cf-wrap" start="top 90%" end="bottom 40%" scope={stacked ? '.co-no-string' : ''}>
        <div className="co-copy">
          <Sticky tilt={-3} className="co-hello" fix="pin">
            <span className="co-hello-line">{hero.hello}</span> <NameSlot />,
            <br />
            {hero.stickyEnd}
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
            <Button href={`mailto:${site.email}`} variant="secondary" data-cursor="say hi">email me</Button>
            <Button href={site.resume} variant="ghost" target="_blank" rel="noreferrer" data-cursor="download">résumé (pdf)</Button>
          </div>
        </div>

        <div className="co-evidence">
          <Polaroid src={site.heroPhoto} alt={`${site.name} relaxing at a garden bench, in sunglasses and a black jacket`} caption={hero.polaroid} tilt={4} fix="pin" className="co-photo" imgClass="co-photo-img">
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
      <p className="co-hint cf-label" aria-hidden="true">psst: tap the board</p>
    </section>
  )
}
