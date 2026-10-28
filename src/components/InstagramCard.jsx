import { useEffect, useRef, useState } from 'react'
import { Button, Paper } from '../ds/index.jsx'

const SCRIPT_SRC = 'https://www.instagram.com/embed.js'
const TIMEOUT_MS = 8000
const POST_RE = /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?/i

/** "@Bharat.Codes", "instagram.com/bharat.codes/" or a full URL → "bharat.codes" (or '' if invalid). */
export function cleanHandle(raw = '') {
  const h = String(raw)
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? h : ''
}

/** Keeps only real post/reel URLs, normalised and de-duplicated. */
export function cleanPosts(list = []) {
  const seen = new Set()
  return list
    .map((u) => String(u).trim().match(POST_RE)?.[0])
    .filter(Boolean)
    .map((u) => (u.endsWith('/') ? u : `${u}/`).replace('://instagram', '://www.instagram'))
    .filter((u) => !seen.has(u) && seen.add(u))
    .slice(0, 6)
}

// Load Instagram's embed script once for the whole page.
let scriptPromise
function loadScript() {
  if (window.instgrm?.Embeds) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.onload = () => (window.instgrm?.Embeds ? resolve() : reject(new Error('No embed api')))
      s.onerror = () => reject(new Error('blocked'))
      document.body.appendChild(s)
    }).catch((err) => {
      scriptPromise = null // allow a retry later
      throw err
    })
  }
  return scriptPromise
}

const IgIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="ig-icon">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1.1" className="ig-dot" />
  </svg>
)

/**
 * One Instagram account. Profile link always works. Embedded posts load by
 * themselves as the card scrolls near the screen (so the first page load stays
 * fast), and fall back to a link if the script is blocked, offline, slow, or
 * the posts are private/removed.
 */
export default function InstagramCard({ label, handle: rawHandle, blurb, posts: rawPosts = [], demo = false, tilt = 0 }) {
  const handle = cleanHandle(rawHandle)
  const posts = cleanPosts(rawPosts)
  const [state, setState] = useState('idle') // idle → loading → ready | failed
  const [slide, setSlide] = useState(0)
  const box = useRef(null)
  const rail = useRef(null)

  // Carousel: one post per view. Swipe works natively (scroll-snap); arrows and dots jump.
  const goTo = (i) => {
    const el = rail.current
    if (!el) return
    const next = (i + posts.length) % posts.length
    el.scrollTo({ left: next * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setSlide(next)
  }
  // Fit the carousel to the post on screen (embeds have different heights and resize as they load).
  useEffect(() => {
    const el = rail.current
    if (!el || state === 'idle') return
    const fit = () => {
      const current = el.children[slide]
      if (current) el.style.height = `${current.scrollHeight}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ;[...el.children].forEach((c) => ro.observe(c))
    return () => ro.disconnect()
  }, [slide, state])
  // Start loading once the card is within ~600px of the screen.
  const card = useRef(null)
  useEffect(() => {
    if (!posts.length || state !== 'idle') return
    const el = card.current
    if (!el || !('IntersectionObserver' in window)) return setState('loading')
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setState('loading')
        io.disconnect()
      }
    }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [posts.length, state])

  const onRailScroll = (e) => {
    const el = e.currentTarget
    setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }
  const onRailKey = (e) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), goTo(slide + 1))
    if (e.key === 'ArrowLeft') (e.preventDefault(), goTo(slide - 1))
  }
  const profile = handle ? `https://www.instagram.com/${handle}/` : null

  useEffect(() => {
    if (state !== 'loading') return
    if (!navigator.onLine) return setState('failed')
    let done = false
    const timer = setTimeout(() => !done && setState('failed'), TIMEOUT_MS)
    loadScript()
      .then(() => {
        window.instgrm.Embeds.process()
        // The script swaps each blockquote for an iframe; wait until at least one appears.
        const check = setInterval(() => {
          if (box.current?.querySelector('iframe')) {
            done = true
            clearInterval(check)
            clearTimeout(timer)
            setState('ready')
          }
        }, 250)
        setTimeout(() => clearInterval(check), TIMEOUT_MS)
      })
      .catch(() => {
        done = true
        clearTimeout(timer)
        setState('failed')
      })
    return () => clearTimeout(timer)
  }, [state])

  return (
    <Paper tone="paper" fix="tapes" tilt={tilt} className={`ig ig--${label.toLowerCase().replace(/\W+/g, '-')}`}>
      <span ref={card} className="ig-anchor" aria-hidden="true" />
      <div className="ig-head">
        <span className="ig-badge">
          <IgIcon />
        </span>
        <div>
          <p className="ig-label">{label}</p>
          {handle ? (
            <a className="ig-handle" href={profile} target="_blank" rel="noreferrer" data-cursor="open">
              @{handle}
            </a>
          ) : (
            <p className="ig-handle ig-handle--missing">{demo ? 'Add your handle in content.js' : ''}</p>
          )}
        </div>
      </div>
      <p className="ig-blurb">{blurb}</p>

      {posts.length > 0 && state !== 'failed' && (
        <div className={`ig-posts is-${state}`} ref={box}>
          {state === 'idle' ? (
            <div className="ig-developing" aria-hidden="true">
              <span className="cf-label">Developing the photos…</span>
            </div>
          ) : (
            <>
              {state === 'loading' && (
                <div className="ig-developing ig-developing--overlay" aria-live="polite">
                  <span className="cf-label">Developing the photos…</span>
                </div>
              )}
              <div
                className="ig-rail"
                ref={rail}
                onScroll={onRailScroll}
                onKeyDown={onRailKey}
                tabIndex={0}
                role="region"
                aria-roledescription="carousel"
                aria-label={`${label} posts, ${slide + 1} of ${posts.length}`}
              >
                {posts.map((url, i) => (
                  <div className="ig-slide" key={url} aria-hidden={i !== slide}>
                    <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14">
                      <a href={url} target="_blank" rel="noreferrer">
                        View this post on Instagram
                      </a>
                    </blockquote>
                  </div>
                ))}
              </div>
              {posts.length > 1 && (
                <div className="ig-nav">
                  <button className="ig-arrow" onClick={() => goTo(slide - 1)} aria-label="Previous post" data-cursor="prev">
                    ←
                  </button>
                  <div className="ig-dots" role="tablist" aria-label="Choose a post">
                    {posts.map((url, i) => (
                      <button
                        key={url}
                        role="tab"
                        aria-selected={i === slide}
                        aria-label={`Post ${i + 1}`}
                        className={i === slide ? 'is-on' : ''}
                        onClick={() => goTo(i)}
                      />
                    ))}
                    <span className="ig-count cf-label" aria-hidden="true">
                      {slide + 1} / {posts.length}
                    </span>
                  </div>
                  <button className="ig-arrow" onClick={() => goTo(slide + 1)} aria-label="Next post" data-cursor="next">
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {state === 'failed' && (
        <div className="ig-fallback" role="status">
          <p>The photos didn’t come through. An ad-blocker, privacy setting or a slow connection can block Instagram.</p>
          <div className="ig-fallback-actions">
            {profile && (
              <Button href={profile} target="_blank" rel="noreferrer">
                Open on Instagram
              </Button>
            )}
            <Button as="button" variant="ghost" onClick={() => setState('loading')}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {handle && (state === 'idle' || state === 'ready') && (
        <div className="ig-foot">
          <Button href={profile} variant={posts.length ? 'ghost' : 'primary'} target="_blank" rel="noreferrer">
            follow @{handle} ↗
          </Button>
        </div>
      )}
    </Paper>
  )
}
