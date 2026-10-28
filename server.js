// Production server for Cloud Run: the two API routes plus the built site (dist/).
// In production Firebase Hosting serves the site from its CDN and forwards only /api/* here,
// but serving dist/ too means this one container also works on its own.
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import ask from './api/ask.js'
import liveToken from './api/live-token.js'
import callLog from './api/call-log.js'

const PORT = Number(process.env.PORT) || 8080
const DIST = fileURLToPath(new URL('./dist/', import.meta.url))
const ROUTES = { '/api/ask': ask, '/api/live-token': liveToken, '/api/call-log': callLog }
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

async function sendFile(res, file, cache) {
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': cache })
  createReadStream(file).pipe(res)
}

async function serveStatic(req, res, pathname) {
  // resolve inside dist/ only (no ../ escapes)
  const file = normalize(join(DIST, decodeURIComponent(pathname)))
  if (file.startsWith(DIST)) {
    const info = await stat(file).catch(() => null)
    if (info?.isFile()) {
      // hashed build assets never change; everything else revalidates
      return sendFile(res, file, pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=300')
    }
  }
  // section paths (/skills, /projects…) are app routes: hand them the app shell
  return sendFile(res, join(DIST, 'index.html'), 'no-cache')
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost')
  try {
    if (pathname === '/health') return res.end('ok') // not /healthz: Cloud Run reserves paths ending in z
    const route = ROUTES[pathname.replace(/\/$/, '')]
    if (route) return await route(req, res)
    if (pathname.startsWith('/api/')) {
      res.statusCode = 404
      return res.end(JSON.stringify({ error: 'not_found' }))
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      return res.end()
    }
    return await serveStatic(req, res, pathname)
  } catch (error) {
    console.error(error)
    if (!res.headersSent) res.statusCode = 500
    res.end()
  }
}).listen(PORT, () => console.log(`workbharatgl-site listening on :${PORT}`))
