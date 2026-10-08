import { useSearchParams } from 'react-router-dom'
import { BOOKS, CATEGORIES } from '../data.js'
import { BookTile, Empty, num } from '../ui.jsx'

const SORTS = {
  new: ['الأحدث', () => 0],
  low: ['السعر: من الأقل', (a, b) => a.price - b.price],
  high: ['السعر: من الأعلى', (a, b) => b.price - a.price],
  title: ['العنوان', (a, b) => a.title.localeCompare(b.title, 'ar')],
}

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const q = sp.get('q') || ''
  const cat = sp.get('cat') || 'all'
  const sets = sp.get('sets') === '1'
  const sort = SORTS[sp.get('sort')] ? sp.get('sort') : 'new'
  const set = (k, v) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v); else n.delete(k)
    setSp(n, { replace: true })
  }
  const list = BOOKS
    .filter((b) => (cat === 'all' || b.cat === cat) && (!sets || b.set) && (!q || (b.title + ' ' + b.author).includes(q)))
    .sort(SORTS[sort][1])

  return (
    <div className="wrap block">
      <h1 className="page-title">{q ? `نتائج البحث عن «${q}»` : sets ? 'السلاسل والمجموعات' : 'كل الكتب'}</h1>
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'active' : ''}
              onClick={() => set('cat', c.id === 'all' ? '' : c.id)}>{c.name}</button>
          ))}
        </div>
        <div className="toolbar-end">
          <label className="check"><input type="checkbox" checked={sets} onChange={(e) => set('sets', e.target.checked ? '1' : '')} /> مجموعات فقط</label>
          <label className="sort">ترتيب
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
            </select>
          </label>
        </div>
      </div>
      <p className="count">{num(list.length)} كتاب</p>
      {list.length ? (
        <div className="grid" key={cat + sort + sets + q}>{list.map((b) => <BookTile key={b.id} book={b} />)}</div>
      ) : (
        <Empty title="لا توجد كتب بهذه المواصفات.">
          <button type="button" className="btn btn-ghost" onClick={() => setSp({})}>امسح التصفية</button>
        </Empty>
      )}
    </div>
  )
}
