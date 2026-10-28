import { useEffect, useState } from 'react'

const EVENT = 'cf:email-copied'

/**
 * Click handler for "Email me" links: the mailto still opens a mail app if there is one,
 * and the address is copied too, because mailto does nothing for people who use webmail.
 */
export async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: email }))
  } catch {}
}

/** Small note that confirms the copy. Mounted once in App. */
export default function EmailToast() {
  const [email, setEmail] = useState('')
  useEffect(() => {
    let t
    const on = (e) => {
      setEmail(e.detail)
      clearTimeout(t)
      t = setTimeout(() => setEmail(''), 2600)
    }
    window.addEventListener(EVENT, on)
    return () => {
      window.removeEventListener(EVENT, on)
      clearTimeout(t)
    }
  }, [])
  return (
    <p className={`email-toast ${email ? 'is-on' : ''}`} role="status" aria-live="polite">
      {email && (
        <>
          Email copied: <b>{email}</b>
        </>
      )}
    </p>
  )
}
