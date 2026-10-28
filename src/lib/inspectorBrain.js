// Offline answer engine: scores the question against intents and answers from the site's own
// content. Used when the AI endpoint is unavailable (no key, offline, rate-limited, error).
import { site, trail, evidence, tools, instagram, jokes } from '../content.js'

const norm = (s) =>
  ` ${s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9+.#\s]/g, ' ').replace(/\s+/g, ' ')} `

const forge = evidence.cases.find((c) => /forgefit/i.test(c.org + c.title))
const gym = instagram.find((a) => a.key === 'gym' && a.handle)
const tech = instagram.find((a) => a.key === 'tech' && a.handle)
const group = (name) => tools.groups.find((g) => g.name.toLowerCase().includes(name))?.items.join(', ')

// Each intent: words/phrases that signal it (weighted), and an answer.
const INTENTS = [
  {
    id: 'greet',
    keys: ['hi', 'hello', 'hey', 'yo', 'namaste', 'good morning', 'good evening', 'who are you', 'sup'],
    weak: true,
    answer: () => 'evening, detective. i keep the file on Bharat Goyal, a full-stack & AI engineer in Bengaluru. ask me about his experience, projects, stack, or how to reach him.',
  },
  {
    id: 'about',
    keys: ['who is', 'about him', 'tell me about', 'about bharat', 'summary', 'introduce', 'background', 'who is bharat', 'profile'],
    answer: () =>
      `Bharat Goyal is a frontend-led full-stack engineer with 3+ years building React & TypeScript products for 5M+ users. He’s SDE II at Kapture CX, leads a team of 3, and builds AI products on the side, like ForgeFit.`,
  },
  {
    id: 'experience',
    keys: ['experience', 'years', 'work history', 'worked', 'career', 'jobs', 'companies', 'employment', 'how long'],
    answer: () =>
      `3+ years so far: ${trail.jobs.map((j) => `${j.role} at ${j.company} (${j.when})`).join('; ')}. Want details on any of them?`,
  },
  {
    id: 'current',
    keys: ['current', 'currently', 'now', 'present', 'kapture', 'company', 'where does he work', 'role', 'designation', 'title'],
    answer: () => {
      const j = trail.jobs[0]
      return `He’s currently ${j.role} at ${j.company} in ${j.where}. ${j.points[0]} ${j.points[1]}`
    },
  },
  {
    id: 'stack',
    keys: ['stack', 'tech', 'skills', 'technologies', 'languages', 'tools', 'react', 'typescript', 'javascript', 'next', 'node', 'framework'],
    answer: () => `Frontend: ${group('frontend')}. Backend & cloud: ${group('backend')}. AI: ${group('ai')}.`,
  },
  {
    id: 'ai',
    boost: 1.5,
    keys: ['ai', 'llm', 'gpt', 'claude', 'genai', 'gen ai', 'machine learning', 'ml', 'prompt', 'chatbot', 'artificial'],
    answer: () =>
      `AI is where he’s heading. He’s built LLM integrations with structured outputs and safety checks, voice coaching, GenAI dashboards and early generative-UI work at Kapture CX, plus ForgeFit, an AI fitness coach he shipped end to end.`,
  },
  {
    id: 'projects',
    keys: ['project', 'projects', 'best', 'proud', 'built', 'portfolio', 'work samples', 'case', 'achievement', 'impact'],
    answer: () =>
      `Top exhibits: ${evidence.cases
        .slice(0, 3)
        .map((c) => `${c.title} (${c.result} ${c.resultLabel})`)
        .join('; ')}. The full list is in the Projects section.`,
  },
  {
    id: 'forgefit',
    boost: 3, // a specific name beats generic phrasing like “tell me about”
    keys: ['forgefit', 'forge fit', 'fitness app', 'side project', 'personal project', 'startup', 'product'],
    answer: () => (forge ? `${forge.title}: ${forge.did} It’s live at ${forge.link?.replace('https://', '')}.` : 'He has a side product in the works. Ask him about it.'),
  },
  {
    id: 'perf',
    keys: ['performance', 'fast', 'speed', 'optimi', 'latency', 'webpack', 'bundle', 'slow', 'load time'],
    answer: () =>
      'Performance is his favourite crime scene: he cut peak-traffic latency for a chatbot with 5M+ monthly users, made Kanoo Travel’s pages 35% faster, and sped GenAI dashboards up by 30%.',
  },
  {
    id: 'lead',
    keys: ['lead', 'leadership', 'manage', 'team', 'mentor', 'senior', 'squad'],
    answer: () => 'Yes, he leads a team of 3 engineers at Kapture CX: technical direction, sprint planning, code reviews and mentoring.',
  },
  {
    id: 'open',
    keys: ['open to work', 'available', 'availability', 'looking', 'job', 'hiring', 'hire', 'opportunit', 'role are you', 'interested', 'switch'],
    answer: () =>
      site.openToWork
        ? `Yes, he’s open to frontend, full-stack and AI engineering roles. Best move: email ${site.email}.`
        : `He’s not actively looking, but you can still reach him at ${site.email}.`,
  },
  {
    id: 'notice',
    keys: ['notice', 'join', 'start', 'when can', 'how soon', 'joining'],
    answer: () => 'After his standard notice period. He’s happy to start getting familiar with your codebase and team before day one.',
  },
  {
    id: 'location',
    keys: ['location', 'where', 'based', 'city', 'remote', 'relocat', 'onsite', 'on site', 'hybrid', 'bengaluru', 'bangalore', 'office'],
    answer: () => 'He’s based in Bengaluru, India, and open to remote, hybrid or on-site roles.',
  },
  {
    id: 'contact',
    keys: ['contact', 'email', 'mail', 'reach', 'talk to', 'call', 'phone', 'number', 'connect', 'message'],
    answer: () => `Email is fastest: ${site.email}. He replies to every message, usually within a day. You’ll also find a mail button and his links at the bottom of the page.`,
  },
  {
    id: 'resume',
    keys: ['resume', 'résumé', 'cv', 'pdf', 'download'],
    answer: () => 'His résumé is right here: /resume.pdf (there’s also a “résumé” button at the top of the page).',
  },
  {
    id: 'education',
    keys: ['education', 'degree', 'college', 'university', 'btech', 'b.tech', 'study', 'studied', 'graduat'],
    answer: () => 'B.Tech from Guru Nanak Dev Engineering College, Punjab (2018–2022). He also ranked 759 of 35,299 in Newton School’s Triwizard contest.',
  },
  {
    id: 'dsa',
    keys: ['dsa', 'leetcode', 'algorithm', 'data structure', 'competitive', 'coding test'],
    answer: () => 'He’s solid on DSA: 154/174 in GeeksforGeeks Job-a-thon 12 and rank 759 of 35,299 in Newton School’s Triwizard contest.',
  },
  {
    id: 'strength',
    keys: ['strength', 'strong', 'good at', 'best at', 'why hire', 'why should', 'stand out', 'unique', 'dangerous'],
    answer: () => 'Ownership plus a profiler. He’s strongest at React & TypeScript architecture and frontend performance, and he increasingly ships AI features end to end.',
  },
  {
    id: 'weakness',
    keys: ['weakness', 'weak', 'suck', 'improve', 'bad at'],
    answer: () => 'By his own confession: he can’t leave a slow page alone. It’s a condition.',
  },
  {
    id: 'fitness',
    keys: ['gym', 'fitness', 'workout', 'fit', 'lift', 'hobby', 'hobbies', 'free time', 'outside work', 'instagram'],
    answer: () =>
      gym
        ? `Off the clock he trains: a fat-to-fit journey, done naturally. He posts it at instagram.com/${gym.handle}.${tech ? ` The tech-and-life side is at instagram.com/${tech.handle}.` : ''}`
        : 'Off the clock he trains and builds side projects.',
  },
  {
    id: 'links',
    keys: ['linkedin', 'github', 'social', 'links', 'twitter'],
    answer: () => `All his links (LinkedIn, GitHub, LeetCode, résumé) are in the contact section at the bottom, or email ${site.email}.`,
  },
  {
    id: 'salary',
    keys: ['salary', 'ctc', 'compensation', 'pay', 'package', 'expected', 'lpa', 'money'],
    answer: () => `That’s one for Bharat directly. Email ${site.email} and he’ll talk numbers.`,
  },
  {
    id: 'thanks',
    keys: ['thanks', 'thank you', 'cool', 'great', 'awesome', 'nice', 'ok', 'okay', 'bye'],
    weak: true,
    answer: () => `anytime, detective. when you’re ready to close the case: ${site.email}.`,
  },
]

/** Returns a short answer for `question` from the site's content. */
export function answerOffline(question) {
  const q = norm(question)
  if (/ (joke|funny|laugh|make me smile) /.test(q)) return jokes[Math.floor(Math.random() * jokes.length)]
  let best = null
  let bestScore = 0
  for (const intent of INTENTS) {
    let score = 0
    for (const k of intent.keys) {
      const key = k.toLowerCase()
      // whole-word match for short keys, substring for longer stems
      const hit = key.length <= 3 ? q.includes(` ${key} `) : q.includes(key)
      if (hit) score += key.includes(' ') ? 3 : key.length > 5 ? 2 : 1
    }
    if (intent.boost) score *= intent.boost
    if (intent.weak) score *= 0.9 // greetings/thanks lose ties to real questions
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }
  if (!best || bestScore <= 0) {
    return `that one’s not in my file, detective. ask about his experience, projects, stack or availability, or ask Bharat directly at ${site.email}.`
  }
  return best.answer()
}
