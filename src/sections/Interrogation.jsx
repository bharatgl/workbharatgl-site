import { interrogation } from '../content.js'
import { Chapter, Paper, Reveal } from '../ds/index.jsx'
import { useState } from 'react'
import { jokes } from '../content.js'
import { track } from '../lib/analytics.js'

/** "Tell me a joke": a detective-and-developer one-liner, never the same twice in a row. */
function JokeLine() {
  const [i, setI] = useState(-1)
  const next = () => {
    let n = Math.floor(Math.random() * jokes.length)
    if (n === i) n = (n + 1) % jokes.length
    setI(n)
    track('joke_told', { joke: n })
  }
  return (
    <div className="transcript-joke">
      <button type="button" className="cf-btn cf-btn--secondary" onClick={next}>
        <span>{i < 0 ? 'Det.: “Tell me a joke.”' : 'Another one'}</span>
      </button>
      {i >= 0 && (
        <p className="transcript-joke-line" aria-live="polite">
          <span className="who cf-label">B.G.</span> {jokes[i]}
        </p>
      )}
    </div>
  )
}

/** The FAQ as a typed interrogation transcript. Everything is visible, so it scans in seconds. */
export default function Interrogation() {
  return (
    <section className="cf-section interro" id="faq">
      <div className="interro-lamp" aria-hidden="true">
        <span className="interro-cord" />
        <span className="interro-shade" />
        <span className="interro-cone" />
      </div>
      <div className="cf-wrap">
        <Chapter n="06" label={interrogation.label} title={interrogation.title} sub={interrogation.sub} />
        <Paper tone="white" tilt={-0.6} fix="tapes" className="transcript">
          <div className="transcript-head cf-label">
            <span>Transcript · interview room 2</span>
            <span>Present: you (Det.), B. Goyal</span>
          </div>
          <dl>
            {interrogation.qa.map((x, i) => (
              <Reveal key={x.q} className="transcript-row" delay={i % 3}>
                <dt>
                  <span className="who cf-label">Det.</span>
                  <span>{x.q}</span>
                </dt>
                <dd>
                  <span className="who cf-label">B.G.</span>
                  <span>{x.a}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <JokeLine />
          <p className="transcript-end cf-label">— end of transcript —</p>
        </Paper>
      </div>
    </section>
  )
}
