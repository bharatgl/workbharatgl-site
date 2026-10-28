// All site copy lives here. Edit freely.
// Voice: sentence case, plain and confident, with a dry detective-case-file humour. Headings stay plain for recruiters.
export const site = {
  name: 'Bharat Goyal',
  role: 'Full-Stack & AI Engineer',
  location: 'Bengaluru, India',
  email: 'goyalbharat9977@gmail.com',
  resume: '/resume.pdf',
  linkedin: 'https://www.linkedin.com/in/bharatgl',
  github: 'https://github.com/bharatgl',
  leetcode: 'https://leetcode.com/bharatgl',
  photo: '/me.webp', // cut-out (no background), for the mugshot against the height chart · 52 KB
  heroPhoto: '/me-garden.webp', // full photo, for the polaroid on the opening board · 97 KB
  openToWork: true,
}

export const tape = ['Case #001 is open', 'Full-stack & AI engineer', 'Wanted: by recruiters', 'Last seen in Bengaluru', 'Do not cross: slow code']

export const intro = {
  file: 'Case file #001',
  name: 'Bharat Goyal',
  flag: 'Open',
}

export const hero = {
  sticky: 'New case. Prime suspect: an engineer who leads a team by day and ships AI products by night. Motive unclear.',
  headline: ['BHARAT', 'GOYAL.'],
  role: 'Full-stack engineer with an AI habit. I make slow things fast, messy things simple, and loading spinners nervous.',
  clipping: {
    paper: 'The City Gazette · late edition',
    title: 'Local engineer spotted at both ends of the stack',
    body: 'Witnesses place a Bengaluru engineer in the browser, the API and the release pipeline, sometimes in the same afternoon. His team says he reviews code like a detective reads alibis. Police have no leads. Recruiters do.',
  },
  polaroid: 'The suspect',
  note: 'This one ships.',
  cta: 'Open the case',
}

export const about = {
  label: 'The suspect',
  title: 'About me',
  // the highlighted part of the lead is `leadMark`
  lead: 'Slow pages are my',
  leadMark: 'favourite kind of case.',
  body: [
    'I lead a small team at Kapture CX, so my week is part technical direction, part code review, part mentoring. I still take the hardest problem on the board myself, because a lead who stops shipping stops being useful.',
    'I like problems with a blast radius: one product serving many enterprise clients, where a fix has to land for one of them without breaking anyone else. So I design for configuration over copy-paste, ship behind switches, and test on real phones and real bad Wi-Fi. “It works on my machine” has never once been a valid alibi.',
    'Outside work I build whole products, UI to API to deploy. ForgeFit and the voice agent on this page are both mine, end to end.',
  ],
  facts: [
    ['Name', 'Bharat Goyal'],
    ['Occupation', 'Full-stack engineer · SDE II at Kapture CX'],
    ['Active since', '2022 (3+ years)'],
    ['Last seen', 'Bengaluru · open to remote'],
    ['Known for', 'Speed, ownership, AI products end to end'],
    ['Education', 'B.Tech, GNDEC Punjab'],
  ],
  note: 'Approach with caution. Suspect is armed with a profiler.',
  stamp: 'Open to work',
}

export const trail = {
  label: 'The trail',
  title: 'Experience',
  sub: 'Three stops so far. Fingerprints left at every scene, all of them on the commit history.',
  jobs: [
    {
      role: 'SDE II, Frontend',
      company: 'Kapture CX',
      when: 'Oct 2025 – now',
      where: 'Bengaluru',
      note: 'Currently at large',
      points: [
        'Lead a team of 3 engineers: set technical direction, plan sprints, review code and mentor.',
        'Own the customer-support chat that enterprise clients run on their websites and inside their mobile apps, from design through release and production fixes.',
        'Introduced per-client switches, so the team turns a feature on for a new client with configuration instead of new code.',
        'Run releases across several product lines and environments: versioning, cherry-picks and hotfixes.',
        'Go wherever the feature needs me: a Node config service, the web widget and the admin builder in one change.',
        'Drove the team’s AI work: a prompt-driven chatbot workflow and GenAI dashboards that load 30% faster.',
      ],
    },
    {
      role: 'SDE I, Frontend',
      company: 'Kapture CX',
      when: 'Dec 2023 – Sep 2025',
      where: 'Bengaluru',
      note: 'Promoted (case escalated)',
      points: [
        'React, TypeScript & Redux data tools used by 500K+ enterprise users.',
        'A metadata-driven API config UI that made feature rollouts 30% faster.',
        'Rebuilt performance-critical enterprise screens with better accessibility and test coverage.',
      ],
    },
    {
      role: 'SDE Intern',
      company: 'Skillvalley',
      when: 'Aug 2022 – Nov 2023',
      where: 'Remote',
      note: 'Where the trouble started',
      points: [
        'Full-stack HR & payroll features (React, Node, MongoDB). Payroll errors: down 45%.',
        'Dashboards, reports and PDF workflows that cut manual HR work by 35%.',
      ],
    },
  ],
}

export const evidence = {
  label: 'The evidence',
  title: 'Projects',
  sub: 'Every exhibit: the crime (slow, broken, painful), the fix, and the alibi (the numbers).',
  cases: [
    {
      id: '01',
      title: 'The three-week turnaround',
      org: 'Kapture CX',
      problem: 'Every new client chatbot UI was hand-built. 2–3 weeks, every single time. A crime against calendars.',
      did: 'Built a prompt-driven workflow on Handlebars templates, so new chatbots get configured, not coded.',
      result: '2 days',
      resultLabel: 'Client turnaround',
      stack: ['React', 'Handlebars', 'Prompting'],
    },
    {
      id: '02',
      title: 'The AI coach that talks back',
      org: 'ForgeFit · my own product',
      problem: 'Fitness apps hand everyone the same plan and never listen. Mine talks back. Politely.',
      did: 'Designed, built and shipped an AI coach: a live voice coach with four tools that switches voices instead of hanging up, rep counting that runs on the phone (camera frames never leave it), and AI plans that can’t half-save.',
      result: 'Live',
      resultLabel: 'forgefit.space',
      stack: ['Next.js', 'Fastify', 'MongoDB', 'Gemini Live', 'MediaPipe', 'GCP'],
      link: 'https://forgefit.space',
    },
    {
      id: '03',
      title: 'The plan that can’t half-save',
      org: 'ForgeFit · my own product',
      problem: 'AI models return creative JSON, users double-tap “Generate”, and a crash mid-save leaves you with no plan at all.',
      did: 'Fastify and MongoDB backend: the AI’s output is checked against a schema, a deterministic plan steps in if it fails, a lock stops duplicate runs, and a transaction keeps the old plan until the new one is fully saved.',
      result: '194',
      resultLabel: 'Automated tests in the repo',
      stack: ['Fastify', 'MongoDB', 'zod', 'Gemini', 'Node.js'],
      link: 'https://forgefit.space',
    },
    {
      id: '04',
      title: 'The detective on this page',
      org: 'workbharatgl.online',
      problem: 'Portfolios are monologues. Recruiters have questions at 11 pm.',
      did: 'Built Inspector Byte end to end: live voice from the browser to Gemini Live, a small Node API on Cloud Run that hands out single-use tokens (the key never reaches your browser), Claude for typed questions, an offline fallback, usage caps, and a pipeline that deploys and smoke-tests every push.',
      result: '5 min',
      resultLabel: 'Max call · 4 calls per 10 min',
      stack: ['React', 'Node.js', 'Gemini Live', 'Claude', 'Cloud Run', 'GitHub Actions'],
    },
    {
      id: '05',
      title: 'The rush-hour slowdown',
      org: 'Kapture CX',
      problem: 'A chatbot used by millions slowed down exactly when everyone showed up. Classic.',
      did: 'Profiled the render paths, code-split the heavy parts, memoised the hot ones and shrank the bundle.',
      result: '5M+',
      resultLabel: 'Monthly users kept fast at peak',
      stack: ['React', 'Webpack', 'Profiling'],
    },
    {
      id: '06',
      title: 'The disappearing input box',
      org: 'Kapture CX',
      problem: 'Support chat inside clients’ Android apps: open the keyboard and the input box and the newest replies vanished behind it. Customers were typing blind.',
      did: 'Sized the chat to what’s actually visible (the visual viewport, not 100vh), measured the keyboard and its toolbar separately, kept the newest message in view, and shipped it behind a per-client switch so each app got the fix on its own schedule. Then fixed iOS notches, back navigation and deep links the same way.',
      result: '1 codebase',
      resultLabel: 'Every client app fixed, one rollout at a time',
      stack: ['JavaScript', 'WebView', 'Visual Viewport API', 'Feature flags'],
    },
    {
      id: '07',
      title: 'One input box, three services',
      org: 'Kapture CX',
      problem: 'The AI-agent platform builds chat widgets from config. Clients wanted a rich input (attachments, camera, voice) without someone hand-coding it for each of them.',
      did: 'Built it end to end: default definitions and config merging in the Node config service, so the platform’s AI widget generator can produce it; a small action API in the widget with camera capture, staged attachments and double-send guards; and the admin builder’s live preview.',
      result: '3 services',
      resultLabel: 'Shipped in a week, with unit tests',
      stack: ['Node.js', 'JavaScript', 'Handlebars', 'Unit tests', 'Accessibility'],
    },
    {
      id: '08',
      title: 'The onboarding heist',
      org: 'Kapture CX',
      problem: 'Every enterprise customer needed custom screens, so onboarding moved at the speed of paperwork.',
      did: 'Built configuration-driven, multi-tenant UI systems with Sentry-backed QA loops.',
      result: '−30%',
      resultLabel: 'Onboarding time',
      stack: ['React', 'Redux', 'Sentry'],
    },
    {
      id: '09',
      title: 'Operation Kanoo',
      org: 'Kapture CX',
      problem: 'Performance-critical enterprise screens loaded slowly enough to make tea in between.',
      did: 'Refactored components, compressed the assets and tuned Webpack.',
      result: '35%',
      resultLabel: 'Faster page loads',
      stack: ['React', 'TypeScript', 'Webpack'],
    },
    {
      id: '10',
      title: 'Words into interfaces',
      org: 'Kapture CX',
      problem: 'Shoppers ask in plain language. Most stores answer with a search box and a shrug.',
      did: 'Early build of a platform that turns natural-language requests into real UI (comparisons, selection, checkout) using each client’s own components.',
      result: 'Gen UI',
      resultLabel: 'In the works',
      stack: ['React', 'LLMs', 'Generative UI'],
    },
    // Held back until Bharat confirms how to frame agent-written work (WORK_INVENTORY.md, Q1):
    // {
    //   id: '08',
    //   title: 'The agent squad',
    //   org: 'Splitlink & KagazFlow · my own products',
    //   problem: 'One engineer, two product ideas, no spare month. A classic understaffed precinct.',
    //   did: 'Wrote the specs and architecture, then directed coding agents across parallel git branches, held to tests and CI checks: an offline-first expense-splitting app and a document-reconciliation prototype for accounting firms.',
    //   result: '2 products',
    //   resultLabel: 'Specced and shipped with coding agents',
    //   stack: ['Codex', 'Git worktrees', 'Expo', 'Next.js', 'Supabase'],
    // },
  ],
}

export const tools = {
  label: 'Found at the scene',
  title: 'Skills',
  sub: 'Tools recovered from the scene. Fingerprints confirmed on all of them.',
  groups: [
    { name: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Redux', 'Tailwind', 'Material UI', 'Performance'] },
    { name: 'Backend & cloud', items: ['Node.js', 'Fastify', 'REST', 'GraphQL', 'WebSockets', 'MongoDB', 'SQL', 'Docker', 'GCP Cloud Run', 'GitHub Actions'] },
    { name: 'AI', items: ['LLM integration', 'Structured outputs', 'AI safety checks', 'Real-time voice', 'On-device vision', 'Coding agents'] },
    { name: 'How I work', items: ['Jest', 'CI/CD', 'Webpack', 'Sentry', 'Accessibility', 'Micro-frontends', 'Team lead'] },
  ],
}

// Instagram. Leave `handle` empty to hide a card. Add post/reel URLs to `posts` to embed them.
export const instagram = [
  {
    key: 'tech',
    label: 'Tech & life',
    handle: 'bharatgoyal.jpeg',
    blurb: 'What I’m building (hi, ForgeFit), Bengaluru, and the occasional suspiciously good coffee.',
    posts: [
      'https://www.instagram.com/p/Db7pRUejwtt/',
      'https://www.instagram.com/p/DbgPM_uj3rG/',
      'https://www.instagram.com/p/Da-jWZfD3YO/',
    ],
  },
  {
    key: 'gym',
    label: 'Fitness',
    handle: 'bharatgetsrelentless',
    blurb: 'Fat to fit, naturally. The same stubbornness I bring to a slow page, now with dumbbells.',
    posts: [
      'https://www.instagram.com/reel/DdraK5ThiF3/',
      'https://www.instagram.com/reel/DcwXwV0TiY0/',
      'https://www.instagram.com/reel/Dct5MeETuSC/',
    ],
  },
]

export const offRecord = {
  label: 'Off the record',
  title: 'Beyond the code',
  sub: 'Surveillance footage, voluntarily provided: what I build, and what I lift.',
}

export const interrogation = {
  label: 'The interrogation',
  title: 'Questions, answered',
  sub: 'The usual questions. No lawyer requested.',
  qa: [
    { q: 'What do you do day to day?', a: 'Set direction for my team, unblock people, review code, and keep the hardest technical problem for myself. Lately that’s making our support chat behave like a native part of clients’ mobile apps.' },
    { q: 'What are you strongest at?', a: 'Turning “why is this so slow?” into “oh, that was fast.” Then keeping it that way with tests and monitoring, so it stays solved.' },
    { q: 'Which roles are you looking for?', a: 'Full-stack or product-engineering roles where I own features end to end, from the UI to the API. Bonus points if there’s AI in the product. Extra bonus points if it’s slow right now.' },
    { q: 'Where are you based?', a: 'Bengaluru. Open to remote, hybrid or on-site. Traffic permitting.' },
    { q: 'How soon can you join?', a: 'As soon as my notice period allows. I’ll have read your codebase before day one.' },
    { q: 'How do you work with design and product?', a: 'Early and often. I’d rather question a spec on day one than rebuild it on day ten. Designers get pixel-perfect; PMs get no surprises.' },
  ],
}

export const verdict = {
  label: 'The verdict',
  title: 'Case closed?',
  lead: 'The evidence is in. The jury is you.',
  sub: 'Email me about the role or the problem. I reply to every message, usually within a day, faster if it’s a hard problem.',
  stamp: 'Hire him',
  bigWord: 'CASE CLOSED',
}

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Projects', href: '/projects' },
  { label: 'Skills', href: '/skills' },
  { label: 'Contact', href: '/contact' },
]

// The mystery: five clues hidden around the site, one per section. Find them all, then make the accusation.
export const mystery = {
  title: 'Case #001: the engineer who keeps making things fast',
  clues: [
    { id: 'coffee', section: 'about', icon: 'coffee', label: 'A coffee ring on the file', fact: 'Coffee ring on a sprint plan. Someone runs a team and still writes the hard parts.', hint: 'Check the suspect’s file. Somebody left a mug on it.' },
    { id: 'ticket', section: 'experience', icon: 'ticket', label: 'A train ticket on the trail', fact: 'Train ticket: Skillvalley → Kapture CX → SDE II. Three stops, one direction: up.', hint: 'Follow the trail. Travellers drop things.' },
    { id: 'print', section: 'projects', icon: 'print', label: 'A fingerprint on an exhibit', fact: 'Fingerprints match a fix that reached every client app from one codebase, one switch at a time.', hint: 'Dust the exhibits for prints.' },
    { id: 'note', section: 'skills', icon: 'note', label: 'A torn note among the tools', fact: 'Torn note: “React, Node, AI. Make it fast. Make it simple.” Handwriting matches.', hint: 'Something is tucked between the evidence bags.' },
    { id: 'key', section: 'contact', icon: 'key', label: 'An old key near the verdict', fact: 'A key. It opens exactly one door: the inbox.', hint: 'The last clue is near the verdict.' },
  ],
  question: 'Who is behind all five clues?',
  answers: [
    { id: 'bharat', label: 'Bharat Goyal, full-stack & AI engineer', correct: true },
    { id: 'intern', label: 'The intern', reply: 'The intern has an alibi: he was waiting for the build. Try again.' },
    { id: 'cat', label: 'A suspiciously fast cat', reply: 'Fast, yes. But cats don’t write tests. Try again.' },
  ],
  solved: 'Case solved. The suspect is Bharat Goyal, and he’s open to work.',
}

// Detective-and-developer one-liners, for the "Tell me a joke" button (and Inspector Byte, if asked).
export const jokes = [
  'Why did the frontend developer go broke? He used up all his cache.',
  'I asked the detective how he solves cases so fast. He said: “I just console.log the suspects.”',
  'The bug pleaded not guilty. Unfortunately, the stack trace had fingerprints all over it.',
  'Why don’t detectives trust CSS? Too many things go missing without a trace.',
  'A slow website walks into a police station. The officer says, “We’ll get back to you… eventually.”',
  'What do you call a detective who only works on front ends? A div-ective.',
  'The case went cold. So I added a loading spinner and called it a feature.',
  '“Where were you on the night of the deploy?” “In production, officer. Unfortunately.”',
]

// How things are built, for Inspector Byte's "system design" answers. Only facts from the code.
export const architecture = [
  'ForgeFit: Next.js front end calls the API through a same-origin proxy that signs a 5-minute token; the Fastify API checks issuer, audience and subject. Modular monolith with domain modules, a separate AI package and shared types.',
  'ForgeFit data: MongoDB. Plan generation uses a TTL lock against duplicate runs and a transaction so the old plan is archived only after the new one is saved; workout updates use optimistic concurrency.',
  'ForgeFit AI: provider-neutral layer (Gemini, OpenAI, Anthropic), schema-checked output with a deterministic fallback, a safety check before any model call. Live voice uses single-use, model-locked tokens and fails over to a second voice provider after 3 failed reconnects. Rep counting runs on the phone with MediaPipe; only rep events reach the API.',
  'ForgeFit deploy: GitHub Actions runs typecheck, lint, tests and build, then deploys to GCP with no stored keys and smoke-tests production.',
  'Kapture CX chat widget (public-safe summary): a multi-tenant support chat embedded on clients’ websites and inside their mobile apps. Bharat ships features behind per-client switches so one codebase serves every client without regressions. He built a config-driven input box across three services: defaults and config merging in a Node config service (with unit tests), a client-side action API in the widget for camera capture and attachments, and the admin builder preview. Never name clients or internal systems.',
  'This site: static React site on Firebase Hosting CDN; /api goes to a Node service on Cloud Run (scales to zero, max 5 instances). The API hands out single-use Gemini Live tokens so the key never reaches the browser; audio flows browser to Gemini directly. Rate limits and call caps protect it. Every push deploys and smoke-tests itself.',
]

// The plain 30-second summary for recruiters in a hurry (no theme, no puns).
export const summary = {
  title: 'Bharat Goyal, Full-Stack & AI Engineer',
  line: 'SDE II at Kapture CX, Bengaluru. Leads a team of 3 and owns the support chat enterprise clients run on web and in their mobile apps. 3+ years with React, TypeScript and Node.',
  wins: [
    'Cut client chatbot delivery from 2–3 weeks to about 2 days with a prompt-driven UI workflow.',
    'Kept a chatbot used by 5M+ people a month fast at peak traffic (profiling, code-splitting, smaller bundles).',
    'Built and shipped ForgeFit end to end: Next.js, a Fastify and MongoDB API, a real-time voice coach and rep counting that runs on the phone.',
  ],
  stack: 'React · TypeScript · Next.js · Node.js · Fastify · MongoDB · LLM integration · GCP',
  where: 'Bengaluru, India · open to remote, hybrid or on-site · available after notice period',
}
