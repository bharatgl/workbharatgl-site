// Google Analytics 4. On production builds it uses the site's measurement ID (public by design; VITE_GA_ID
// can override it); local dev sends nothing, so testing never pollutes the real numbers.
// track(name, params) is safe to call anywhere: without an ID it does nothing.
// Besides GA's own page views, the site sends: section_view, scroll_depth, exit_section (where people
// leave), resume_click, email_click and the voice-call funnel (call_ring, call_answer, call_decline, ...).

const ID = import.meta.env.VITE_GA_ID || (import.meta.env.PROD ? 'G-9VCS76WCCX' : '')
let started = false

export function initAnalytics() {
  if (!ID || started || typeof window === 'undefined') return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // no ad personalisation or Google signals: this is site analytics only
  window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`
  document.head.appendChild(s)
  watchScrollDepth()
  watchExit()
  // résumé and email clicks, wherever the link is on the page
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest?.('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href.endsWith('.pdf')) track('resume_click', { where: a.closest('section, header, footer')?.id || 'nav' })
      else if (href.startsWith('mailto:')) track('email_click', { where: a.closest('section, header, footer')?.id || 'nav' })
    },
    true
  )
}

export function track(name, params = {}) {
  if (!ID || !window.gtag) return
  window.gtag('event', name, params)
}

let lastSection = 'top'
const seen = new Set()

/** Called when a section becomes the one on screen. */
export function sectionSeen(id) {
  if (!id) return
  lastSection = id
  if (seen.has(id)) return
  seen.add(id)
  track('section_view', { section: id })
}

function watchScrollDepth() {
  const marks = [25, 50, 75, 100]
  const hit = new Set()
  const on = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const pct = max > 0 ? (window.scrollY / max) * 100 : 100
    for (const m of marks) {
      if (pct >= m - 1 && !hit.has(m)) {
        hit.add(m)
        track('scroll_depth', { percent: m })
      }
    }
    if (hit.size === marks.length) window.removeEventListener('scroll', on)
  }
  window.addEventListener('scroll', on, { passive: true })
}

// Where people leave: when the tab is hidden or closed, report the last section they were on.
function watchExit() {
  let sent = false
  const send = () => {
    if (sent || document.visibilityState !== 'hidden') return
    sent = true
    track('exit_section', { section: lastSection, sections_seen: seen.size, transport_type: 'beacon' })
  }
  document.addEventListener('visibilitychange', send)
  window.addEventListener('pagehide', send)
}
