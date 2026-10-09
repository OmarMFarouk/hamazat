import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AUTHORS, authorTo, isAuthor } from './data.js'
import { useStore } from './store.jsx'

export const num = (n) => Number(n).toLocaleString('ar-EG')
export const money = (n) => `${num(n)} ج.م`
// Arabic counts: 1 and 2 have their own forms, 3–10 take the plural, 11+ the singular
export const booksCount = (n) => (n === 0 ? 'لا كتب' : n === 1 ? 'كتاب واحد' : n === 2 ? 'كتابان' : n <= 10 ? `${num(n)} كتب` : `${num(n)} كتابًا`)

const PATHS = {
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.3-4.3',
  bag: 'M6 8h12l1 13H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  back: 'M9 6l6 6-6 6',
  truck: 'M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z',
  mail: 'M3 6h18v12H3V6Zm0 0 9 7 9-7',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5V8Zm0 0 9 5 9-5m-9 5v8',
  tag: 'M3 12V4h8l10 10-8 8L3 12Zm5-4h.01',
  layout: 'M4 5h16v14H4V5Zm0 5h16M10 10v9',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4v-9Z',
  book: 'M5 4h13v16H7a2 2 0 0 1-2-2V4Zm0 14a2 2 0 0 1 2-2h11',
  link: 'M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  store: 'M4 10v10h16V10M3 10l2-6h14l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z',
}
const FILLED = {
  whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-1.700-.6-3.800-1.700-5.600-4.400-.9-1.300-1.300-2.300-1.300-3.200 0-1 .5-1.700.9-2.100.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.6.8c-.1.2-.2.3-.1.6.7 1.200 1.600 2.100 3 2.700.2.1.4.1.5-.1l.8-1c.2-.2.4-.2.6-.1l1.900.9c.2.1.4.2.4.3.1.2.1.7-.2 1.500Z',
  facebook: 'M13.500 21v-7.500H16l.5-3h-3V8.600c0-.9.300-1.600 1.600-1.600h1.500V4.200C16.300 4.100 15.400 4 14.400 4 12.100 4 10.500 5.400 10.500 8v2.500H8v3h2.500V21h3Z',
  messenger: 'M12 2C6.400 2 2 6.100 2 11.500c0 2.800 1.200 5.300 3.200 7V22l3-1.700c1.200.3 2.500.5 3.800.5 5.600 0 10-4.100 10-9.300S17.600 2 12 2Zm1 12.500-2.500-2.700-5 2.700 5.500-5.800 2.600 2.700 4.900-2.700-5.500 5.800Z',
}
export function Icon({ name, size = 18 }) {
  const filled = FILLED[name]
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={filled || PATHS[name]} />
    </svg>
  )
}

// Fades a section in the first time it scrolls into view.
export function Reveal({ as: Tag = 'section', className = '', ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${className}`} {...rest} />
}

export function Price({ book, className = '' }) {
  return (
    <span className={`price ${className}`}>
      {money(book.price)}
      {book.old && <s>{num(book.old)}</s>}
    </span>
  )
}

export function Qty({ value, onChange, label }) {
  return (
    <div className="qty" role="group" aria-label={label || 'الكمية'}>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="زيادة"><Icon name="plus" size={14} /></button>
      <output key={value}>{num(value)}</output>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="إنقاص"><Icon name="minus" size={14} /></button>
    </div>
  )
}

export function WishButton({ id, className = '' }) {
  const { wish, toggleWish } = useStore()
  const on = wish.includes(id)
  return (
    <button type="button" className={`wish ${on ? 'on' : ''} ${className}`} aria-pressed={on}
      aria-label={on ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'} onClick={() => toggleWish(id)}>
      <Icon name="heart" />
    </button>
  )
}

// An author's name is always a way in to everything they wrote. `strong` keeps the
// underline visible, for book pages where a touch user has no hover to discover it.
export function AuthorLink({ name, className = '', strong, onClick }) {
  if (!isAuthor(name)) return <span className={className}>{name}</span>
  return <Link to={authorTo(name)} className={`author ${strong ? 'author-on' : ''} ${className}`} title={`كل كتب ${name}`} onClick={onClick}>{name}</Link>
}

export function AuthorHits({ authors, onPick }) {
  return authors.map((a) => (
    <button type="button" key={a.name} className="hit-author" onClick={() => onPick(authorTo(a.name))}>
      <em className="hit-ico"><Icon name="user" /></em><span><b>{a.name}</b><small>مؤلف، {booksCount(a.count)}</small></span>
    </button>
  ))
}

export function AuthorSelect({ value, onChange }) {
  return (
    <label className="sort author-pick">المؤلف
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">كل المؤلفين</option>
        {AUTHORS.map((a) => <option key={a.name} value={a.name}>{a.name} ({num(a.count)})</option>)}
      </select>
    </label>
  )
}

export function BookTile({ book }) {
  const { add } = useStore()
  return (
    <article className="tile">
      <Link to={`/book/${book.id}`} className="tile-img">
        <img src={book.img} alt={`${book.title} — ${book.author}`} loading="lazy" />
        {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
        {book.set && <span className="chip">مجموعة</span>}
      </Link>
      <WishButton id={book.id} className="tile-wish" />
      <div className="tile-body">
        <Link to={`/book/${book.id}`} className="tile-title">{book.title}</Link>
        <AuthorLink name={book.author} className="tile-author" />
        <div className="tile-foot">
          <Price book={book} />
          <button type="button" className="btn btn-sm" onClick={() => add(book.id)}>أضف للسلة</button>
        </div>
      </div>
    </article>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <img src="apple-touch-icon.png" alt="" width="64" height="64" />
      <p>{title}</p>
      {children}
    </div>
  )
}

// Small progress ring used by the checkout steps
export function Ring({ step, of }) {
  const c = 2 * Math.PI * 15
  return (
    <span className="ring" aria-label={`الخطوة ${step} من ${of}`}>
      <svg viewBox="0 0 36 36" width="40" height="40">
        <circle cx="18" cy="18" r="15" />
        <circle cx="18" cy="18" r="15" className="ring-on" strokeDasharray={c} strokeDashoffset={c * (1 - step / of)} />
      </svg>
      <b>{num(step)}/{num(of)}</b>
    </span>
  )
}
