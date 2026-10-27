// All site copy lives here. Edit freely.
// Voice: lowercase, casual, confident, a little cheeky. Headings stay plain for recruiters.
export const site = {
  name: 'Bharat Goyal',
  role: 'Frontend & AI Engineer',
  location: 'Bengaluru, India',
  email: 'goyalbharat9977@gmail.com',
  resume: '/resume.pdf',
  linkedin: 'https://www.linkedin.com/in/YOUR-HANDLE',
  github: 'https://github.com/YOUR-HANDLE',
  leetcode: 'https://leetcode.com/YOUR-HANDLE',
  photo: '/me.png', // cut-out (no background), for the mugshot against the height chart
  heroPhoto: '/me-garden.jpg', // full photo, for the polaroid on the opening board
  openToWork: true,
}

export const tape = ['case #001 is open', 'frontend & AI engineer', 'available for new roles', 'bengaluru / remote']

export const intro = {
  file: 'case file #001',
  name: 'bharat goyal',
  flag: 'open',
}

export const hero = {
  hello: 'hello',
  namePlaceholder: 'first name',
  stickyEnd: 'welcome to the case, detective.',
  headline: ['MEET', 'BHARAT.'],
  role: 'frontend & AI engineer. i make slow things fast and messy things simple.',
  clipping: {
    paper: 'the city gazette · late edition',
    title: 'local engineer turns 3 weeks into 2 days',
    body: 'sources confirm a frontend engineer in bengaluru has been quietly making products faster for 5M+ people. police have no leads. recruiters do.',
  },
  polaroid: 'the suspect',
  note: 'this one ships.',
  cta: 'open the case',
}

export const about = {
  label: 'the suspect',
  title: 'About me',
  lead: 'i’m your person to get it shipped.',
  body: [
    'i’ve turned three-week client builds into two-day ones. i’ve kept a chatbot fast for 5 million people at rush hour. i lead a squad of three, and i still review every PR like it’s my own.',
    'name the problem. if i haven’t solved it yet, give me a weekend. whatever the stack, i don’t ship “it works on my machine”.',
  ],
  facts: [
    ['name', 'Bharat Goyal'],
    ['occupation', 'SDE II, Frontend · Kapture CX'],
    ['active since', '2022 (3+ years)'],
    ['last seen', 'Bengaluru · open to remote'],
    ['known for', 'speed, ownership, AI features'],
    ['education', 'B.Tech, GNDEC Punjab'],
  ],
  note: 'suspect is relentless. approach with a hard problem.',
  stamp: 'open to work',
}

export const trail = {
  label: 'the trail',
  title: 'Experience',
  sub: 'three stops so far. each one left fingerprints.',
  jobs: [
    {
      role: 'SDE II, Frontend',
      company: 'Kapture CX',
      when: 'oct 2025 – now',
      where: 'Bengaluru',
      note: 'currently here',
      points: [
        'lead a team of 3 frontend engineers: direction, sprint planning, code reviews, mentoring.',
        'built a prompt-driven chatbot UI workflow. client turnaround: 2–3 weeks → about 2 days.',
        'cut peak-traffic latency for a chatbot with 5M+ monthly users (profiling, code-splitting, bundle diet).',
        'GenAI dashboards that load 30% faster; config-driven multi-tenant UIs that cut onboarding by 30%.',
      ],
    },
    {
      role: 'SDE I, Frontend',
      company: 'Kapture CX',
      when: 'dec 2023 – sep 2025',
      where: 'Bengaluru',
      note: 'promoted',
      points: [
        'React, TypeScript & Redux data tools used by 500K+ enterprise users.',
        'a metadata-driven API config UI that made feature rollouts 30% faster.',
        'Kanoo Travel revamp: 35% faster page loads, better accessibility and test coverage.',
      ],
    },
    {
      role: 'SDE Intern',
      company: 'Skillvalley',
      when: 'aug 2022 – nov 2023',
      where: 'remote',
      note: 'where it started',
      points: [
        'full-stack HR & payroll features (React, Node, MongoDB). payroll errors: down 45%.',
        'dashboards, reports and PDF workflows that cut manual HR work by 35%.',
      ],
    },
  ],
}

export const evidence = {
  label: 'the evidence',
  title: 'Projects',
  sub: 'every case: what was broken, what i did, what changed.',
  cases: [
    {
      id: '01',
      title: 'the three-week turnaround',
      org: 'Kapture CX',
      problem: 'every new client chatbot UI was hand-built. 2–3 weeks, every single time.',
      did: 'built a prompt-driven workflow on Handlebars templates, so new chatbots get configured, not coded.',
      result: '2 days',
      resultLabel: 'client turnaround',
      stack: ['React', 'Handlebars', 'Prompting'],
    },
    {
      id: '02',
      title: 'the AI coach that talks back',
      org: 'ForgeFit · my own product',
      problem: 'fitness apps hand everyone the same plan and never listen.',
      did: 'designed, built and shipped an AI coach: provider-neutral AI layer, structured plans with safety checks, real-time voice and on-device pose tracking.',
      result: 'live',
      resultLabel: 'forgefit.space',
      stack: ['Next.js', 'TypeScript', 'Fastify', 'MongoDB', 'GCP'],
      link: 'https://forgefit.space',
    },
    {
      id: '03',
      title: 'rush hour at 5 million',
      org: 'Kapture CX',
      problem: 'a chatbot used by 5M+ people a month slowed down exactly when it mattered.',
      did: 'profiled the render paths, code-split the heavy bits, memoised the hot ones and put the bundle on a diet.',
      result: '5M+',
      resultLabel: 'users kept fast',
      stack: ['React', 'Webpack', 'Profiling'],
    },
    {
      id: '04',
      title: 'words into interfaces',
      org: 'Kapture CX',
      problem: 'shoppers ask in plain language. most stores answer with a search box.',
      did: 'early build of a platform that turns natural-language requests into real UI (comparisons, selection, checkout) using each client’s own components.',
      result: 'gen UI',
      resultLabel: 'in the works',
      stack: ['React', 'LLMs', 'Generative UI'],
    },
    {
      id: '05',
      title: 'the onboarding heist',
      org: 'Kapture CX',
      problem: 'every enterprise customer needed custom screens, so onboarding dragged on.',
      did: 'built configuration-driven, multi-tenant UI systems with Sentry-backed QA loops.',
      result: '−30%',
      resultLabel: 'onboarding time',
      stack: ['React', 'Redux', 'Sentry'],
    },
    {
      id: '06',
      title: 'operation kanoo',
      org: 'Kapture CX',
      problem: 'performance-critical enterprise screens took their sweet time to load.',
      did: 'refactored components, squeezed the assets and tuned Webpack.',
      result: '35%',
      resultLabel: 'faster page loads',
      stack: ['React', 'TypeScript', 'Webpack'],
    },
  ],
}

export const tools = {
  label: 'found at the scene',
  title: 'Skills',
  sub: 'fingerprints on all of them.',
  groups: [
    { name: 'frontend', items: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Redux', 'Tailwind', 'Material UI', 'performance'] },
    { name: 'backend & cloud', items: ['Node.js', 'Fastify', 'REST', 'GraphQL', 'WebSockets', 'MongoDB', 'SQL', 'Docker', 'GCP'] },
    { name: 'AI', items: ['LLM integration', 'structured outputs', 'AI safety checks', 'voice UIs'] },
    { name: 'how i work', items: ['DSA', 'Jest', 'CI/CD', 'Webpack', 'Sentry', 'accessibility', 'micro-frontends', 'team lead'] },
  ],
}

// Instagram. Leave `handle` empty to hide a card. Add post/reel URLs to `posts` to embed them.
export const instagram = [
  {
    key: 'tech',
    label: 'tech & life',
    handle: 'bharatgoyal.jpeg',
    blurb: 'what i’m building (hi, ForgeFit), bengaluru, and everything in between.',
    posts: [
      'https://www.instagram.com/p/Db7pRUejwtt/',
      'https://www.instagram.com/p/DbgPM_uj3rG/',
      'https://www.instagram.com/p/Da-jWZfD3YO/',
    ],
  },
  {
    key: 'gym',
    label: 'fitness',
    handle: 'bharatgetsrelentless',
    blurb: 'fat to fit, naturally. the same stubbornness i bring to a slow page.',
    posts: [
      'https://www.instagram.com/reel/DdraK5ThiF3/',
      'https://www.instagram.com/reel/DcwXwV0TiY0/',
      'https://www.instagram.com/reel/Dct5MeETuSC/',
    ],
  },
]

export const offRecord = {
  label: 'off the record',
  title: 'Beyond the code',
  sub: 'where i post what i build, and where i pick heavy things up.',
}

export const interrogation = {
  label: 'the interrogation',
  title: 'Before you ask',
  sub: 'answers on the record.',
  qa: [
    { q: 'how soon can you start?', a: 'as soon as my notice period lets me. i’ll have read your codebase before day one.' },
    { q: 'what kind of role are you after?', a: 'frontend or full-stack, where i own the UI end to end. bonus points if there’s AI in it.' },
    { q: 'remote, hybrid or office?', a: 'bengaluru-based. happy with remote, hybrid or on-site.' },
    { q: 'who should not hire you?', a: 'teams that want tickets closed, not problems solved. i will ask “why” in sprint planning.' },
    { q: 'fastest way to get your best work?', a: 'a hard problem, real users and honest feedback. then let me run.' },
    { q: 'what makes you dangerous?', a: 'ownership + a profiler.' },
    { q: 'what do you still suck at?', a: 'leaving a slow page alone. it’s a condition.' },
  ],
}

export const verdict = {
  label: 'the verdict',
  title: 'Case closed?',
  lead: 'all the evidence points one way.',
  sub: 'the fastest way to close this case: say hi. i reply to every message, usually within a day.',
  stamp: 'hire him',
  bigWord: 'CASE CLOSED',
}

export const nav = [
  { label: 'about', href: '/about' },
  { label: 'experience', href: '/experience' },
  { label: 'projects', href: '/projects' },
  { label: 'skills', href: '/skills' },
  { label: 'contact', href: '/contact' },
]
