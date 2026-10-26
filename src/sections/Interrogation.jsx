import { interrogation } from '../content.js'
import { Chapter, Paper, Reveal } from '../ds/index.jsx'

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
            <span>transcript · interview room 2</span>
            <span>present: you (det.), b. goyal</span>
          </div>
          <dl>
            {interrogation.qa.map((x, i) => (
              <Reveal key={x.q} className="transcript-row" delay={i % 3}>
                <dt>
                  <span className="who cf-label">det.</span>
                  <span>{x.q}</span>
                </dt>
                <dd>
                  <span className="who cf-label">b.g.</span>
                  <span>{x.a}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
          <p className="transcript-end cf-label">— end of transcript —</p>
        </Paper>
      </div>
    </section>
  )
}
