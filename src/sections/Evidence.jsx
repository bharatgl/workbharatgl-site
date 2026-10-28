import RedString from '../components/RedString.jsx'
import { evidence } from '../content.js'
import { Chapter, Circled, EvidenceTag, Paper, Reveal } from '../ds/index.jsx'
import Clue from '../components/Clue.jsx'

const LOOK = [
  { tone: 'paper', tilt: -2.2 },
  { tone: 'white', tilt: 1.8 },
  { tone: 'news', tilt: -1 },
  { tone: 'manila', tilt: 2.4 },
  { tone: 'paper', tilt: -1.6 },
  { tone: 'news', tilt: 1.2 },
]

function Exhibit({ c, i }) {
  const look = LOOK[i % LOOK.length]
  const Title = c.link ? 'a' : 'span'
  return (
    <Reveal className={`ex-wrap ex-wrap--${i}`} from={look.tilt * 3} delay={i % 2}>
      <Paper as="article" tone={look.tone} tilt={look.tilt} fix="pin" lift className="ex" data-cursor={c.link ? 'open it' : 'inspect'}>
        <div className="ex-head">
          <span className="ex-no cf-label">exhibit {c.id}</span>
          <span className="ex-org cf-label">{c.org}</span>
        </div>
        <h3 className="ex-title cf-display">
          <Title href={c.link} target={c.link ? '_blank' : undefined} rel={c.link ? 'noreferrer' : undefined}>
            {c.title}
            {c.link && ' ↗'}
          </Title>
        </h3>
        <dl className="ex-notes">
          <div>
            <dt className="cf-label">What was broken</dt>
            <dd>{c.problem}</dd>
          </div>
          <div>
            <dt className="cf-label">What I did</dt>
            <dd>{c.did}</dd>
          </div>
        </dl>
        <div className="ex-result">
          <Circled seed={i + 3} color="var(--cf-red-ink)">
            <strong className="ex-num cf-display">{c.result}</strong>
          </Circled>
          <span className="ex-result-label">{c.resultLabel}</span>
        </div>
        <div className="ex-stack">
          {c.stack.map((s) => (
            <EvidenceTag key={s} tone={look.tone === 'manila' ? 'paper' : 'manila'}>
              {s}
            </EvidenceTag>
          ))}
        </div>
      </Paper>
    </Reveal>
  )
}

export default function Evidence() {
  return (
    <section className="cf-section evidence" id="projects">
      <Clue id="print" />
      <div className="cf-wrap">
        <Chapter n="03" label={evidence.label} title={evidence.title} sub={evidence.sub} />
        <RedString className="ex-board" sag={0.12} start="top 80%" end="bottom 60%">
          {evidence.cases.map((c, i) => (
            <Exhibit c={c} i={i} key={c.id} />
          ))}
        </RedString>
      </div>
    </section>
  )
}
