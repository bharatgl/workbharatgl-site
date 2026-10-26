// /api/live-token: live voice for Inspector Byte over Gemini Live (same architecture as ForgeFit's live coach).
// Hands the browser a short-lived, single-use token locked to his persona; the browser then talks to Gemini
// directly over a WebSocket, so audio never passes through here and GEMINI_API_KEY never leaves the server.
//   GET  -> { live: boolean }                                  (is live voice configured?)
//   POST -> { token, model, voiceName, opening, maxSeconds }    or 503 / 429
import { GoogleGenAI, Modality } from '@google/genai'
import { PERSONA, FIRST_MESSAGE } from './_persona.js'

const MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'
const VOICE = process.env.GEMINI_LIVE_VOICE || 'Charon'
// Gemini caps an audio session at 15 minutes; idle calls are hung up by the browser after a quiet minute
const MAX_SECONDS = Math.min(900, Number(process.env.LIVE_MAX_SECONDS) || 900)
const RATE = { windowMs: 10 * 60_000, max: 4 } // calls per IP per 10 min, best-effort (resets on cold start)

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > RATE.max
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method === 'GET') return send(res, 200, { live: !!ai })
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (!ai) return send(res, 503, { error: 'live_unavailable' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  // local dev only: never on Cloud Run (K_SERVICE is set there), where X-Forwarded-For can be faked
  const local = !process.env.K_SERVICE && process.env.NODE_ENV !== 'production' && /^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/.test(ip)
  if (!local && rateLimited(ip)) return send(res, 429, { error: 'slow_down' })

  const now = Date.now()
  try {
    const token = await ai.authTokens.create({
      config: {
        abortSignal: AbortSignal.timeout(20_000),
        uses: 1,
        expireTime: new Date(now + (MAX_SECONDS + 60) * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        // the persona is locked into the token; the browser can't swap in its own instructions
        liveConnectConstraints: { model: MODEL, config: { responseModalities: [Modality.AUDIO], systemInstruction: PERSONA } },
        lockAdditionalFields: [],
      },
    })
    if (!token.name) throw new Error('no token')
    return send(res, 200, { token: token.name, model: MODEL, voiceName: VOICE, opening: FIRST_MESSAGE, maxSeconds: MAX_SECONDS })
  } catch (error) {
    const status = error?.status || error?.code
    if (status === 429) return send(res, 429, { error: 'busy' })
    return send(res, 503, { error: 'live_unavailable' })
  }
}
