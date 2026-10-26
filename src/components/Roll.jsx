// Text that rolls up letter-by-letter on hover (a copy slides in from below).
export default function Roll({ children, className = '' }) {
  const text = String(children)
  const letters = Array.from(text)
  return (
    <span className={`roll ${className}`} aria-label={text}>
      {letters.map((ch, i) => (
        <span className="roll-ch" key={i} style={{ '--i': i }} aria-hidden="true">
          <span>{ch === ' ' ? ' ' : ch}</span>
          <span>{ch === ' ' ? ' ' : ch}</span>
        </span>
      ))}
    </span>
  )
}
