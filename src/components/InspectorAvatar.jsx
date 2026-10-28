// Original cartoon detective-cop: peaked cap with a "BG" badge, big mustache, notepad-ready grin.
// `talking` animates the mustache/mouth while he speaks; `listening` raises an eyebrow.
export default function InspectorAvatar({ size = 64, talking = false, listening = false, className = '' }) {
  return (
    <svg className={`insp-av ${talking ? 'is-talking' : ''} ${listening ? 'is-listening' : ''} ${className}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="58" fill="#1c2233" />
      {/* ears */}
      <ellipse cx="28" cy="70" rx="7" ry="10" fill="#c98b5e" />
      <ellipse cx="92" cy="70" rx="7" ry="10" fill="#c98b5e" />
      {/* face */}
      <path d="M30 58 C30 38 90 38 90 58 L90 76 C90 96 76 106 60 106 C44 106 30 96 30 76 Z" fill="#e0a374" />
      {/* cap */}
      <path d="M22 44 C26 18 94 18 98 44 Z" fill="#20304f" />
      <rect x="22" y="40" width="76" height="9" rx="3" fill="#162238" />
      <path d="M26 49 C40 58 80 58 94 49 L94 53 C80 62 40 62 26 53 Z" fill="#0d1526" />
      {/* badge */}
      <path d="M60 22 L69 27 L69 37 L60 42 L51 37 L51 27 Z" fill="#ffd23f" stroke="#a87b0b" strokeWidth="1.5" />
      <text x="60" y="35.5" textAnchor="middle" fontFamily="Bebas Neue, Arial Narrow, sans-serif" fontSize="9" fill="#5a3f00">BG</text>
      {/* brows */}
      <path className="insp-brow insp-brow--l" d="M38 62 Q46 57 53 61" stroke="#3b2414" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path className="insp-brow insp-brow--r" d="M67 61 Q74 57 82 62" stroke="#3b2414" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* eyes */}
      <g className="insp-eyes">
        <ellipse cx="46" cy="69" rx="4" ry="4.5" fill="#1b1410" />
        <ellipse cx="74" cy="69" rx="4" ry="4.5" fill="#1b1410" />
        <circle cx="47.4" cy="67.6" r="1.4" fill="#fff" />
        <circle cx="75.4" cy="67.6" r="1.4" fill="#fff" />
      </g>
      {/* nose */}
      <path d="M60 70 C56 80 58 84 63 84" stroke="#b8774a" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* mouth (opens while talking) */}
      <ellipse className="insp-mouth" cx="60" cy="96" rx="6" ry="2.5" fill="#6d2a1d" />
      {/* mustache */}
      <path className="insp-stache" d="M60 86 C52 82 40 84 34 92 C42 94 52 93 60 90 C68 93 78 94 86 92 C80 84 68 82 60 86 Z" fill="#2a1a10" />
    </svg>
  )
}
