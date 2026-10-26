import { useCallback, useEffect, useRef, useState } from 'react'

// Live voice conversation with Inspector Byte over Gemini Live, same architecture as ForgeFit's live coach:
// a one-use token from /api/live-token, then a raw WebSocket straight to Gemini (speech in, speech out),
// a mic AudioWorklet at 16 kHz, 24 kHz playback, barge-in, and live transcripts of both sides.
// The API key stays on the server.

const ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained'
const IN_RATE = 16000 // Gemini wants 16 kHz 16-bit mono PCM in
const OUT_RATE = 24000 // and sends 24 kHz back
const IDLE_MS = 60_000 // hang up after a quiet minute (nobody talking), so an open tab doesn't run up the bill
const GOODBYE_AT = 25 // seconds before the time limit when he starts saying goodbye
const GOODBYE_WAIT_MS = 15_000 // never wait longer than this for his goodbye to finish
// what he's asked to say when a call has to end; he says it in his own words, then the call hangs up
const GOODBYES = {
  time: '[the call is about to hit its time limit] In one or two short, warm lines, tell the visitor it’s time for you to go, and that they can call you again any time to keep talking. Don’t ask a question. Then call end_call.',
  idle: '[the visitor has gone quiet for a while] In one short, warm line, say it seems they’ve stepped away, so you’ll hang up for now, and they can call you again any time. Don’t ask a question. Then call end_call.',
  dropped: '[the connection is about to end] In one short line, say you have to drop off now and they can call you again any time. Don’t ask a question. Then call end_call.',
}
const HISTORY_TURNS = 16
// A finished turn of his that signs off (and isn't a question) ends the call, even if he forgot end_call.
const SIGN_OFF = /\b(bye|goodbye|take care|talk soon|see you|catch you later|have a good (one|day|evening)|signing off)\b/i
const ECHO_TAIL = 0.6 // seconds after his audio stops during which the mic may still hold his echo
// He hangs up himself (like ForgeFit's agent tools): one goodbye, then this tool ends the call.
const END_CALL_TOOL = {
  functionDeclarations: [
    {
      name: 'end_call',
      description: 'Hang up this call. Use it right after you have said one short goodbye: when the visitor is done (they say bye, thanks that’s all, gotta go) or when you were asked to wrap up the call.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  ],
} // how much of the earlier conversation a new call remembers

// Mic -> 16 kHz Int16 chunks (~40 ms each), resampled in the audio thread.
const MIC_WORKLET = `
class Mic extends AudioWorkletProcessor {
  constructor() { super(); this.step = sampleRate / ${IN_RATE}; this.t = 0; this.out = new Int16Array(640); this.n = 0 }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch) return true
    for (; this.t < ch.length; this.t += this.step) {
      const i = Math.floor(this.t), f = this.t - i
      const a = ch[i], b = i + 1 < ch.length ? ch[i + 1] : a
      const s = Math.max(-1, Math.min(1, a + (b - a) * f))
      this.out[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff
      if (this.n === this.out.length) { this.port.postMessage(this.out.slice().buffer); this.n = 0 }
    }
    this.t -= ch.length
    return true
  }
}
registerProcessor('cf-mic', Mic)`

const toB64 = (buf) => {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(s)
}
const fromB64 = (b64) => {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length - (bin.length % 2))
  for (let i = 0; i < bytes.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Int16Array(bytes.buffer)
}

/** Is live voice configured on the server? (cheap GET, no token minted) */
export async function liveAvailable() {
  try {
    const res = await fetch('/api/live-token', { cache: 'no-store' })
    return res.ok && (await res.json()).live === true
  } catch {
    return false
  }
}

/**
 * onTurn(role, text) fires once per finished turn ('user' | 'assistant') so the caller can keep a transcript.
 * Returns status ('off' | 'connecting' | 'live' | 'ending' while he says goodbye), the live bubble texts, lip-sync mouth shape, and controls.
 */
export default function useLiveCall({ onTurn } = {}) {
  const [status, setStatus] = useState('off')
  const [botText, setBotText] = useState('')
  const [userText, setUserText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [mouth, setMouth] = useState('rest')
  const [muted, setMuted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('') // dev-only diagnostics line
  const s = useRef({}) // everything the call owns: socket, audio graph, turn buffers, timers
  const onTurnRef = useRef(onTurn)
  onTurnRef.current = onTurn
  const mutedRef = useRef(false)
  mutedRef.current = muted

  const commit = (role, text) => {
    const t = text.trim()
    if (t) onTurnRef.current?.(role, t)
  }

  const stopPlayback = () => {
    const c = s.current
    c.sources?.forEach((src) => {
      try {
        src.stop()
      } catch {}
    })
    c.sources = new Set()
    c.nextTime = 0
  }

  const teardown = useCallback(() => {
    const c = s.current
    if (c.bot && !c.botDone) commit('assistant', c.bot)
    if (c.user && !c.userDone) commit('user', c.user)
    stopPlayback()
    cancelAnimationFrame(c.raf)
    clearInterval(c.timer)
    clearTimeout(c.setupTimer)
    c.stream?.getTracks().forEach((t) => t.stop())
    if (c.ws) {
      c.ws.onmessage = c.ws.onclose = c.ws.onerror = null
      if (c.ws.readyState < WebSocket.CLOSING) c.ws.close(1000, 'call ended')
    }
    c.ctx?.close().catch(() => {})
    s.current = {}
    setStatus('off')
    setSpeaking(false)
    setMouth('rest')
    setMuted(false)
  }, [])

  useEffect(() => teardown, [teardown])

  // Hang up when the tab is hidden, like ForgeFit: saves battery, bandwidth and cost.
  useEffect(() => {
    const onHide = () => document.hidden && s.current.ws && teardown()
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [teardown])

  const end = useCallback(
    (reason) => {
      // after a spoken goodbye there's nothing to explain; only unexpected endings get a note
      if (reason === 'dropped') setError('the line dropped. tap call him again to keep talking.')
      else if (reason === 'failed') setError('couldn’t get him on the line. you can still type below.')
      teardown()
    },
    [teardown]
  )

  const sendJson = (msg) => {
    const ws = s.current.ws
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
  }

  const play = (b64) => {
    const c = s.current
    if (!c.ctx || c.ctx.state === 'closed') return
    if (c.ctx.state === 'suspended') c.ctx.resume().catch(() => {})
    const pcm = fromB64(b64)
    if (!pcm.length) return
    const buf = c.ctx.createBuffer(1, pcm.length, OUT_RATE) // browser resamples 24 kHz to the device rate
    const ch = buf.getChannelData(0)
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000
    const src = c.ctx.createBufferSource()
    src.buffer = buf
    src.connect(c.analyser)
    const at = Math.max(c.nextTime || 0, c.ctx.currentTime + 0.06)
    src.start(at)
    c.nextTime = at + buf.duration
    c.sources.add(src)
    src.onended = () => c.sources?.delete(src)
  }

  const onMessage = (msg, opening) => {
    const c = s.current
    if ('setupComplete' in msg) {
      c.ready = true
      clearTimeout(c.setupTimer)
      setStatus('live')
      // A new call remembers the recent conversation: the earlier transcript goes in as history first.
      const history = c.history.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
      const prompt = c.firstText
        ? c.firstText
        : history.length
          ? '[call reconnected] The visitor called you back. In one short, natural line, say you’re back and pick up where you left off.'
          : `[call connected] Greet the visitor in one short, natural line in your own words (something in the spirit of ${JSON.stringify(opening)}) and ask what they'd like to know about Bharat.`
      if (c.firstText) {
        // the call was started by a typed / tapped question: he answers it straight away
        commit('user', c.firstText)
        setUserText(c.firstText)
        c.userDone = true
      }
      c.awaiting = true // his reply to this is on the way
      // with initialHistoryInClientContent, clientContent is history only and never gets an answer;
      // the prompt has to go as live input
      if (history.length) sendJson({ clientContent: { turns: history, turnComplete: true } })
      sendJson({ realtimeInput: { text: prompt } })
      return
    }
    if (msg.goAway) return wrapUp('dropped')
    if (msg.toolCall?.functionCalls?.length) {
      const calls = msg.toolCall.functionCalls
      sendJson({ toolResponse: { functionResponses: calls.map((f) => ({ id: f.id, name: f.name, response: { result: 'ok' } })) } })
      if (calls.some((f) => f.name === 'end_call')) {
        // he's said goodbye: stop listening, let the last words play out, then hang up (timer in start)
        c.wrapping = c.wrapping || 'bye'
        c.wrapAt = c.wrapAt || Date.now()
        c.byeAt = Date.now()
        c.byeDone = true
        c.hangUp = true
        setStatus('ending')
      }
      return
    }
    const sc = msg.serverContent
    if (!sc) return

    if (sc.interrupted) {
      // the visitor talked over him: stop instantly, keep what he got out
      c.interrupts = (c.interrupts || 0) + 1
      stopPlayback()
      if (c.bot && !c.botDone) commit('assistant', `${c.bot.trim()}…`)
      c.botDone = true
    }
    const heard = sc.inputTranscription?.text
    if (heard || sc.outputTranscription?.text || sc.modelTurn) c.lastActivity = Date.now()
    if (heard) {
      c.awaiting = true // the visitor is talking, so an answer will follow
      if (c.userDone !== false) {
        c.user = ''
        c.userDone = false
      }
      c.user += heard
      setUserText(c.user.trim())
    }
    const said = sc.outputTranscription?.text
    if (said) {
      if (c.user && !c.userDone) {
        commit('user', c.user)
        c.userDone = true
      }
      if (c.botDone !== false) {
        c.bot = ''
        c.botDone = false
      }
      c.bot += said
      c.lastBot = c.bot
      setBotText(c.bot.trim())
    }
    for (const part of sc.modelTurn?.parts ?? []) {
      if (part.inlineData?.data && /audio/.test(part.inlineData.mimeType || 'audio')) {
        c.chunks = (c.chunks || 0) + 1
        play(part.inlineData.data)
      }
    }
    if (sc.turnComplete && c.bot && !c.botDone) {
      commit('assistant', c.bot)
      c.botDone = true
    }
    if (sc.turnComplete) {
      if (c.byeAt) c.byeDone = true
      c.awaiting = false
      // he signed off: let it play out, then hang up (stops a goodbye <-> echo loop)
      const last = (c.lastBot || '').trim()
      if (!c.hangUp && SIGN_OFF.test(last) && !/\?["”’)]*$/.test(last)) {
        c.wrapping = c.wrapping || 'bye'
        c.wrapAt = c.wrapAt || Date.now()
        c.byeAt = Date.now()
        c.byeDone = true
        c.hangUp = true
        setStatus('ending')
      }
    }
  }

  // Lip-sync + "is he talking" from the actual audio coming out.
  const watch = (c) => {
    const data = new Float32Array(c.analyser.fftSize)
    let last = ''
    let talking = false
    const tick = () => {
      if (s.current !== c) return
      c.analyser.getFloatTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
      const level = Math.sqrt(sum / data.length)
      c.outLevel = level
      if (import.meta.env.DEV && (c.dbgAt = (c.dbgAt || 0) + 1) % 30 === 0) {
        setDebug(`audio ${c.ctx.state} · ${c.ctx.sampleRate} Hz · chunks ${c.chunks || 0} · interrupts ${c.interrupts || 0} · mic ${c.stream ? (c.micLevel || 0).toFixed(3) : 'off'}`)
      }
      const shape = level < 0.012 ? 'rest' : level < 0.04 ? (Math.random() > 0.5 ? 'open' : 'o') : level < 0.09 ? 'open' : 'wide'
      if (shape !== last) setMouth((last = shape))
      const now = c.ctx.currentTime < (c.nextTime || 0) - 0.02
      if (now !== talking) setSpeaking((talking = now))
      c.raf = requestAnimationFrame(tick)
    }
    c.raf = requestAnimationFrame(tick)
  }

  /** End the call politely: he says goodbye in his own words, then it hangs up (see the timer in start). */
  const wrapUp = (reason) => {
    const c = s.current
    if (!c.ready || c.wrapping) return
    c.wrapping = reason // also stops passing the mic through, so nothing cuts the goodbye short
    c.wrapAt = Date.now()
    setStatus('ending')
  }

  /** Start a call. Must be called from a click (audio + mic permissions). Resolves false if live voice isn't reachable. */
  const start = useCallback(async ({ firstText = '', history = [] } = {}) => {
    if (s.current.ws || status !== 'off') return true
    setError('')
    setBotText('')
    setUserText('')
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC || !window.WebSocket) return false
    setStatus('connecting')
    // create audio contexts inside the click so browsers allow sound
    const c = (s.current = { sources: new Set(), nextTime: 0, bot: '', user: '', firstText: typeof firstText === 'string' ? firstText.trim() : '', history: history.slice(-HISTORY_TURNS), lastActivity: Date.now() })
    // one context at the device's own rate for mic and playback, like ForgeFit: Chrome then routes his voice
    // to the normal output and its echo canceller can keep him from hearing (and interrupting) himself
    c.ctx = new AC()
    c.ctx.resume().catch(() => {})
    c.analyser = c.ctx.createAnalyser()
    c.analyser.fftSize = 512
    c.analyser.connect(c.ctx.destination)

    try {
      // the mic is optional: without it the call still works, he just listens to what you type
      let micIssue = ''
      const [tokRes, stream] = await Promise.all([
        fetch('/api/live-token', { method: 'POST' }),
        navigator.mediaDevices?.getUserMedia
          ? navigator.mediaDevices
              .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } })
              .catch((e) => {
                micIssue = e?.name === 'NotFoundError' ? 'no microphone found' : 'your mic is blocked'
                return null
              })
          : null,
      ])
      c.stream = stream
      if (s.current !== c) return true
      if (!tokRes.ok) {
        teardown()
        if (tokRes.status === 429) {
          setError('he’s on a lot of calls right now. try again in a few minutes, or type below.')
          return true
        }
        return false
      }
      const tok = await tokRes.json()
      if (micIssue) setError(`${micIssue}, so type below. he’ll still answer out loud.`)

      // mic graph (routed through a muted gain so the worklet keeps running)
      if (stream) {
        const url = URL.createObjectURL(new Blob([MIC_WORKLET], { type: 'application/javascript' }))
        await c.ctx.audioWorklet.addModule(url)
        URL.revokeObjectURL(url)
        const node = new AudioWorkletNode(c.ctx, 'cf-mic')
        const silent = c.ctx.createGain()
        silent.gain.value = 0
        c.ctx.createMediaStreamSource(stream).connect(node)
        node.connect(silent)
        silent.connect(c.ctx.destination)
        node.port.onmessage = (e) => {
          if (s.current !== c || !c.ready) return
          const pcm = new Int16Array(e.data)
          let sum = 0
          for (let i = 0; i < pcm.length; i++) sum += (pcm[i] / 0x8000) ** 2
          const mic = Math.sqrt(sum / pcm.length)
          c.micLevel = mic
          // Echo guard: while he's talking, laptop speakers leak his voice into the mic, and Gemini would
          // hear that as the visitor interrupting and cut him off. So while he talks, only pass the mic
          // through once it's clearly louder than the echo for ~120 ms (a real barge-in); else send silence.
          const talking = c.ctx.currentTime < (c.nextTime || 0) + ECHO_TAIL
          if (!talking) c.barge = 0
          else c.barge = mic > 0.035 + (c.outLevel || 0) * 0.6 ? (c.barge || 0) + 1 : 0
          const pass = !mutedRef.current && !c.wrapping && (!talking || c.barge >= 3)
          sendJson({ realtimeInput: { audio: { data: toB64(pass ? e.data : new ArrayBuffer(e.data.byteLength)), mimeType: `audio/pcm;rate=${IN_RATE}` } } })
        }
      }

      const ws = new WebSocket(`${ENDPOINT}?access_token=${encodeURIComponent(tok.token)}`)
      c.ws = ws
      ws.onopen = () => {
        if (s.current !== c) return
        c.setupTimer = setTimeout(() => s.current === c && !c.ready && end('failed'), 15_000)
        ws.send(
          JSON.stringify({
            setup: {
              model: `models/${tok.model.replace(/^models\//, '')}`,
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: tok.voiceName } } },
                // 3.1 Live takes a thinking level; 3.8 Live rejects it
                ...(/3\.1/.test(tok.model) ? { thinkingConfig: { thinkingLevel: 'LOW' } } : {}),
              },
              tools: [END_CALL_TOOL],
              historyConfig: { initialHistoryInClientContent: true }, // lets a new call start from the earlier transcript
              contextWindowCompression: { slidingWindow: {} },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              realtimeInputConfig: { automaticActivityDetection: { silenceDurationMs: 600, prefixPaddingMs: 200 } },
            },
          })
        )
      }
      ws.onmessage = async (e) => {
        if (s.current !== c) return
        try {
          const text = typeof e.data === 'string' ? e.data : await new Blob([e.data]).text()
          onMessage(JSON.parse(text), tok.opening)
        } catch {}
      }
      ws.onerror = () => {}
      ws.onclose = () => s.current === c && end(c.ready ? 'dropped' : 'failed')

      const deadline = Date.now() + tok.maxSeconds * 1000
      setSecondsLeft(tok.maxSeconds)
      c.timer = setInterval(() => {
        if (s.current !== c) return
        const left = Math.max(0, Math.round((deadline - Date.now()) / 1000))
        setSecondsLeft(left)
        if (!c.ready) return
        const talking = c.ctx.currentTime < (c.nextTime || 0)
        if (left <= GOODBYE_AT) wrapUp('time')
        else if (!talking && Date.now() - c.lastActivity > IDLE_MS) wrapUp('idle')
        if (!c.wrapping) return
        // let him finish his current answer (or the visitor their question), then ask for the goodbye
        if (!c.byeAt && !talking && (!c.awaiting || Date.now() - c.wrapAt > GOODBYE_WAIT_MS)) {
          c.byeAt = Date.now()
          c.awaiting = true
          // the goodbye gets a fresh bubble
          if (c.bot && !c.botDone) commit('assistant', c.bot)
          c.botDone = true
          sendJson({ realtimeInput: { text: GOODBYES[c.wrapping] } })
        }
        // hang up once the goodbye has been said (or if it takes too long)
        const settled = !talking && (!c.hangUp || Date.now() - c.byeAt > 1500) // his last words may still be arriving
        if (c.byeAt && ((c.byeDone && settled) || Date.now() - c.byeAt > GOODBYE_WAIT_MS || left === 0)) end(c.wrapping)
      }, 1000)
      watch(c)
      return true
    } catch (e) {
      teardown()
      return false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, teardown, end])

  /** Type into the live call; he answers out loud. */
  const sendText = useCallback((text) => {
    const c = s.current
    const t = text.trim()
    if (!c.ready || c.wrapping || !t) return false
    stopPlayback()
    if (c.bot && !c.botDone) {
      commit('assistant', `${c.bot.trim()}…`)
      c.botDone = true
    }
    commit('user', t)
    c.user = ''
    c.userDone = true
    c.lastActivity = Date.now()
    c.awaiting = true
    setUserText(t)
    sendJson({ realtimeInput: { text: t } })
    return true
  }, [])

  return { status, botText, userText, speaking, mouth, muted, setMuted, secondsLeft, error, setError, start, end, sendText, debug }
}
