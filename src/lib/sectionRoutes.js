// Clean URLs for the one-page board: /about, /experience, /projects, /skills, /contact (no #hashes).
// Every path renders the same page; the path just says which section to scroll to.
import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { nav, site } from '../content.js'
import { onReady } from './motion.js'

export const SECTIONS = nav.map((n) => n.href.slice(1))
export const pathFor = (id) => (id && id !== 'top' ? `/${id}` : '/')
const idFor = (pathname) => pathname.replace(/^\/+|\/+$/g, '') || 'top'
const titleFor = (id) => {
  const label = nav.find((n) => n.href === `/${id}`)?.label
  return label ? `${label} · ${site.name}` : `${site.name} · ${site.role}`
}

let initialScrollDone = false // until the first-load scroll lands, scrolling mustn't rewrite the URL

/**
 * Click handler for section links. Links keep real hrefs (crawlable, open in a new tab),
 * but a plain click routes in-app and smooth-scrolls instead of reloading.
 */
export function useGoTo() {
  const navigate = useNavigate()
  return useCallback(
    (id, after) => (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      after?.()
      navigate(pathFor(id), { state: { scroll: true } })
    },
    [navigate]
  )
}

/** Scrolls to the section in the URL: on first load (once the intro is done), on clicks, and on back/forward. */
export function useSectionScroll() {
  const { pathname, state, key } = useLocation()
  const navigate = useNavigate()
  const first = useRef(true)

  useEffect(() => {
    const id = idFor(pathname)
    if (id !== 'top' && !SECTIONS.includes(id)) return navigate('/', { replace: true }) // unknown path
    document.title = titleFor(id)
    const isFirst = first.current
    first.current = false
    if (!isFirst && !state?.scroll) return // the URL was updated by scrolling; don't jump
    const go = () => {
      const behavior = isFirst ? 'auto' : 'smooth'
      if (id === 'top') window.scrollTo({ top: 0, behavior })
      else document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
      initialScrollDone = true
    }
    if (!isFirst) go()
    else if (id === 'top') initialScrollDone = true
    else onReady(() => requestAnimationFrame(go)) // wait for the intro so layout (and pinned sections) are final
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

/** Keeps the URL in step with the section on screen, without adding history entries. */
export function useUrlFollowsScroll(activeId) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!initialScrollDone || !activeId) return
    const path = pathFor(activeId)
    if (path !== pathname) {
      navigate(path, { replace: true })
      document.title = titleFor(activeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])
}
