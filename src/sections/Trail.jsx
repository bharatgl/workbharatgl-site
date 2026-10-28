import RedString from '../components/RedString.jsx'
import { trail } from '../content.js'
import { Chapter, EvidenceTag, Paper, Reveal } from '../ds/index.jsx'
import Clue from '../components/Clue.jsx'

const TILTS = [-1.6, 1.4, -0.8]

export default function Trail() {
  return (
    <section className="cf-section trail" id="experience">
      <Clue id="ticket" />
      <div className="cf-wrap">
        <Chapter n="02" label={trail.label} title={trail.title} sub={trail.sub} />
        <RedString className="trail-list" sag={0.08}>
          {trail.jobs.map((j, i) => (
            <Reveal key={j.role + j.when} className={`trail-item ${i % 2 ? 'is-right' : ''}`} from={i % 2 ? 3 : -3}>
              <Paper lined fix="pin" tilt={TILTS[i % 3]} lift className="trail-card">
                <div className="trail-top">
                  <EvidenceTag tone={i === 0 ? 'yellow' : 'manila'}>{j.when}</EvidenceTag>
                  <span className="trail-note">{j.note}</span>
                </div>
                <h3 className="trail-role cf-display">{j.role}</h3>
                <p className="trail-co">
                  {j.company} <span>· {j.where}</span>
                </p>
                <ul>
                  {j.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Paper>
            </Reveal>
          ))}
        </RedString>
      </div>
    </section>
  )
}
