// Inspector Byte, full figure (original artwork). Driven entirely by props:
// mouth: 'rest' | 'open' | 'wide' | 'o' | 'smile'  (lip-sync shapes)
// mood:  'idle' | 'talking' | 'listening' | 'thinking'
// look:  { x, y } in -1..1, where his eyes look (e.g. toward the cursor)
const MOUTHS = {
  rest: 'M134 214 Q150 219 166 214 Q150 222 134 214 Z',
  smile: 'M132 211 Q150 226 168 211 Q150 220 132 211 Z',
  open: 'M136 211 Q150 206 164 211 Q162 226 150 228 Q138 226 136 211 Z',
  wide: 'M131 210 Q150 204 169 210 Q166 232 150 234 Q134 232 131 210 Z',
  o: 'M142 210 Q150 205 158 210 Q160 224 150 227 Q140 224 142 210 Z',
}

export default function InspectorFigure({ mouth = 'rest', mood = 'idle', look = { x: 0, y: 0 }, className = '' }) {
  const ex = Math.max(-1, Math.min(1, look.x)) * 4
  const ey = Math.max(-1, Math.min(1, look.y)) * 3
  return (
    <svg className={`fig fig--${mood} ${className}`} viewBox="0 0 300 380" role="img" aria-label="Inspector Byte, a cartoon police detective">
      <defs>
        <linearGradient id="fig-uniform" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3c63" />
          <stop offset="1" stopColor="#18233d" />
        </linearGradient>
        <linearGradient id="fig-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ebb284" />
          <stop offset="1" stopColor="#d6955f" />
        </linearGradient>
      </defs>

      {/* ---- body ---- */}
      <g className="fig-body">
        <path d="M40 380 C42 318 74 288 112 280 L188 280 C226 288 258 318 260 380 Z" fill="url(#fig-uniform)" />
        {/* shirt + tie */}
        <path d="M122 280 L150 330 L178 280 Z" fill="#dfe6f2" />
        <path d="M144 288 L156 288 L160 340 L150 354 L140 340 Z" fill="#141c30" />
        {/* collar */}
        <path d="M112 280 L150 318 L132 272 Z M188 280 L150 318 L168 272 Z" fill="#22335a" />
        {/* epaulettes */}
        <rect x="64" y="292" width="44" height="12" rx="4" fill="#ffd23f" transform="rotate(-14 86 298)" />
        <rect x="192" y="292" width="44" height="12" rx="4" fill="#ffd23f" transform="rotate(14 214 298)" />
        {/* badge */}
        <g transform="translate(196 322)">
          <path d="M0 -15 L13 -8 L13 6 L0 14 L-13 6 L-13 -8 Z" fill="#ffd23f" stroke="#a87b0b" strokeWidth="2" />
          <text y="4.5" textAnchor="middle" fontFamily="Bebas Neue, Arial Narrow, sans-serif" fontSize="12" fill="#5a3f00">BG</text>
        </g>
        {/* buttons */}
        <circle cx="150" cy="364" r="3" fill="#ffd23f" />
      </g>

      {/* ---- left arm holding the notepad (scribbles while thinking) ---- */}
      <g className="fig-arm-l">
        <path d="M70 330 C58 352 70 372 96 366 L112 360" stroke="#22335a" strokeWidth="26" strokeLinecap="round" fill="none" />
        <g className="fig-pad" transform="translate(96 330) rotate(-12)">
          <rect x="0" y="0" width="46" height="58" rx="3" fill="#f4eddc" stroke="#8b7d5e" strokeWidth="2" />
          <rect x="0" y="0" width="46" height="9" rx="2" fill="#c0392b" />
          <path className="fig-scribble" d="M8 20 h28 M8 30 h22 M8 40 h26" stroke="#2449b8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="112" cy="362" r="11" fill="url(#fig-skin)" />
      </g>

      {/* ---- right arm (points at the bubble while talking) ---- */}
      <g className="fig-arm-r">
        <path d="M232 326 C252 300 262 270 270 246" stroke="#22335a" strokeWidth="26" strokeLinecap="round" fill="none" />
        <g transform="translate(272 236)">
          <circle r="13" fill="url(#fig-skin)" />
          <path d="M4 -10 C10 -24 14 -30 18 -34" stroke="url(#fig-skin)" strokeWidth="8" strokeLinecap="round" />
        </g>
      </g>

      {/* ---- head ---- */}
      <g className="fig-head">
        {/* neck */}
        <rect x="132" y="244" width="36" height="40" rx="10" fill="#cf8f5b" />
        {/* ears */}
        <ellipse cx="88" cy="176" rx="12" ry="18" fill="#d6955f" />
        <ellipse cx="212" cy="176" rx="12" ry="18" fill="#d6955f" />
        {/* face */}
        <path d="M90 150 C90 108 210 108 210 150 L210 190 C210 238 182 258 150 258 C118 258 90 238 90 190 Z" fill="url(#fig-skin)" />
        {/* cheeks */}
        <ellipse cx="112" cy="204" rx="11" ry="7" fill="#e07a5f" opacity=".35" />
        <ellipse cx="188" cy="204" rx="11" ry="7" fill="#e07a5f" opacity=".35" />

        {/* brows */}
        <path className="fig-brow fig-brow--l" d="M108 156 Q122 146 136 154" stroke="#3b2414" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="fig-brow fig-brow--r" d="M164 154 Q178 146 192 156" stroke="#3b2414" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* eyes */}
        <g className="fig-eyes">
          <ellipse cx="122" cy="174" rx="11" ry="12" fill="#fff" />
          <ellipse cx="178" cy="174" rx="11" ry="12" fill="#fff" />
          <g transform={`translate(${ex} ${ey})`}>
            <circle cx="122" cy="175" r="6.5" fill="#1b1410" />
            <circle cx="178" cy="175" r="6.5" fill="#1b1410" />
            <circle cx="124.5" cy="172.5" r="2.2" fill="#fff" />
            <circle cx="180.5" cy="172.5" r="2.2" fill="#fff" />
          </g>
          <rect className="fig-lid fig-lid--l" x="109" y="160" width="26" height="28" rx="12" fill="url(#fig-skin)" />
          <rect className="fig-lid fig-lid--r" x="165" y="160" width="26" height="28" rx="12" fill="url(#fig-skin)" />
        </g>

        {/* nose */}
        <path d="M150 176 C140 194 142 200 156 199" stroke="#b8774a" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* mouth: lip-sync shapes */}
        <path className="fig-mouth" d={MOUTHS[mouth] ?? MOUTHS.rest} fill="#6d2a1d" />
        {(mouth === 'open' || mouth === 'wide') && <path d="M140 222 Q150 228 160 222" stroke="#e8817a" strokeWidth="4" strokeLinecap="round" fill="none" />}

        {/* mustache (bounces while talking) */}
        <path className="fig-stache" d="M150 203 C138 194 116 196 104 210 C118 216 138 213 150 207 C162 213 182 216 196 210 C184 196 162 194 150 203 Z" fill="#2a1a10" />

        {/* cap */}
        <g className="fig-cap">
          <path d="M78 122 C82 68 218 68 222 122 Z" fill="#20304f" />
          <rect x="78" y="114" width="144" height="18" rx="5" fill="#141f36" />
          {/* checker band */}
          <g fill="#f4eddc">
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={82 + i * 16} y={i % 2 ? 123 : 115} width="8" height="8" />
            ))}
          </g>
          <path d="M84 132 C112 150 188 150 216 132 L218 140 C190 160 110 160 82 140 Z" fill="#0d1526" />
          <path d="M150 74 L166 83 L166 101 L150 110 L134 101 L134 83 Z" fill="#ffd23f" stroke="#a87b0b" strokeWidth="2.5" />
          <text x="150" y="98" textAnchor="middle" fontFamily="Bebas Neue, Arial Narrow, sans-serif" fontSize="15" fill="#5a3f00">BG</text>
        </g>
      </g>
    </svg>
  )
}
