import { useEffect, useRef, useState } from 'react'
import InspectorAvatar from './InspectorAvatar.jsx'
import InspectorFigure from './InspectorFigure.jsx'
import useVoice from '../lib/useVoice.js'
import useLiveCall, { liveAvailable } from '../lib/useLiveCall.js'
import { INSPECTOR } from '../lib/inspectorKnowledge.js'
import { answerOffline } from '../lib/inspectorBrain.js'

const STORE = 'cf-inspector-chat'
const TEASED = 'cf-inspector-teased'
const AI_TIMEOUT = 12000
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const load = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE)) || null
  } catch {
    return null
  }
}

/** Ask the AI endpoint; any failure (no key, offline, rate limit, refusal, timeout) returns null. */
async function askAI(history) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), AI_TIMEOUT)
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      signal: ctrl.signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

const linkify = (text) =>
  text.split(/(\S+@\S+\.\w+|\/resume\.pdf|(?:https?:\/\/)?[\w-]+\.(?:space|com|in|dev)(?:\/\S*)?)/g).map((part, i) => {
    if (/@/.test(part)) return <a key={i} href={`mailto:${part.replace(/[.,]$/, '')}`}>{part}</a>
    if (part === '/resume.pdf') return <a key={i} href="/resume.pdf" target="_blank" rel="noreferrer">résumé (pdf)</a>
    if (/^(?:https?:\/\/)?[\w-]+\.(space|com|in|dev)/.test(part) && !/\s/.test(part)) {
      const href = part.startsWith('http') ? part : `https://${part.replace(/[.,]$/, '')}`
      return <a key={i} href={href} target="_blank" rel="noreferrer">{part}</a>
    }
    return part
  })

// Pick a mouth shape from the sound of the word being spoken.
const shapeFor = (word = '') => {
  const v = (word.toLowerCase().match(/[aeiou]/) || [''])[0]
  return v === 'o' || v === 'u' ? 'o' : v === 'a' ? 'wide' : 'open'
}

export default function Inspector() {
  const saved = load()
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [messages, setMessages] = useState(saved?.messages ?? [])
  const [line, setLine] = useState({ text: '', shown: 0 }) // what's in his bubble right now
  const [userLine, setUserLine] = useState('')
  const [input, setInput] = useState('')
  const [mood, setMood] = useState('idle') // idle | talking | listening | thinking
  const [mouth, setMouth] = useState('rest')
  const [look, setLook] = useState({ x: 0, y: 0 })
  const [voiceOn, setVoiceOn] = useState(saved?.voiceOn ?? true)
  const [mode, setMode] = useState(saved?.mode ?? '')
  const [transcript, setTranscript] = useState(false)
  const voice = useVoice()
  const [live, setLive] = useState(false) // is a real voice call (Gemini Live) available?
  const call = useLiveCall({
    onTurn: (role, content) => setMessages((m) => [...m, { role, content, ...(role === 'assistant' ? { source: 'live' } : {}) }]),
  })
  const inCall = call.status !== 'off'
  const field = useRef(null)
  const stage = useRef(null)
  const busy = useRef(false)
  const word = useRef('')
  const timers = useRef([])
  const greeted = useRef(false)

  const clearTimers = () => {
    timers.current.forEach((t) => clearInterval(t))
    timers.current = []
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify({ messages: messages.slice(-30), voiceOn, mode }))
    } catch {}
  }, [messages, voiceOn, mode])

  useEffect(() => {
    liveAvailable().then(setLive)
  }, [])

  // One-time nudge after a few seconds.
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(TEASED) === '1'
    } catch {}
    if (seen) return
    const t = setTimeout(() => {
      setTeaser(true)
      try {
        sessionStorage.setItem(TEASED, '1')
      } catch {}
    }, 9000)
    const t2 = setTimeout(() => setTeaser(false), 17000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [])

  // Lip-sync loop: while talking, flap between the current word's shape and a closed mouth.
  useEffect(() => {
    if (mood !== 'talking') {
      setMouth(mood === 'idle' ? 'smile' : 'rest')
      const t = setTimeout(() => setMouth('rest'), 900)
      return () => clearTimeout(t)
    }
    let flip = false
    const id = setInterval(() => {
      flip = !flip
      setMouth(flip ? shapeFor(word.current) : Math.random() > 0.5 ? 'rest' : 'open')
    }, 115)
    return () => clearInterval(id)
  }, [mood])

  /** Make him say `text`: bubble fills word by word, mouth moves, voice if on. */
  const say = (text, { silent = false } = {}) => {
    clearTimers()
    voice.stopSpeaking()
    const speakIt = voiceOn && voice.canSpeak && !silent
    setLine({ text, shown: 0 })
    setMood('talking')
    word.current = text.split(' ')[0]
    const done = () => {
      clearTimers()
      setLine({ text, shown: text.length })
      setMood('idle')
    }
    if (reduced()) {
      setLine({ text, shown: text.length })
      if (speakIt) voice.speak(text, { onEnd: () => setMood('idle') })
      else setMood('idle')
      return
    }
    // Typing pace that roughly matches speech; boundary events (if the voice sends them) take over.
    let shown = 0
    let synced = false
    const pace = speakIt ? 62 : 28
    const typer = setInterval(() => {
      if (synced) return
      shown = Math.min(text.length, shown + 1)
      const m = text.slice(0, shown).match(/(\S+)\s*$/)
      if (m) word.current = m[1]
      setLine({ text, shown })
      if (shown >= text.length && !speakIt) done()
    }, pace)
    timers.current.push(typer)
    if (speakIt) {
      const ok = voice.speak(text, {
        onWord: (idx, w) => {
          synced = true
          word.current = w
          shown = Math.max(shown, Math.min(text.length, idx + (w?.length || 1)))
          setLine({ text, shown })
        },
        onEnd: done,
      })
      if (!ok) setTimeout(done, text.length * pace)
    }
  }

  useEffect(() => {
    if (!open) {
      clearTimers()
      voice.stopSpeaking()
      voice.stopListening()
      call.end()
      setMood('idle')
      return
    }
    // First open this tab: he introduces himself. With live voice the call (started by the click) greets instead.
    if (!greeted.current && !live) {
      greeted.current = true
      const last = [...messages].reverse().find((m) => m.role === 'assistant')
      const hello = last && messages.length > 1 ? `welcome back, detective. ${INSPECTOR.quickBack}` : INSPECTOR.greeting
      setTimeout(() => say(hello), 450)
    }
    setTimeout(() => field.current?.focus({ preventScroll: true }), 500)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Measure the controls so the cop (and his bubble) always sit just above them.
  useEffect(() => {
    const el = stage.current?.querySelector('.stage-bottom')
    if (!el) return
    const ro = new ResizeObserver(() => stage.current?.style.setProperty('--ctrl-h', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Eyes follow the pointer.
  const onMove = (e) => {
    const r = stage.current?.querySelector('.fig')?.getBoundingClientRect()
    if (!r) return
    setLook({ x: (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), y: (e.clientY - (r.top + r.height * 0.4)) / (window.innerHeight / 2) })
  }

  const send = async (text, { spoken = false } = {}) => {
    const q = text.trim().slice(0, 500)
    if (!q) return
    if (inCall) {
      if (call.sendText(q)) setInput('')
      return
    }
    if (live) {
      // not on a call yet: ring him with this question, he answers out loud
      setInput('')
      return onCall(q)
    }
    if (busy.current) return
    busy.current = true
    setInput('')
    voice.setError('')
    clearTimers()
    voice.stopSpeaking()
    setUserLine(q)
    const history = [...messages, { role: 'user', content: q }]
    setMessages(history)
    setMood('thinking')
    setLine({ text: '', shown: 0 })
    const started = Date.now()
    let reply = await askAI(history)
    const source = reply ? 'ai' : 'offline'
    if (!reply) reply = answerOffline(q)
    await new Promise((r) => setTimeout(r, Math.max(0, 900 - (Date.now() - started))))
    setMode(source)
    setMessages((m) => [...m, { role: 'assistant', content: reply, source }])
    if (spoken && !voiceOn) setVoiceOn(true)
    say(reply)
    busy.current = false
  }

  const onMic = async () => {
    if (voice.listening) return voice.stopListening()
    clearTimers()
    voice.stopSpeaking()
    setMood('listening')
    setUserLine('')
    const said = await voice.listen()
    if (said) send(said, { spoken: true })
    else setMood('idle')
  }

  /** Start (or hang up) the live call. Call from a click so the browser allows audio. */
  const onCall = async (firstText = '') => {
    if (inCall) return call.end()
    clearTimers()
    voice.stopSpeaking()
    voice.stopListening()
    voice.setError('')
    setLine({ text: '', shown: 0 })
    setUserLine('')
    setMood('idle')
    // the transcript so far goes along, so calling again picks up where you left off
    const ok = await call.start({ firstText, history: messages.filter((m) => m.role === 'user' || m.source === 'live') })
    if (!ok) {
      // live voice isn't reachable: quietly fall back to the browser's speech
      setLive(false)
      greeted.current = true
      if (firstText) {
        busy.current = false
        send(firstText)
      } else say(INSPECTOR.greeting)
    }
  }

  const toggleVoice = () => {
    if (voiceOn) voice.stopSpeaking()
    setVoiceOn((v) => !v)
  }

  const replay = () => line.text && say(line.text)

  const ringing = call.status === 'connecting'
  const figMood = inCall ? (call.speaking ? 'talking' : ringing ? 'thinking' : 'listening') : mood
  const thinking = figMood === 'thinking'
  const bubbleText = inCall || (live && !line.text) ? call.botText : mood === 'thinking' ? '' : line.text.slice(0, line.shown)
  const userText = inCall ? call.userText : voice.listening ? voice.interim || '…' : userLine
  const asked = messages.some((m) => m.role === 'user')
  const errorText = call.error || voice.error
  const clock = `${Math.floor(call.secondsLeft / 60)}:${String(call.secondsLeft % 60).padStart(2, '0')}`
  const statusText = inCall
    ? ringing
      ? 'ringing…'
      : call.status === 'ending'
        ? 'wrapping up the call'
        : call.speaking
        ? 'talking'
        : call.muted
          ? 'you’re muted'
          : 'listening, just talk'
    : voice.listening
      ? 'listening…'
      : mood === 'thinking'
        ? 'checking the file…'
        : mood === 'talking'
          ? 'talking'
          : 'on duty'

  return (
    <>
      <button
        className={`insp-launch ${open ? 'is-hidden' : ''}`}
        onClick={() => {
          setOpen(true)
          setTeaser(false)
          if (live) onCall() // opening him is the call: he greets in his real voice right away
        }}
        aria-label="Talk to Inspector Byte about Bharat"
        aria-expanded={open}
        aria-controls="inspector"
        data-cursor="interrogate"
      >
        <InspectorAvatar size={62} />
        <span className="insp-launch-tag">ask the inspector</span>
        {teaser && (
          <span className="insp-teaser" role="status">
            psst. questions about Bharat? ask me, i’ve got the file.
          </span>
        )}
      </button>

      <section id="inspector" ref={stage} className={`stage ${open ? 'is-open' : ''} is-${figMood} ${inCall ? 'is-call' : ''}`} role="dialog" aria-label="Talk to Inspector Byte" aria-hidden={!open} onPointerMove={onMove}>
        <div className="stage-scrim" onClick={() => setOpen(false)} />

        <div className="stage-top">
          <span className="stage-name cf-display">{INSPECTOR.name}</span>
          <span className="stage-status">
            <i className={voice.listening || (inCall && !ringing) ? 'is-rec' : ''} />
            {statusText}
            {inCall ? !ringing && <em className={call.secondsLeft <= 60 ? 'is-ending' : ''}> · live call {clock}{call.secondsLeft <= 60 ? ' left' : ''}</em> : mode && <em>{mode === 'ai' ? ' · AI' : ' · case notes'}</em>}
          </span>
          <div className="stage-tools">
            {voice.canSpeak && !inCall && (
              <button className={`stage-icon ${voiceOn ? 'is-on' : ''}`} onClick={toggleVoice} aria-pressed={voiceOn} aria-label={voiceOn ? 'Mute the inspector' : 'Let the inspector speak'} tabIndex={open ? 0 : -1}>
                {voiceOn ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l5 6M22 9l-5 6" fill="none" /></svg>
                )}
              </button>
            )}
            <button className={`stage-icon ${transcript ? 'is-on' : ''}`} onClick={() => setTranscript((t) => !t)} aria-pressed={transcript} aria-label="Show transcript" tabIndex={open ? 0 : -1}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="none" /><path d="M9 10h7M9 14h7M9 18h4" fill="none" /></svg>
            </button>
            <button className="stage-icon" onClick={() => setOpen(false)} aria-label="Close" tabIndex={open ? 0 : -1}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" /></svg>
            </button>
          </div>
        </div>

        {/* the inspector himself */}
        <div className="stage-cop">
          <InspectorFigure mouth={inCall ? call.mouth : mouth} mood={figMood} look={look} />
        </div>

        {/* his speech bubble (or thought bubble while thinking) */}
        <div className={`bubble ${thinking ? 'bubble--think' : ''} ${bubbleText || thinking ? 'is-on' : ''}`} aria-live="polite">
          {thinking ? (
            <p className="bubble-dots" aria-label={ringing ? 'Calling the inspector' : 'Inspector is thinking'}>
              {ringing ? 'ring ring' : 'hmm'}
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>
          ) : (
            <>
              <p>
                {linkify(bubbleText)}
                {!inCall && <span className="cf-sr">{line.text.slice(line.shown)}</span>}
              </p>
              {!inCall && !live && line.text && mood === 'idle' && voice.canSpeak && (
                <button className="bubble-replay" onClick={replay} aria-label="Hear that again" tabIndex={open ? 0 : -1}>
                  ▶ again
                </button>
              )}
            </>
          )}
        </div>

        {/* the visitor's bubble */}
        {userText && (
          <div className={`ububble ${voice.listening || inCall ? 'is-live' : ''}`}>
            <p>{userText}</p>
          </div>
        )}

        {transcript && (
          <div className="stage-transcript" role="log" aria-label="Transcript">
            {messages.length === 0 && <p className="cf-label">nothing on record yet.</p>}
            {messages.map((m, i) => (
              <p key={i} className={`tr tr--${m.role}`}>
                <b className="cf-label">{m.role === 'user' ? 'you' : 'inspector'}</b> {linkify(m.content)}
              </p>
            ))}
          </div>
        )}

        <div className="stage-bottom">
          {!asked && !thinking && (
            <div className="stage-quick">
              {INSPECTOR.quick.map((q) => (
                <button key={q} onClick={() => send(q)} tabIndex={open ? 0 : -1}>
                  {q}
                </button>
              ))}
            </div>
          )}
          {errorText && <p className="stage-error" role="alert">{errorText}</p>}
          {import.meta.env.DEV && inCall && call.debug && <p className="stage-debug">dev · {call.debug}</p>}
          {live && (
            <div className={`stage-call ${inCall ? 'is-on' : ''}`}>
              <button type="button" className="stage-call-btn" onClick={() => onCall()} aria-pressed={inCall} tabIndex={open ? 0 : -1} data-cursor={inCall ? 'hang up' : 'call'}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
                </svg>
                <span>{inCall ? (ringing ? 'cancel' : 'hang up') : 'call him again'}</span>
              </button>
              {inCall && !ringing && (
                <button type="button" className={`stage-icon stage-mute ${call.muted ? 'is-on' : ''}`} onClick={() => call.setMuted((m) => !m)} aria-pressed={call.muted} aria-label={call.muted ? 'Unmute your mic' : 'Mute your mic'} tabIndex={open ? 0 : -1}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" />
                    {call.muted && <path d="M4 4l16 16" fill="none" />}
                  </svg>
                </button>
              )}
              {inCall && !ringing && <span className="stage-call-hint">just talk. interrupt him any time.</span>}
            </div>
          )}
          <form
            className="stage-form"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            {voice.canListen && !live && (
              <button type="button" className={`stage-mic ${voice.listening ? 'is-on' : ''}`} onClick={onMic} aria-pressed={voice.listening} aria-label={voice.listening ? 'Stop listening' : 'Ask by voice'} tabIndex={open ? 0 : -1} data-cursor={voice.listening ? 'stop' : 'talk'}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" /></svg>
                <span>{voice.listening ? 'listening' : 'talk'}</span>
              </button>
            )}
            <input ref={field} value={input} onChange={(e) => setInput(e.target.value)} placeholder={inCall ? 'or type while you talk…' : 'or type a question…'} maxLength={500} aria-label="Your question" tabIndex={open ? 0 : -1} />
            <button type="submit" className="stage-send" disabled={!input.trim() || (!inCall && mood === 'thinking') || ringing} aria-label="Ask" tabIndex={open ? 0 : -1}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M12 5l7 7-7 7" fill="none" /></svg>
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
