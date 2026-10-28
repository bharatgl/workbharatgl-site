import { about, site } from '../content.js'
import { Chapter, HandNote, Highlight, Paper, Reveal, Stamp, Typewriter } from '../ds/index.jsx'
import useInView from '../lib/useInView.js'
import Clue from '../components/Clue.jsx'

const HEIGHTS = [190, 180, 170, 160, 150, 140]

export default function Suspect() {
  const [ref, inView] = useInView(0.35)
  return (
    <section className="cf-section suspect" id="about">
      <Clue id="coffee" />
      <div className="cf-wrap">
        <Chapter n="01" label={about.label} title={about.title} />
        <div className="suspect-grid">
          <Reveal from={-4}>
            <figure className="mug" data-cursor="identify">
              <div className="mug-chart" aria-hidden="true">
                {HEIGHTS.map((h) => (
                  <span key={h}>
                    <b>{h}</b>
                  </span>
                ))}
              </div>
              <img src={site.photo} alt={`${site.name}`} loading="lazy" />
              <figcaption className="mug-board">
                <span className="cf-display">{site.name}</span>
                <span className="cf-label">Frontend & AI · BLR · 2026</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="suspect-copy" ref={ref}>
            <Reveal as="p" className="suspect-lead cf-display">
              {about.lead} <Highlight>{about.leadMark}</Highlight>
            </Reveal>
            {about.body.map((p, i) => (
              <Reveal as="p" className="suspect-p" key={i} delay={i + 1}>
                {p}
              </Reveal>
            ))}
            <Reveal delay={2}>
              <Paper lined tilt={-1.2} fix="tape" className="suspect-file">
                <div className="suspect-file-head">
                  <span className="cf-label">Subject file</span>
                  {site.openToWork && <Stamp on={inView}>{about.stamp}</Stamp>}
                </div>
                <dl>
                  {about.facts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="cf-label">{k}:</dt>
                      <dd>
                        <Typewriter text={v} speed={20} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="suspect-note">
                  <HandNote text={about.note} maxWidth={8600} weight={50} seed={21} />
                </div>
              </Paper>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
