// Everything Inspector knows about Bharat, built from content.js so it never drifts
// from the site. Used by the AI endpoint (as its "case file") and by the offline engine.
import { site, about, trail, evidence, tools, interrogation, instagram, architecture } from '../content.js'

export const INSPECTOR = {
  name: 'Inspector Byte',
  greeting:
    'Evening, detective. I’m Inspector Byte, I’ve been tailing Bharat for a while. Ask me anything about him: his work, his stack, or how to hire him.',
  quickBack: 'What else do you want to know about Bharat?',
  quick: ['What’s his experience?', 'What’s his tech stack?', 'Best project?', 'Is he open to work?', 'How do I contact him?'],
}

export function caseFile() {
  const jobs = trail.jobs
    .map((j) => `- ${j.role} at ${j.company} (${j.when}, ${j.where}): ${j.points.join(' ')}`)
    .join('\n')
  const projects = evidence.cases
    .map((c) => `- ${c.title} (${c.org}): problem: ${c.problem} what he did: ${c.did} result: ${c.result} ${c.resultLabel}. stack: ${c.stack.join(', ')}.${c.link ? ` link: ${c.link}` : ''}`)
    .join('\n')
  const skills = tools.groups.map((g) => `- ${g.name}: ${g.items.join(', ')}`).join('\n')
  const faq = interrogation.qa.map((x) => `- Q: ${x.q} A: ${x.a}`).join('\n')
  const facts = about.facts.map(([k, v]) => `- ${k}: ${v}`).join('\n')
  const ig = instagram.filter((a) => a.handle).map((a) => `- ${a.label}: instagram.com/${a.handle} (${a.blurb})`).join('\n')
  return `NAME: ${site.name}
ROLE: ${site.role}
LOCATION: ${site.location}
OPEN TO WORK: ${site.openToWork ? 'Yes, full-stack, product-engineering and AI engineering roles; remote, hybrid or on-site' : 'Not right now'}
CONTACT: email ${site.email}; résumé at /resume.pdf on this site

QUICK FACTS
${facts}

SUMMARY
${about.body.join(' ')}

EXPERIENCE
${jobs}

PROJECTS
${projects}

SKILLS
${skills}

HOW THINGS ARE BUILT (use for system design and architecture questions)
${architecture.map((a) => `- ${a}`).join('\n')}

ON THE RECORD (FAQ)
${faq}

SOCIAL
${ig}`
}
