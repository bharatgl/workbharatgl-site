import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../ds/tokens.css'
import '../ds/components.css'
import './ds-page.css'
import RedString from '../components/RedString.jsx'
import { Button, Chapter, Circled, EvidenceTag, HandNote, Highlight, Paper, Polaroid, Reveal, Stamp, Sticky, Typewriter } from '../ds/index.jsx'

const COLORS = [
  ['The board', [['--cf-board', 'page background'], ['--cf-board-2', 'raised board'], ['--cf-board-3', 'cork shadow'], ['--cf-night', 'night sky']]],
  ['Paper', [['--cf-paper', 'index cards'], ['--cf-news', 'newsprint'], ['--cf-manila', 'folders, tags'], ['--cf-white', 'polaroids']]],
  ['Ink', [['--cf-text', 'text on board · 15.8:1'], ['--cf-text-2', 'secondary · 9.4:1'], ['--cf-text-3', 'meta · 5.8:1'], ['--cf-ink', 'text on paper · 15.4:1'], ['--cf-ink-2', 'secondary on paper · 6.4:1']]],
  ['Signal', [['--cf-red', 'string, pins'], ['--cf-red-ink', 'red on paper · 5.1:1'], ['--cf-yellow', 'sticky, highlight'], ['--cf-blue', 'ballpoint notes']]],
]
const TYPE = [
  ['--cf-display · Anton', 'cf-display', 'MEET BHARAT.'],
  ['--cf-body · Inter', '', 'i make slow things fast and messy things simple.'],
  ['--cf-type · Courier Prime', 'cf-type', 'occupation: SDE II, Frontend'],
  ['--cf-marker · Permanent Marker', 'cf-marker', 'hello, detective.'],
  ['--cf-script · Caveat', 'ds-script', 'currently here'],
]
const val = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim()

function Block({ id, n, label, title, sub, children }) {
  return (
    <section className="ds-block" id={id}>
      <Chapter n={n} label={label} title={title} sub={sub} />
      {children}
    </section>
  )
}
const Code = ({ children }) => (
  <pre className="ds-code">
    <code>{children}</code>
  </pre>
)

function Page() {
  const [k, setK] = useState(0)
  return (
    <>
      <header className="ds-top">
        <a href="/" className="ds-back">← back to the case</a>
        <div className="ds-hero">
          <Sticky tilt={-4} className="ds-hero-sticky">design system · v3.0</Sticky>
          <h1 className="cf-display ds-title">CASEFILE</h1>
          <p className="cf-muted ds-lede">
            the design system behind bharat goyal’s portfolio: a detective’s evidence board at night. dark cork, cream paper,
            red string, yellow sticky notes. handmade on purpose, readable by design.
          </p>
        </div>
        <nav className="ds-toc" aria-label="Contents">
          {['principles', 'color', 'type', 'objects', 'motion'].map((s, i) => (
            <a key={s} href={`#${s}`}>
              0{i + 1} {s}
            </a>
          ))}
        </nav>
      </header>

      <main className="ds-main">
        <Block id="principles" n="01" label="the rules" title="Principles">
          <div className="ds-grid ds-grid--3">
            {[
              ['tell a story', 'every section is a chapter of one case. story lives in the small labels; headings stay plain so recruiters can scan.'],
              ['handmade, not messy', 'tilts stay under 3°, paper sits on a strict grid underneath. tape, pins and string add life, never noise.'],
              ['ink on paper', 'dark text on paper, light text on the board. every pairing passes WCAG AA; long text is always Inter.'],
              ['one red thread', 'red means connection or verdict: string, pins, stamps. yellow means “look here”: notes, highlights, the main action.'],
              ['motion feels physical', 'things are pinned, stamped, written and unfolded. every effect works on touch and has a reduced-motion fallback.'],
              ['phone first', 'layouts start at 360px. tap targets are at least 44px. nothing scrolls sideways.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i % 3}>
                <Paper tilt={[-1.2, 0.8, -0.6][i % 3]} fix={i % 2 ? 'pin' : 'tape'} className="ds-card">
                  <h3 className="cf-display ds-h3">{t}</h3>
                  <p>{d}</p>
                </Paper>
              </Reveal>
            ))}
          </div>
        </Block>

        <Block id="color" n="02" label="tokens" title="Color" sub="contrast ratios measured against the surface each color sits on.">
          {COLORS.map(([g, list]) => (
            <div className="ds-group" key={g}>
              <p className="cf-label ds-group-label">{g}</p>
              <div className="ds-grid ds-grid--5">
                {list.map(([t, note]) => (
                  <div className="ds-swatch" key={t}>
                    <span className="ds-chip" style={{ background: `var(${t})` }} />
                    <code>{t}</code>
                    <span className="ds-hex">{val(t)}</span>
                    <span className="ds-note">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Block>

        <Block id="type" n="03" label="tokens" title="Typography" sub="anton for headlines, inter for anything you read; the rest is only for short notes.">
          <div className="ds-scale">
            {TYPE.map(([t, c, s]) => (
              <div className="ds-scale-row" key={t}>
                <code>{t}</code>
                <span className={c}>{s}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block id="objects" n="04" label="react · src/ds/index.jsx" title="Objects on the board">
          <div className="ds-grid ds-grid--2">
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Paper</h3>
              <div className="ds-row ds-papers">
                <Paper fix="pin" tilt={-2} className="ds-mini">paper · pin</Paper>
                <Paper tone="news" fix="tape" tilt={1.5} className="ds-mini" torn={{ seed: 4, edges: 'tblr' }}>
                  news · torn
                </Paper>
                <Paper tone="manila" fix="tapes" tilt={-1} className="ds-mini">manila · tapes</Paper>
                <Paper lined tilt={1} className="ds-mini ds-lined">lined card</Paper>
              </div>
              <Code>{`<Paper tone="news" fix="tape" tilt={1.5} torn={{ seed: 4 }}>…</Paper>`}</Code>
            </div>
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Polaroid + sticky</h3>
              <div className="ds-row">
                <Polaroid src="/me.png" alt="Bharat" caption="the suspect" tilt={-3} className="ds-pol" />
                <Sticky tilt={3} className="ds-sticky">hello, detective.</Sticky>
              </div>
              <Code>{`<Polaroid src="/me.png" caption="the suspect" />
<Sticky>hello, detective.</Sticky>`}</Code>
            </div>
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Button</h3>
              <div className="ds-row">
                <Button href="#objects">open the case</Button>
                <Button href="#objects" variant="secondary">email me</Button>
                <Button href="#objects" variant="ghost">résumé (pdf)</Button>
              </div>
              <Code>{`<Button>open the case</Button>
<Button variant="secondary">email me</Button>`}</Code>
            </div>
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Evidence tag + stamp</h3>
              <div className="ds-row">
                <EvidenceTag>React</EvidenceTag>
                <EvidenceTag tone="yellow">oct 2025 – now</EvidenceTag>
                <EvidenceTag tone="paper">chapter 01 · the suspect</EvidenceTag>
              </div>
              <div className="ds-row ds-stamps">
                <Stamp key={`a${k}`} tone="board">hire him</Stamp>
                <Stamp key={`b${k}`} tone="yellow">open</Stamp>
              </div>
              <Button as="button" variant="ghost" onClick={() => setK((v) => v + 1)}>stamp again</Button>
            </div>
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Marker</h3>
              <p className="ds-big">
                <Circled key={`c${k}`}>
                  <strong className="cf-display">35%</strong>
                </Circled>{' '}
                faster, and <Highlight key={`h${k}`}>highlighted</Highlight> for you.
              </p>
              <Code>{`<Circled><strong>35%</strong></Circled>  <Highlight>…</Highlight>`}</Code>
            </div>
            <div className="ds-comp">
              <h3 className="cf-display ds-h3">Handwriting + typewriter</h3>
              <HandNote key={`n${k}`} text="this one ships." maxWidth={6000} weight={70} className="ds-hand" />
              <p className="ds-tw">
                <Typewriter key={`t${k}`} text="occupation: SDE II, Frontend" />
              </p>
              <Code>{`<HandNote text="this one ships." />  <Typewriter text="…" />`}</Code>
            </div>
          </div>
        </Block>

        <Block id="motion" n="05" label="tokens" title="Motion" sub="pinned, stamped, written, unfolded. durations: 140 / 260 / 520 / 900 ms.">
          <RedString className="ds-string" sag={0.15} start="top 85%" end="bottom 50%">
            {['the problem', 'the move', 'the result'].map((t, i) => (
              <Paper key={t} fix="pin" tilt={[-2, 1.5, -1][i]} className="ds-node">
                <span className="cf-label">step {i + 1}</span>
                <span className="cf-display">{t}</span>
              </Paper>
            ))}
          </RedString>
          <Code>{`<RedString>{/* any children with fix="pin" get tied together as you scroll */}</RedString>`}</Code>
        </Block>
      </main>
      <footer className="ds-foot cf-label">
        <span>casefile v3.0 · tokens: src/ds/tokens.css · objects: src/ds/index.jsx</span>
        <a href="/">back to the case ↗</a>
      </footer>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
)
