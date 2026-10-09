import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { STORE } from './data.js'
import { Switcher, useLayout } from './layout.jsx'
import { useStore } from './store.jsx'
import { Icon } from './ui.jsx'
import Classic from './layouts/Classic.jsx'
import Reading from './layouts/Reading.jsx'
import Shelf from './layouts/Shelf.jsx'
import Night from './layouts/Night.jsx'

const SHELLS = { classic: Classic, reading: Reading, shelf: Shelf, night: Night }

export default function App() {
  const { pathname } = useLocation()
  const { layout } = useLayout()
  const { toast } = useStore()
  const Shell = SHELLS[layout]
  useEffect(() => { window.scrollTo(0, 0) }, [pathname, layout]) // braces: scrollTo may return a Promise
  return (
    <>
      <a href="#main" className="skip">تخطَّ إلى المحتوى</a>
      <Shell />
      <Switcher />
      <a className="wa-fab" href={STORE.whatsapp} target="_blank" rel="noreferrer" aria-label="راسلنا على واتساب"><Icon name="whatsapp" size={26} /></a>
      <div className={`toast ${toast ? 'show' : ''}`} role="status"><Icon name="check" size={16} /> {toast}</div>
    </>
  )
}
