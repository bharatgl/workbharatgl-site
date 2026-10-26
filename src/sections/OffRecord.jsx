import InstagramCard, { cleanHandle } from '../components/InstagramCard.jsx'
import { instagram, offRecord } from '../content.js'
import { Chapter, Reveal } from '../ds/index.jsx'

/** Instagram accounts. Only accounts with a valid handle show; with none, the section hides (dev shows a reminder). */
export default function OffRecord() {
  const live = instagram.filter((a) => cleanHandle(a.handle))
  const demo = import.meta.env.DEV && live.length === 0
  const accounts = demo ? instagram : live
  if (!accounts.length) return null
  return (
    <section className="cf-section offrec" id="social">
      <div className="cf-wrap">
        <Chapter n="05" label={offRecord.label} title={offRecord.title} sub={offRecord.sub} />
        <div className={`offrec-grid ${accounts.length === 1 ? 'is-single' : ''}`}>
          {accounts.map(({ key: id, ...account }, i) => (
            <Reveal key={id} delay={i} from={i ? 3 : -3}>
              <InstagramCard {...account} demo={demo} tilt={i ? 1.2 : -1.2} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
