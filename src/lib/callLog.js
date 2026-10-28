import { track } from './analytics.js'

// One id per tab visit, so a ring, the answer and the call's end can be tied together in the logs.
const SESSION = (() => {
  try {
    const k = 'cf-session'
    const v = sessionStorage.getItem(k) || Math.random().toString(36).slice(2, 12)
    sessionStorage.setItem(k, v)
    return v
  } catch {
    return Math.random().toString(36).slice(2, 12)
  }
})()

const device = () => (window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop')

/**
 * Logs a voice-call event to the server (Cloud Run → Cloud Logging) and to Google Analytics.
 * Uses sendBeacon so it still arrives when the visitor is leaving the page.
 */
export function logCall(event, extra = {}) {
  const { transcript, ...params } = extra
  track(`call_${event}`, params)
  const body = JSON.stringify({ event, session: SESSION, device: device(), page: location.pathname, ...extra })
  try {
    if (navigator.sendBeacon?.('/api/call-log', new Blob([body], { type: 'application/json' }))) return
  } catch {}
  fetch('/api/call-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}
