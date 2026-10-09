import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BOOKS, STORE, bookById, authorTo, catName, othersBy } from '../data.js'
import { useStore } from '../store.jsx'
import { AuthorLink, BookTile, Icon, Price, Qty, WishButton } from '../ui.jsx'
import { NotFound } from './Misc.jsx'

export default function Product() {
  const { id } = useParams()
  const book = bookById(id)
  const { add, setDrawer } = useStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  if (!book) return <NotFound />
  const byAuthor = othersBy(book).slice(0, 4)
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id && !byAuthor.includes(b)).slice(0, 4)
  const ask = `${STORE.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن كتاب «${book.title}» — ${book.author}`)}`
  const buy = () => { add(book.id, qty); setAdded(true); setTimeout(() => setAdded(false), 1600) }

  return (
    <div className="wrap block">
      <nav className="crumbs" aria-label="مسار التنقل">
        <Link to="/shop">الكتب</Link><Icon name="back" size={12} />
        <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link><Icon name="back" size={12} />
        <span>{book.title}</span>
      </nav>

      <div className="product">
        <div className="product-img"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
        <div className="product-info">
          <div className="chips">
            <Link className="chip" to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link>
            {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
            {book.set && <span className="chip">مجموعة كاملة</span>}
            {book.best && <span className="chip">الأكثر طلبًا</span>}
          </div>
          <h1>{book.title}</h1>
          {book.sub && <p className="product-sub">{book.sub}</p>}
          <p className="product-author">تأليف <AuthorLink name={book.author} strong /></p>
          <p className="product-desc">{book.desc}</p>
          <Price book={book} className="price-lg" />
          <div className="buy">
            <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
            <button type="button" className={`btn btn-leaf buy-btn ${added ? 'done' : ''}`} onClick={buy}>
              {added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}
            </button>
            <WishButton id={book.id} />
          </div>
          {added && <button type="button" className="link" onClick={() => setDrawer(true)}>افتح السلة وأكمل الطلب</button>}

          <dl className="facts">
            <div><dt>المؤلف</dt><dd><AuthorLink name={book.author} strong /></dd></div>
            <div><dt>القسم</dt><dd>{catName(book.cat)}</dd></div>
            <div><dt>التوفر</dt><dd className="ok">متوفر في المكتبة</dd></div>
            <div><dt>التوصيل</dt><dd>لجميع المحافظات، والدفع عند الاستلام</dd></div>
          </dl>
          <a className="btn btn-ghost" href={ask} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> اسأل عن الكتاب على واتساب</a>
        </div>
      </div>

      {byAuthor.length > 0 && (
        <section className="block">
          <div className="block-head"><h2>كتب أخرى لـ{book.author}</h2><Link to={authorTo(book.author)}>كل كتب المؤلف</Link></div>
          <div className="grid">{byAuthor.map((b) => <BookTile key={b.id} book={b} />)}</div>
        </section>
      )}

      {related.length > 0 && (
        <section className="block">
          <div className="block-head"><h2>من نفس القسم</h2><Link to={`/shop?cat=${book.cat}`}>كل كتب {catName(book.cat)}</Link></div>
          <div className="grid">{related.map((b) => <BookTile key={b.id} book={b} />)}</div>
        </section>
      )}
    </div>
  )
}
