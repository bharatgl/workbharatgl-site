import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// Mobile browsers resize the viewport when the URL bar shows/hides; don't re-layout pins on that.
ScrollTrigger.config({ ignoreMobileResize: true })

// The site's two easing curves (same feel as cubic-bezier(.22,1,.36,1) and a soft overshoot).
export const EASE = 'expo.out'
export const POP = 'back.out(1.7)'

export const MQ = {
  wide: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
  narrow: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  still: '(prefers-reduced-motion: reduce)',
}

export const reducedMotion = () => window.matchMedia(MQ.still).matches

// Fired once the intro loader has finished (or was skipped).
export const READY_EVENT = 'site:ready'
export function onReady(cb) {
  if (document.documentElement.dataset.ready === 'true') cb()
  else window.addEventListener(READY_EVENT, cb, { once: true })
}

/** Draws pen paths one after another; returns the tween so callers can scrub or delay it. */
export function drawStrokes(paths, vars = {}) {
  return gsap.to(paths, {
    strokeDashoffset: 0,
    duration: 1,
    ease: 'none',
    stagger: { each: 0.035 },
    ...vars,
  })
}

export { gsap, ScrollTrigger, useGSAP }
