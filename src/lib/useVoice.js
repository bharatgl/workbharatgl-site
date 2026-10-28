import { useCallback, useEffect, useRef, useState } from 'react'

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

// Pick the most "inspector" voice available: Indian English first, then British, then any English.
function pickVoice() {
  const voices = synth?.getVoices() ?? []
  const en = voices.filter((v) => /^en[-_]/i.test(v.lang))
  const score = (v) =>
    (/en[-_]IN/i.test(v.lang) ? 40 : /en[-_]GB/i.test(v.lang) ? 25 : /en[-_]US/i.test(v.lang) ? 15 : 5) +
    (/rishi|ravi|daniel|arthur|male|aaron|fred|george|google uk english male/i.test(v.name) ? 20 : 0) +
    (v.localService ? 5 : 0)
  return en.sort((a, b) => score(b) - score(a))[0] ?? null
}

// Speech engines cut off long utterances on some browsers: speak sentence by sentence.
const sentences = (text) => text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text]

/**
 * Browser speech in both directions (Web Speech API, free, on-device or browser-provided).
 * - listen(): speech → text, with live interim text; resolves with the final transcript.
 * - speak(text): text → speech in a detective-ish voice; stop() cancels both.
 * Everything degrades gracefully: canListen / canSpeak are false where unsupported.
 */
export default function useVoice() {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const rec = useRef(null)
  const voice = useRef(null)

  useEffect(() => {
    if (!synth) return
    const load = () => (voice.current = pickVoice())
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => {
      synth.removeEventListener?.('voiceschanged', load)
      synth.cancel()
      rec.current?.abort()
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    synth?.cancel()
    setSpeaking(false)
  }, [])


  /**
   * Speak `text`. Callbacks drive lip-sync and the bubble:
   * onWord(charIndex, word) fires as each word starts (index into the original text),
   * onEnd() when he's done (or was cut off). Returns false if speech isn't available.
   */
  const speak = useCallback((text, { onWord, onEnd } = {}) => {
    if (!synth || !text) return false
    synth.cancel()
    // Spoken form: drop "https://", read "/" as "slash". Keep a map back to the original text.
    const parts = sentences(text)
    let offset = 0
    let done = false
    const finish = () => {
      if (done) return
      done = true
      setSpeaking(false)
      onEnd?.()
    }
    parts.forEach((part, i) => {
      const start = text.indexOf(part, offset)
      offset = start + part.length
      const spoken = part.replace(/https?:\/\//g, '').replace(/\//g, ' slash ')
      const u = new SpeechSynthesisUtterance(spoken)
      if (voice.current) u.voice = voice.current
      u.lang = voice.current?.lang || 'en-IN'
      u.rate = 1
      u.pitch = 0.8
      u.onstart = () => {
        setSpeaking(true)
        onWord?.(start, part.split(' ')[0])
      }
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return
        // map the spoken-text index back to roughly the same place in the original
        const ratio = spoken.length ? e.charIndex / spoken.length : 0
        const idx = start + Math.round(ratio * part.length)
        const word = spoken.slice(e.charIndex).split(/\s/)[0]
        onWord?.(idx, word)
      }
      if (i === parts.length - 1) u.onend = finish
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') finish()
      }
      synth.speak(u)
    })
    return true
  }, [])

  const listen = useCallback(
    () =>
      new Promise((resolve) => {
        if (!Recognition) return resolve('')
        stopSpeaking() // he stops talking when you start
        rec.current?.abort()
        const r = new Recognition()
        rec.current = r
        r.lang = navigator.language?.startsWith('en') ? navigator.language : 'en-IN'
        r.interimResults = true
        r.continuous = false
        r.maxAlternatives = 1
        let finalText = ''
        setError('')
        setInterim('')
        r.onstart = () => setListening(true)
        r.onresult = (e) => {
          let live = ''
          for (const res of e.results) {
            if (res.isFinal) finalText += res[0].transcript
            else live += res[0].transcript
          }
          setInterim((finalText + live).trim())
        }
        r.onerror = (e) => {
          const map = {
            'not-allowed': 'Microphone is blocked. Allow it in your browser’s site settings, or just type.',
            'service-not-allowed': 'Voice input isn’t allowed here. You can type instead.',
            'no-speech': 'Didn’t catch that. Tap the mic and try again.',
            'audio-capture': 'No microphone found. You can type instead.',
            network: 'Voice needs an internet connection. You can type instead.',
          }
          if (e.error !== 'aborted') setError(map[e.error] || 'Voice input hiccuped. Try again or type.')
        }
        r.onend = () => {
          setListening(false)
          setInterim('')
          resolve(finalText.trim())
        }
        try {
          r.start()
        } catch {
          setListening(false)
          resolve('')
        }
      }),
    [stopSpeaking]
  )

  const stopListening = useCallback(() => rec.current?.stop(), [])

  return {
    canListen: !!Recognition,
    canSpeak: !!synth,
    listening,
    speaking,
    interim,
    error,
    setError,
    listen,
    stopListening,
    speak,
    stopSpeaking,
  }
}
