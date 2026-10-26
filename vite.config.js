import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Serves api/*.js on the dev server too, so the Inspector's AI and live voice work locally
// when ANTHROPIC_API_KEY / GEMINI_API_KEY are set in .env.local (in production, Vercel runs api/ as functions).
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      for (const name of ['ask', 'live-token']) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          try {
            const mod = await server.ssrLoadModule(`/api/${name}.js`)
            await mod.default(req, res)
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'dev_api_failed', message: e.message }))
          }
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const k of ['ANTHROPIC_API_KEY', 'GEMINI_API_KEY', 'GEMINI_LIVE_MODEL', 'GEMINI_LIVE_VOICE']) {
    if (env[k] && !process.env[k]) process.env[k] = env[k]
  }
  return {
    plugins: [react(), localApi()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          designSystem: resolve(__dirname, 'design-system.html'),
        },
      },
    },
  }
})
