import { useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { AUTHORS, BOOKS, hit, matches } from './data.js'
import { useStore } from './store.jsx'

export const SORTS = {
  new: ['الأحدث', () => 0],
  low: ['السعر: من الأقل', (a, b) => a.price - b.price],
  high: ['السعر: من الأعلى', (a, b) => b.price - a.price],
  title: ['العنوان', (a, b) => a.title.localeCompare(b.title, 'ar')],
}

// Shop filters live in the URL so they survive a layout switch.
export function useShop() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') || ''
  const cat = sp.get('cat') || 'all'
  const sets = sp.get('sets') === '1'
  const author = sp.get('author') || ''
  const sort = SORTS[sp.get('sort')] ? sp.get('sort') : 'new'
  const set = (k, v) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v); else n.delete(k)
    setSp(n, { replace: true })
  }
  const list = BOOKS
    .filter((b) => (cat === 'all' || b.cat === cat) && (!sets || b.set) && (!author || b.author === author) && (!q || matches(b, q)))
    .sort(SORTS[sort][1])
  const title = q ? `نتائج البحث عن «${q}»` : author ? `كتب ${author}` : sets ? 'السلاسل والمجموعات' : 'كل الكتب'
  return { sp, q, cat, sets, author, sort, set, list, title, clear: () => setSp({}), key: cat + sort + sets + q + author }
}

export function useSearch(max = 6) {
  const [q, setQ] = useState('')
  const s = q.trim()
  const hits = useMemo(() => (s ? BOOKS.filter((b) => matches(b, s)).slice(0, max) : []), [s, max])
  // authors come first in every dropdown: one tap to everything they wrote
  const authors = useMemo(() => (s ? AUTHORS.filter((a) => hit(a.name, s)).slice(0, 3) : []), [s])
  return { q, setQ, hits, authors }
}

// Same rule the classic header uses: a link is active only when path and query both match.
export function useActive() {
  const { pathname, search } = useLocation()
  return (to) => pathname + search === to || (to === '/shop' && pathname === '/shop' && !search)
}

export function useBuy(id) {
  const { add } = useStore()
  const [added, setAdded] = useState(false)
  const buy = (qty = 1) => { add(id, qty); setAdded(true); setTimeout(() => setAdded(false), 1600) }
  return { added, buy }
}

// Changes every Monday; only books with a blurb long enough to carry a hero.
export function bookOfWeek() {
  const long = BOOKS.filter((b) => b.desc.length > 110 && !b.set)
  return long[Math.floor(Date.now() / 6048e5) % long.length]
}

export const countIn = (cat) => BOOKS.filter((b) => b.cat === cat).length
