import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useStore } from './store.jsx'
import { Icon } from './ui.jsx'

export const LAYOUTS = [
  { id: 'classic', name: 'التصميم الحالي', note: 'شبكة بيضاء بخطوط دقيقة' },
  { id: 'reading', name: 'غرفة القراءة', note: 'هادئ، كصفحات مجلة أدبية' },
  { id: 'shelf', name: 'الرف', note: 'رفوف تتصفحها كأنك في المكتبة' },
  { id: 'night', name: 'ليل وسط البلد', note: 'داكن، والصور في الصدارة' },
]
const valid = (id) => LAYOUTS.some((l) => l.id === id) && id

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

// ?layout=shelf works before or after the hash, so a shared link opens in that design.
function fromUrl() {
  const { search, hash } = window.location
  return valid(new URLSearchParams(search).get('layout')) || valid(new URLSearchParams(hash.split('?')[1]).get('layout'))
}

// A link that names its layout is a pinned preview: read once at load, because the
// router rewrites the hash on navigation, and the switcher stays hidden for the visit.
const pinned = fromUrl()

const Ctx = createContext(null)
export const useLayout = () => useContext(Ctx)

export function LayoutProvider({ children }) {
  const [layout, setLayout] = useState(() => pinned || valid(read('hz.layout')) || 'classic')
  const [reader, setReader] = useState(() => read('hz.reader', { dark: false, size: 1 })) // reading-room preferences

  useEffect(() => {
    const root = document.documentElement
    const dark = layout === 'night' || (layout === 'reading' && reader.dark)
    root.dataset.layout = layout
    root.toggleAttribute('data-dark', dark)
    root.style.setProperty('--rs', layout === 'reading' ? reader.size : 1)
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#1a0f08' : '#2a1709')
    write('hz.layout', layout)
    write('hz.reader', reader)
  }, [layout, reader])

  return <Ctx.Provider value={{ layout, setLayout, reader, setReader }}>{children}</Ctx.Provider>
}

export const Switcher = () => (pinned ? null : <SwitcherButton />)

function SwitcherButton() {
  const { layout, setLayout } = useLayout()
  const { setToast } = useStore()
  const [open, setOpen] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const away = (e) => !box.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    window.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', away); window.removeEventListener('keydown', esc) }
  }, [open])

  const copy = () => {
    const { origin, pathname, hash } = window.location
    navigator.clipboard?.writeText(`${origin}${pathname}?layout=${layout}${hash}`)
      .then(() => setToast('نُسخ رابط هذا التصميم'), () => setToast('تعذّر النسخ'))
  }

  return (
    <div className="lay" ref={box}>
      {open && (
        <div className="lay-panel" role="dialog" aria-label="اختر تصميم الموقع">
          <h2>اختر تصميم الموقع</h2>
          <p>السلة والمفضلة والطلبات تبقى كما هي في كل تصميم.</p>
          <ul>
            {LAYOUTS.map((l) => (
              <li key={l.id}>
                <button type="button" aria-pressed={layout === l.id} onClick={() => setLayout(l.id)}>
                  <span className={`lay-thumb lay-${l.id}`} aria-hidden="true"><i /><i /><i /></span>
                  <span><b>{l.name}</b><small>{l.note}</small></span>
                  {layout === l.id && <Icon name="check" size={16} />}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="lay-copy" onClick={copy}><Icon name="link" size={15} /> انسخ رابطًا يفتح بهذا التصميم</button>
        </div>
      )}
      <button type="button" className="lay-fab" aria-label="تغيير تصميم الموقع" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'layout'} size={22} />
      </button>
    </div>
  )
}
