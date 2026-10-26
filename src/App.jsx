import { useEffect } from 'react'
import Intro from './components/Intro.jsx'
import Bats from './components/Bats.jsx'
import Nav from './components/Nav.jsx'
import Cursor from './components/Cursor.jsx'
import CrimeTape from './components/CrimeTape.jsx'
import Envelope from './components/Envelope.jsx'
import Inspector from './components/Inspector.jsx'
import ColdOpen from './sections/ColdOpen.jsx'
import Suspect from './sections/Suspect.jsx'
import Trail from './sections/Trail.jsx'
import Evidence from './sections/Evidence.jsx'
import Tools from './sections/Tools.jsx'
import OffRecord from './sections/OffRecord.jsx'
import Interrogation from './sections/Interrogation.jsx'
import Verdict from './sections/Verdict.jsx'
import { ScrollTrigger, onReady } from './lib/motion.js'

export default function App() {
  // Scroll animations measure layout, so re-measure once fonts and the intro are done.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    onReady(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <Intro />
      <Bats />
      <Nav />
      <main>
        <ColdOpen />
        <CrimeTape />
        <Suspect />
        <Trail />
        <Evidence />
        <CrimeTape tilt={2} reverse />
        <Tools />
        <OffRecord />
        <Interrogation />
        <Verdict />
      </main>
      <Envelope />
      <Inspector />
      <Cursor />
    </>
  )
}
