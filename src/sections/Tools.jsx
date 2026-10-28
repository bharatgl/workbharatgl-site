import { tools } from '../content.js'
import { Chapter, EvidenceTag, Paper, Reveal } from '../ds/index.jsx'
import Clue from '../components/Clue.jsx'

const TILTS = [-1.5, 1.2, -0.8, 1.6]

export default function Tools() {
  return (
    <section className="cf-section tools" id="skills">
      <Clue id="note" />
      <div className="cf-wrap">
        <Chapter n="04" label={tools.label} title={tools.title} sub={tools.sub} />
        <div className="tools-grid">
          {tools.groups.map((g, i) => (
            <Reveal key={g.name} delay={i} from={TILTS[i] * 2}>
              <Paper tone={i % 2 ? 'news' : 'paper'} tilt={TILTS[i]} fix="tape" torn={{ seed: 30 + i, edges: 'b' }} className="tools-card">
                <h3 className="tools-name">
                  <span className="cf-label">bag {String(i + 1).padStart(2, '0')}</span>
                  <span className="cf-display">{g.name}</span>
                </h3>
                <ul>
                  {g.items.map((s, j) => (
                    <li key={s} style={{ '--j': j }}>
                      <EvidenceTag tone={j % 3 === 0 ? 'yellow' : 'manila'}>{s}</EvidenceTag>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
