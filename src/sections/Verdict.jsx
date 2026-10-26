import { useRef, useState } from 'react'
import { releaseBats } from '../components/Bats.jsx'
import Roll from '../components/Roll.jsx'
import { site, verdict } from '../content.js'
import { Button, Chapter, Stamp } from '../ds/index.jsx'
import { gsap, useGSAP, MQ } from '../lib/motion.js'
import useInView from '../lib/useInView.js'

export default function Verdict() {
  const [stampRef, inView] = useInView(0.5)
  const [copied, setCopied] = useState('')
  const foot = useRef(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied('copied!')
    } catch {
      const t = document.createElement('textarea')
      t.value = site.email
      document.body.appendChild(t)
      t.select()
      const ok = document.execCommand?.('copy')
      t.remove()
      setCopied(ok ? 'copied!' : 'press and hold to copy')
    }
    setTimeout(() => setCopied(''), 2200)
  }
  const signal = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    releaseBats(r.left + r.width / 2, r.top, 18)
  }

  // The giant footer word unfolds letter by letter as the page bottoms out.
  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        gsap.fromTo(
          '.unfold-l',
          { rotateX: -100, yPercent: -30, opacity: 0 },
          { rotateX: 0, yPercent: 0, opacity: 1, ease: 'power2.out', stagger: 0.05, scrollTrigger: { trigger: '.unfold', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } }
        )
      })
    },
    { scope: foot }
  )

  const links = [
    ['linkedin', site.linkedin],
    ['github', site.github],
    ['leetcode', site.leetcode],
    ['résumé (pdf)', site.resume],
  ]

  return (
    <>
      <section className="cf-section verdict" id="contact">
        <div className="verdict-signal" aria-hidden="true">
          <span>BG</span>
        </div>
        <div className="cf-wrap verdict-inner">
          <Chapter n="07" label={verdict.label} title={verdict.title} />
          <p className="verdict-lead cf-display">{verdict.lead}</p>
          <div className="verdict-stamp" ref={stampRef}>
            <Stamp on={inView} tone="board">{verdict.stamp}</Stamp>
          </div>
          <p className="verdict-sub">{verdict.sub}</p>
          <div className="verdict-mail">
            <a href={`mailto:${site.email}`} className="verdict-address cf-display" onClick={signal} data-cursor="say hi">
              {site.email}
            </a>
            <button className="verdict-copy" onClick={copy} aria-live="polite">
              {copied || 'copy email'}
            </button>
          </div>
          <div className="verdict-ctas">
            <Button href={`mailto:${site.email}`} onClick={signal}>light the signal</Button>
            <Button href={site.resume} variant="secondary" target="_blank" rel="noreferrer">download résumé</Button>
          </div>
          <ul className="verdict-links">
            {links.map(([l, h]) => (
              <li key={l}>
                <a href={h} target="_blank" rel="noreferrer">
                  <Roll>{l}</Roll> ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <footer className="footer" ref={foot}>
        <div className="cf-wrap footer-row cf-label">
          <span>© {new Date().getFullYear()} {site.name.toLowerCase()} · handmade with react, gsap and a lot of chai</span>
          <a href="/design-system.html">the casefile design system ↗</a>
          <a href="#top">back to the start ↑</a>
        </div>
        <div className="unfold" aria-hidden="true">
          <p className="unfold-word cf-display">
            {verdict.bigWord.split('').map((ch, i) => (
              <span className="unfold-l" key={i}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </p>
        </div>
      </footer>
    </>
  )
}
