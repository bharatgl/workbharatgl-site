# workbharatgl.online: The Case of the Missing Frontend Engineer

Bharat Goyal's portfolio, told as a detective story on a dark evidence board (Batman-inspired, handmade feel),
built on its own design system, **CASEFILE**. React 18 + Vite + GSAP (ScrollTrigger).

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173  (design system: /design-system.html)
```

## Edit content
- All copy (chapters, projects, FAQ, Instagram, links): `src/content.js`. Replace the `YOUR-HANDLE` links (LinkedIn, GitHub, LeetCode).
- Photos: `public/me-garden.jpg` (opening polaroid, 4:5) and `public/me.png` (About mugshot; cut-out with a transparent background). Paths live in `site.heroPhoto` / `site.photo` in `src/content.js`.
- Resume: `public/resume.pdf` (served at /resume.pdf). Note: it contains your phone number.

## Design system (CASEFILE)
| Layer | File |
|---|---|
| Tokens: color, type, space, paper physics, motion, z-index | `src/ds/tokens.css` |
| Base + component styles | `src/ds/components.css` |
| React components: Paper, Polaroid, Sticky, Stamp, EvidenceTag, Button, Circled, Highlight, HandNote, Typewriter, Reveal, Chapter | `src/ds/index.jsx` |
| Living reference page | `design-system.html` → `src/ds-page/` |

Chapters live in `src/sections/` (ColdOpen, Suspect, Trail, Evidence, Tools, OffRecord, Interrogation, Verdict).

## Experience pieces
Case-folder intro, red string between pins (`RedString.jsx`), handwriting that writes itself (`HandText.jsx`, EMS Felix pen font),
marker circles and highlighter, typewriter file, stamps, crime-scene tape, doodles, bats (`Bats.jsx`), magnifying-glass cursor,
swinging 3D envelope, Instagram carousel with fallbacks, and Inspector Byte. All honour `prefers-reduced-motion`.

The theme is an original homage: no DC names, logos or artwork, so it's safe to publish.

## Inspector Byte (live voice agent + chat)
A cartoon detective who talks with visitors about Bharat, out loud or by text.

- **Live voice call (Gemini Live, same architecture as ForgeFit's live coach):** tap "talk to him, live" for a real conversation: speech in, natural speech out,
  no robotic text-to-speech. Visitors can interrupt him mid-sentence, and both sides are transcribed live into the bubbles
  and the transcript. His mouth moves with the actual audio.
  - `api/live-token.js` mints a single-use token that expires in a few minutes and locks his persona, voice and model
    (the real key never reaches the browser). Calls are capped at 5 minutes; 4 calls per visitor per 10 minutes.
  - Browser side: `src/lib/useLiveCall.js`: raw WebSocket to Gemini, mic -> 16 kHz PCM via an AudioWorklet, 24 kHz playback,
    barge-in, live transcripts, hangs up when the tab is hidden. The persona lives in `api/_persona.js`.
  - Key: aistudio.google.com/apikey -> `GEMINI_API_KEY` in `.env.local` (local) or Vercel env vars (production).
    Optional: `GEMINI_LIVE_VOICE` (default `Charon`), `GEMINI_LIVE_MODEL` (default `gemini-3.1-flash-live-preview`).
  - Set a spending limit for the key in Google AI Studio, since the page is public.
- **Typed answers:** `api/ask.js` calls Claude (`claude-opus-5-5`, low effort) with the case file (`src/lib/inspectorKnowledge.js`).
  Set `ANTHROPIC_API_KEY`. Guardrails: answers only about Bharat, 500-char messages, last 10 turns, 8 requests/min per visitor.
- **No keys at all:** still works. Offline answers from `src/content.js` (`src/lib/inspectorBrain.js`) and the browser's own
  speech (`src/lib/useVoice.js`). If live voice fails for any reason, the stage falls back to this quietly.

## Deploy (GCP: Cloud Run + Firebase Hosting)
```text
visitor ──► Firebase Hosting (Google CDN, workbharatgl.online, HTTPS)
              ├─ the site (dist/)                     served from the CDN edge
              └─ /api/*  ──► Cloud Run "workbharatgl-site" (asia-south1, server.js)
                               └─ GEMINI_API_KEY / ANTHROPIC_API_KEY from Secret Manager
voice audio: visitor's browser ◄──► Gemini Live directly (never through Cloud Run)
```
Cloud Run scales to zero when idle and is capped at 5 instances, so cost tracks real use.

1. Install the Google Cloud CLI (cloud.google.com/sdk) and sign in: `gcloud auth login`.
2. Deploy (stores your keys from `.env` in Secret Manager without printing them, builds with Cloud Build,
   deploys Cloud Run, then the site to Firebase Hosting):
   ```bash
   GCP_PROJECT_ID=your-project-id ./scripts/deploy-gcp.sh
   ```
3. Domain, once: Firebase console → Hosting → Add custom domain → `workbharatgl.online` (and `www`),
   then add the DNS records it shows at your registrar. HTTPS is issued automatically.

**Auto-deploy (GitHub Actions):** every push to `main` runs `.github/workflows/deploy.yml`: build, Cloud Run, Firebase
Hosting, then a smoke test of the live site and voice API. Pull requests only build. GitHub signs in to GCP keylessly
(Workload Identity Federation, trusted only for this repo's `main`); run `./scripts/setup-ci-gcp.sh` once to create
that trust and the `portfolio-deployer` account. Manual `./scripts/deploy-gcp.sh` still works.

Run the production server locally: `npm run build && node --env-file=.env server.js` (port 8080).
Rotating a key: `printf '%s' NEW_KEY | gcloud secrets versions add gemini-api-key --data-file=-`, then redeploy.

Font credit: handwritten notes use EMS Felix (SIL Open Font License), `src/assets/hand-font.svg`.
