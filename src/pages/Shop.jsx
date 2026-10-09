import { CATEGORIES } from '../data.js'
import { SORTS, useShop } from '../hooks.js'
import { AuthorSelect, BookTile, Empty, num } from '../ui.jsx'

export default function Shop() {
  const { cat, sets, author, sort, set, list, title, clear, key } = useShop()
  return (
    <div className="wrap block">
      <h1 className="page-title">{title}</h1>
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'active' : ''}
              onClick={() => set('cat', c.id === 'all' ? '' : c.id)}>{c.name}</button>
          ))}
        </div>
        <div className="toolbar-end">
          <label className="check"><input type="checkbox" checked={sets} onChange={(e) => set('sets', e.target.checked ? '1' : '')} /> مجموعات فقط</label>
          <AuthorSelect value={author} onChange={(v) => set('author', v)} />
          <label className="sort">ترتيب
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
            </select>
          </label>
        </div>
      </div>
      <p className="count">{num(list.length)} كتاب</p>
      {list.length ? (
        <div className="grid" key={key}>{list.map((b) => <BookTile key={b.id} book={b} />)}</div>
      ) : (
        <Empty title="لا توجد كتب بهذه المواصفات.">
          <button type="button" className="btn btn-ghost" onClick={clear}>امسح التصفية</button>
        </Empty>
      )}
    </div>
  )
}
