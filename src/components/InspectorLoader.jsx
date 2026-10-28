import { Suspense, lazy, useEffect, useState } from 'react'
import InspectorAvatar from './InspectorAvatar.jsx'

// Inspector Byte (stage, voice call, offline brain) is the biggest part of the app and nobody needs it
// in the first second, so it loads in its own file once the page is idle. Until then a look-alike
// badge sits in its place; tapping it loads him straight away and opens him as soon as he arrives.
const Inspector = lazy(() => import('./Inspector.jsx'))

export default function InspectorLoader() {
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const go = () => setLoad(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(go, 1500)
    return () => clearTimeout(t)
  }, [])

  const placeholder = (
    <button
      className="insp-launch"
      onClick={() => {
        window.__inspectorPending = true // Inspector opens itself when it mounts
        setLoad(true)
      }}
      onPointerEnter={() => setLoad(true)}
      aria-label="Talk to Inspector Byte about Bharat"
      data-cursor="interrogate"
    >
      <InspectorAvatar size={62} />
      <span className="insp-launch-tag">Ask the inspector</span>
    </button>
  )

  if (!load) return placeholder
  return (
    <Suspense fallback={placeholder}>
      <Inspector />
    </Suspense>
  )
}
