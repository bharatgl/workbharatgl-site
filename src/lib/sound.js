// Optional sound: a paper page-turn on section jumps and a quiet late-night ambience (a low drone with
// old-film crackle). Everything is synthesised with Web Audio (no files to load or license).
// Off by default; the nav toggle turns it on and the choice is remembered. Ambience ducks during voice calls.

const KEY = 'cf-sound'
const EVENT = 'cf:sound'
let ctx = null
let master = null
let ambient = null
let ducked = false

export const soundOn = () => {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function noiseBuffer(seconds) {
  const c = audio()
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** Soft paper page-turn: a swept, filtered noise swish. */
export function pageTurn() {
  if (!soundOn() || !audio()) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(0.5)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.9
  bp.frequency.setValueAtTime(900, t)
  bp.frequency.exponentialRampToValueAtTime(3800, t + 0.22)
  bp.frequency.exponentialRampToValueAtTime(1400, t + 0.42)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
  src.connect(bp).connect(g).connect(master)
  src.start(t)
  src.stop(t + 0.5)
}

/** A small glassy chime, a few notes from a pentatonic scale. */
export function chime() {
  if (!soundOn() || !audio()) return
  const t = ctx.currentTime
  const notes = [1046.5, 1174.7, 1318.5, 1568, 1760]
  for (let i = 0; i < 3; i++) {
    const f = notes[Math.floor(Math.random() * notes.length)]
    const at = t + i * 0.07
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.09, at + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9)
    o.connect(g).connect(master)
    o.start(at)
    o.stop(at + 1)
  }
}

/** Quiet ambience: a warm, slowly breathing drone plus the odd crackle, like an old film reel. */
function startAmbient() {
  if (ambient || !audio()) return
  const t = ctx.currentTime
  const bus = ctx.createGain()
  bus.gain.setValueAtTime(0.0001, t)
  bus.gain.exponentialRampToValueAtTime(ducked ? 0.0001 : 0.12, t + 2.5)
  bus.connect(master)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 520
  lp.connect(bus)
  const oscs = [110, 164.8, 220.5].map((f, i) => {
    const o = ctx.createOscillator()
    o.type = i === 1 ? 'triangle' : 'sine'
    o.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = i === 0 ? 0.5 : 0.22
    const lfo = ctx.createOscillator() // slow breathing
    lfo.frequency.value = 0.05 + i * 0.03
    const depth = ctx.createGain()
    depth.gain.value = 0.15
    lfo.connect(depth).connect(g.gain)
    o.connect(g).connect(lp)
    o.start()
    lfo.start()
    return [o, lfo]
  })
  const crackle = setInterval(() => {
    if (Math.random() > 0.45) return
    const at = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer(0.03)
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.05 + Math.random() * 0.06, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03)
    src.connect(hp).connect(g).connect(bus)
    src.start(at)
  }, 420)
  ambient = { bus, oscs, crackle }
}

function stopAmbient() {
  if (!ambient) return
  const { bus, oscs, crackle } = ambient
  ambient = null
  clearInterval(crackle)
  const t = ctx.currentTime
  bus.gain.cancelScheduledValues(t)
  bus.gain.setValueAtTime(bus.gain.value, t)
  bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.8)
  setTimeout(() => oscs.flat().forEach((o) => o.stop()), 900)
}

/** Turn sound on or off (call from a click so the browser allows audio). */
export function setSound(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {}
  if (on) {
    startAmbient()
    pageTurn()
  } else stopAmbient()
  window.dispatchEvent(new CustomEvent(EVENT, { detail: on }))
}

/** Voice calls duck the ambience so it never talks over the call. */
export function duck(on) {
  ducked = on
  if (!ambient) return
  const t = ctx.currentTime
  ambient.bus.gain.cancelScheduledValues(t)
  ambient.bus.gain.setValueAtTime(Math.max(ambient.bus.gain.value, 0.0001), t)
  ambient.bus.gain.exponentialRampToValueAtTime(on ? 0.0001 : 0.12, t + 0.6)
}

/** Resume the ambience on the first click of a visit if sound was left on (browsers need a gesture). */
export function resumeOnGesture() {
  if (!soundOn()) return
  const go = () => startAmbient()
  window.addEventListener('pointerdown', go, { once: true })
  return () => window.removeEventListener('pointerdown', go)
}

export const SOUND_EVENT = EVENT
