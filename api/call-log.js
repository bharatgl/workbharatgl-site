// POST /api/call-log: one structured log line per voice-call event, written to stdout. On Cloud Run that
// lands in Cloud Logging as a searchable JSON entry (Logs Explorer: jsonPayload.type="voice_call").
// No database or extra permissions needed. Payloads are size-capped and rate-limited.
//   body: { event: 'ring'|'answer'|'decline'|'ignore'|'end'|'error', session, call?, seconds?, turns?, reason?, transcript? }

const EVENTS = new Set(['ring', 'answer', 'decline', 'ignore', 'start', 'end', 'error'])
const RATE = { windowMs: 60_000, max: 30 } // log calls per IP per minute
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > RATE.max
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > 64_000) throw new Error('too_big')
    chunks.push(c)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

const str = (v, n) => (typeof v === 'string' ? v.slice(0, n) : undefined)
const num = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.min(Number(v), 100_000)) : undefined)

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end()
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  if (rateLimited(ip)) {
    res.statusCode = 429
    return res.end()
  }
  let body
  try {
    body = await readJson(req)
  } catch {
    res.statusCode = 400
    return res.end()
  }
  if (!EVENTS.has(body.event)) {
    res.statusCode = 400
    return res.end()
  }
  const transcript = Array.isArray(body.transcript)
    ? body.transcript.slice(-60).map((t) => ({ role: t?.role === 'user' ? 'visitor' : 'inspector', text: str(t?.text, 600) })).filter((t) => t.text)
    : undefined
  console.log(
    JSON.stringify({
      severity: body.event === 'error' ? 'WARNING' : 'INFO',
      message: `voice call: ${body.event}`,
      type: 'voice_call',
      event: body.event,
      session: str(body.session, 40),
      call: str(body.call, 40),
      seconds: num(body.seconds),
      turns: num(body.turns),
      reason: str(body.reason, 40),
      device: str(body.device, 20),
      page: str(body.page, 40),
      country: str(req.headers['x-country-code'] || req.headers['x-appengine-country'], 8),
      transcript,
    })
  )
  res.statusCode = 204
  res.end()
}
