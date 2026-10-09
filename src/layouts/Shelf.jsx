// الرف — browse the way you would in the shop: shelves you drag, books you pull out.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BOOKS, CATEGORIES, STORE, bookById, catName } from '../data.js'
import { Coupon, DeliveryStep, PaymentStep, PlaceButton, Summary, useCheckout } from '../checkout.jsx'
import { SORTS, countIn, useActive, useBuy, useSearch, useShop } from '../hooks.js'
import { useStore } from '../store.jsx'
import { Empty, Icon, Price, Qty, WishButton, booksCount, num } from '../ui.jsx'
import Pages from '../Pages.jsx'
import { ShippingCalc } from '../pages/Home.jsx'
import { NotFound } from '../pages/Misc.jsx'
import { CartDrawer } from './Classic.jsx'

const NAV = [['/shop', 'الكتب'], ['/shop?sets=1', 'السلاسل'], ['/orders', 'طلباتي'], ['/about', 'عن المكتبة']]
const TABS = [['/', 'home', 'الرئيسية'], ['/shop', 'book', 'الكتب'], ['/wishlist', 'heart', 'المفضلة'], ['/orders', 'box', 'طلباتي']]

// Opens a book over the shelf so the reader keeps their place.
const Quick = createContext(() => {})

function SearchBox() {
  const { q, setQ, hits } = useSearch()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const box = useRef(null)
  useEffect(() => {
    const away = (e) => !box.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [])
  const go = (to) => { setOpen(false); setQ(''); nav(to) }
  return (
    <form className="s-search" ref={box} role="search"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`) }}>
      <Icon name="search" />
      <input type="search" value={q} placeholder="ابحث عن كتاب أو مؤلف" aria-label="بحث"
        onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} />
      {open && q.trim() && (
        <div className="s-search-drop">
          {hits.map((b) => (
            <button type="button" key={b.id} onClick={() => go(`/book/${b.id}`)}>
              <img src={b.img} alt="" /><span><b>{b.title}</b><small>{b.author}</small></span>
            </button>
          ))}
          {hits.length ? <button type="button" className="s-search-all" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>كل النتائج</button>
            : <p>لا يوجد كتاب بهذا الاسم. جرّب اسم المؤلف.</p>}
        </div>
      )}
    </form>
  )
}

function Header() {
  const { count, wish, setDrawer } = useStore()
  const active = useActive()
  return (
    <header className="s-header">
      <div className="wrap s-bar">
        <Link to="/" className="s-brand" aria-label="مكتبة همزات — الرئيسية">
          <img src="apple-touch-icon.png" alt="" width="42" height="42" /><span>همزات</span>
        </Link>
        <SearchBox />
        <nav className="s-nav" aria-label="التنقل الرئيسي">
          {NAV.map(([to, label]) => <Link key={to} to={to} className={active(to) ? 'active' : ''}>{label}</Link>)}
        </nav>
        <Link to="/wishlist" className="s-icon" aria-label={`المفضلة (${wish.length})`}><Icon name="heart" />{wish.length > 0 && <i />}</Link>
        <button type="button" className="s-cart" onClick={() => setDrawer(true)} aria-label={`السلة، ${count} كتاب`}>
          <Icon name="bag" /> <span>السلة</span> <b key={count}>{num(count)}</b>
        </button>
      </div>
    </header>
  )
}

function TabBar() {
  const { count, drawer, setDrawer } = useStore()
  const { pathname } = useLocation()
  return (
    <nav className="s-tabs" aria-label="التنقل السفلي">
      {TABS.map(([to, icon, label]) => (
        <Link key={to} to={to} className={!drawer && (to === '/' ? pathname === '/' : pathname.startsWith(to)) ? 'active' : ''}>
          <Icon name={icon} size={22} />{label}
        </Link>
      ))}
      <button type="button" className={drawer ? 'active' : ''} onClick={() => setDrawer(true)} aria-label={`السلة، ${count} كتاب`}>
        <Icon name="bag" size={22} />السلة{count > 0 && <b key={count}>{num(count)}</b>}
      </button>
    </nav>
  )
}

function OnShelf({ book }) {
  const open = useContext(Quick)
  const { add } = useStore()
  return (
    <div className="s-book">
      <button type="button" className="s-book-img" onClick={() => open(book.id)} aria-label={`${book.title} — ${book.author}`}>
        <img src={book.img} alt="" loading="lazy" />
        {book.isNew && <span className="s-tag">جديد</span>}
        {book.set && <span className="s-tag s-tag-set">مجموعة</span>}
      </button>
      <div className="s-label">
        <Link to={`/book/${book.id}`}>{book.title}</Link>
        <span><Price book={book} /><button type="button" className="s-plus" onClick={() => add(book.id)} aria-label={`أضف «${book.title}» للسلة`}><Icon name="plus" size={16} /></button></span>
      </div>
    </div>
  )
}

function ShelfRow({ title, to, books, big }) {
  const track = useRef(null)
  // RTL: the row continues to the left, so "next" scrolls by a negative amount
  const slide = (dir) => track.current.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })
  if (!books.length) return null
  return (
    <section className={`s-shelf ${big ? 's-shelf-big' : ''}`}>
      <div className="wrap s-shelf-head">
        <h2>{title}</h2>
        <span>{big ? `${num(books.length)} مجموعات` : booksCount(books.length)}</span>
        {to && <Link to={to}>عرض الكل</Link>}
        <div className="s-arrows">
          <button type="button" onClick={() => slide(1)} aria-label={`السابق في ${title}`}><Icon name="back" size={16} /></button>
          <button type="button" onClick={() => slide(-1)} aria-label={`التالي في ${title}`}><Icon name="back" size={16} /></button>
        </div>
      </div>
      <div className="s-shelf-body">
        <div className="s-track" ref={track}>{books.map((b) => <OnShelf key={b.id} book={b} />)}</div>
      </div>
    </section>
  )
}

function QuickView({ id, onClose }) {
  const book = bookById(id)
  const { buy, added } = useBuy(id)
  const [qty, setQty] = useState(1)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])
  return (
    <div className="s-quick-wrap open">
      <div className="overlay" onClick={onClose} />
      <aside className="s-quick" role="dialog" aria-modal="true" aria-label={book.title}>
        <button type="button" className="s-close" onClick={onClose} aria-label="إغلاق" autoFocus><Icon name="close" /></button>
        <div className="s-quick-img"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
        <div className="s-quick-body">
          <div className="chips">
            <span className="chip">{catName(book.cat)}</span>
            {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
            {book.best && <span className="chip">الأكثر طلبًا</span>}
          </div>
          <h2>{book.title}</h2>
          {book.sub && <em>{book.sub}</em>}
          <p className="s-by">{book.author}</p>
          <p className="s-desc">{book.desc}</p>
          <Price book={book} className="price-lg" />
          <div className="s-buy">
            <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
            <button type="button" className="btn btn-leaf" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}</button>
            <WishButton id={book.id} />
          </div>
          <Link to={`/book/${book.id}`} className="link" onClick={onClose}>افتح صفحة الكتاب كاملة</Link>
        </div>
      </aside>
    </div>
  )
}

function Home() {
  const sets = BOOKS.filter((b) => b.set)
  return (
    <>
      <section className="wrap s-hero">
        <h1>تجوّل بين رفوف همزات</h1>
        <p>اسحب أي رف يمينًا ويسارًا، واضغط على الكتاب لتعرف عنه أكثر. نوصّل لكل المحافظات وتدفع عند الاستلام.</p>
        <ul className="s-niches">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link to={`/shop?cat=${c.id}`}>
                <span className="s-niche"><img src={BOOKS.find((b) => b.cat === c.id && !b.set && !b.isNew).img} alt="" /></span>
                <b>{c.name}</b><small>{booksCount(countIn(c.id))}</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ShelfRow title="وصل حديثًا" to="/shop?sort=new" books={BOOKS.filter((b) => b.isNew)} />
      <ShelfRow title="الأكثر طلبًا" to="/shop" books={BOOKS.filter((b) => b.best && !b.set)} />
      <ShelfRow title="سلاسل ومجموعات كاملة" to="/shop?sets=1" books={sets} big />
      {CATEGORIES.map((c) => (
        <ShelfRow key={c.id} title={c.name} to={`/shop?cat=${c.id}`} books={BOOKS.filter((b) => b.cat === c.id && !b.set)} />
      ))}

      <section className="wrap s-info">
        <div className="s-panel">
          <h2>كيف يصلك طلبك</h2>
          <ol className="steps">
            <li><b>اختر كتبك</b><span>أضفها إلى السلة من الموقع، أو أرسل لنا العناوين على واتساب.</span></li>
            <li><b>حدّد المحافظة وطريقة الدفع</b><span>كاش عند الاستلام، فودافون كاش، إنستاباي أو بطاقة.</span></li>
            <li><b>استلم من المندوب أو من المكتبة</b><span>الاستلام من الفرع في وسط البلد بدون أي رسوم.</span></li>
          </ol>
        </div>
        <ShippingCalc />
        <div className="s-panel s-visit">
          <img src="books/15.jpg" alt="رفوف مكتبة همزات من الداخل" loading="lazy" />
          <div>
            <h2>زُرنا في وسط البلد</h2>
            <p>{STORE.address}<br />{STORE.landmark}</p>
            <div className="s-visit-actions">
              <a href={STORE.map} target="_blank" rel="noreferrer" className="btn btn-leaf"><Icon name="pin" /> الخريطة</a>
              <a href={`tel:${STORE.mobile}`} className="btn btn-ghost"><Icon name="phone" /> اتصل بنا</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function GridCard({ book }) {
  const open = useContext(Quick)
  const { add } = useStore()
  return (
    <article className="s-card">
      <button type="button" className="s-card-img" onClick={() => open(book.id)} aria-label={`${book.title} — ${book.author}`}>
        <img src={book.img} alt="" loading="lazy" />
        {book.isNew && <span className="s-tag">جديد</span>}
        {book.set && <span className="s-tag s-tag-set">مجموعة</span>}
      </button>
      <WishButton id={book.id} className="s-card-wish" />
      <Link to={`/book/${book.id}`} className="s-card-title">{book.title}</Link>
      <small>{book.author}</small>
      <div><Price book={book} /><button type="button" className="s-plus" onClick={() => add(book.id)} aria-label={`أضف «${book.title}» للسلة`}><Icon name="plus" size={16} /></button></div>
    </article>
  )
}

function Shop() {
  const s = useShop()
  const [sheet, setSheet] = useState(false)
  const filtered = s.q || s.cat !== 'all' || s.sets || s.sort !== 'new'
  const grid = filtered || s.sp.get('view') === 'grid'
  const active = (s.cat !== 'all') + s.sets + (s.sort !== 'new')
  return (
    <>
      <div className="wrap s-page">
        <div className="s-page-head">
          <div><h1>{s.title}</h1><p>{booksCount(s.list.length)}</p></div>
          <div className="s-view" role="group" aria-label="طريقة العرض">
            <button type="button" aria-pressed={!grid} onClick={s.clear}><Icon name="menu" size={16} /> رفوف</button>
            <button type="button" aria-pressed={grid} onClick={() => s.set('view', 'grid')}><Icon name="grid" size={16} /> شبكة</button>
          </div>
        </div>

        <button type="button" className="s-filter-btn" onClick={() => setSheet(true)}>
          <Icon name="filter" size={16} /> تصفية وترتيب{active > 0 && <b>{num(active)}</b>}
        </button>
        {sheet && <div className="s-shade" onClick={() => setSheet(false)} />}
        <div className={`s-filters ${sheet ? 'open' : ''}`}>
          <h2>تصفية وترتيب</h2>
          <div className="s-chips" role="group" aria-label="الأقسام">
            {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map((c) => (
              <button type="button" key={c.id} aria-pressed={s.cat === c.id} onClick={() => s.set('cat', c.id === 'all' ? '' : c.id)}>{c.name}</button>
            ))}
            <button type="button" aria-pressed={s.sets} onClick={() => s.set('sets', s.sets ? '' : '1')}>مجموعات فقط</button>
          </div>
          <label className="sort">ترتيب
            <select value={s.sort} onChange={(e) => s.set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
            </select>
          </label>
          <button type="button" className="btn btn-leaf s-filters-done" onClick={() => setSheet(false)}>اعرض {booksCount(s.list.length)}</button>
        </div>

        {grid && (s.list.length ? (
          <div className="s-grid" key={s.key}>{s.list.map((b) => <GridCard key={b.id} book={b} />)}</div>
        ) : (
          <Empty title="لا توجد كتب بهذه المواصفات."><button type="button" className="btn btn-ghost" onClick={s.clear}>امسح التصفية</button></Empty>
        ))}
      </div>

      {!grid && (
        <>
          {CATEGORIES.map((c) => (
            <ShelfRow key={c.id} title={c.name} to={`/shop?cat=${c.id}`} books={BOOKS.filter((b) => b.cat === c.id && !b.set)} />
          ))}
          <ShelfRow title="سلاسل ومجموعات كاملة" to="/shop?sets=1" books={BOOKS.filter((b) => b.set)} big />
        </>
      )}
    </>
  )
}

function Book() {
  const { id } = useParams()
  const book = bookById(id)
  const { buy, added } = useBuy(id)
  const { setDrawer } = useStore()
  const [qty, setQty] = useState(1)
  if (!book) return <NotFound />
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id)
  const ask = `${STORE.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن كتاب «${book.title}» — ${book.author}`)}`
  return (
    <>
      <div className="wrap s-page">
        <nav className="crumbs" aria-label="مسار التنقل">
          <Link to="/shop">الكتب</Link><Icon name="back" size={12} />
          <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link><Icon name="back" size={12} />
          <span>{book.title}</span>
        </nav>
        <div className="s-bp">
          <div className="s-bp-img"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
          <div className="s-panel s-bp-info">
            <div className="chips">
              <Link className="chip" to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link>
              {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
              {book.set && <span className="chip">مجموعة كاملة</span>}
              {book.best && <span className="chip">الأكثر طلبًا</span>}
            </div>
            <h1>{book.title}</h1>
            {book.sub && <em>{book.sub}</em>}
            <p className="s-by">{book.author}</p>
            <p className="s-desc">{book.desc}</p>
            <Price book={book} className="price-lg" />
            <div className="s-buy">
              <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
              <button type="button" className="btn btn-leaf" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}</button>
              <WishButton id={book.id} />
            </div>
            {added && <button type="button" className="link" onClick={() => setDrawer(true)}>افتح السلة وأكمل الطلب</button>}
            <ul className="s-facts">
              <li><Icon name="check" size={16} /> متوفر في المكتبة</li>
              <li><Icon name="truck" size={16} /> توصيل لجميع المحافظات</li>
              <li><Icon name="store" size={16} /> استلام مجاني من وسط البلد</li>
            </ul>
            <a className="btn btn-ghost" href={ask} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> اسأل عن الكتاب على واتساب</a>
          </div>
        </div>
      </div>
      <ShelfRow title={`من رف ${catName(book.cat)}`} to={`/shop?cat=${book.cat}`} books={related} />
    </>
  )
}

// Everything on one page: fill both cards, check the total, confirm.
function Checkout() {
  const c = useCheckout()
  const { setToast } = useStore()
  if (!c.lines.length) {
    return <div className="wrap s-page"><Empty title="لا يوجد ما تدفع ثمنه بعد. أضف كتابًا إلى السلة أولًا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty></div>
  }
  const confirm = () => {
    if (c.check(1, 2)) return c.place()
    setToast('أكمل الحقول المعلّمة بالأحمر')
    setTimeout(() => document.querySelector('.field.bad')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50)
  }
  return (
    <div className="wrap s-page s-checkout">
      <div>
        <h1>إتمام الطلب</h1>
        <section className="s-panel"><h2><i>{num(1)}</i> إلى أين نرسل الكتب؟</h2><DeliveryStep c={c} /></section>
        <section className="s-panel"><h2><i>{num(2)}</i> كيف تحب أن تدفع؟</h2><PaymentStep c={c} /></section>
      </div>
      <div className="s-side">
        <Summary q={c.q} lines={c.lines}><Coupon c={c} /></Summary>
        <PlaceButton c={c} onClick={confirm} />
      </div>
    </div>
  )
}

function Wishlist() {
  const { wish } = useStore()
  const list = BOOKS.filter((b) => wish.includes(b.id))
  return (
    <div className="wrap s-page">
      <div className="s-page-head"><div><h1>المفضلة</h1><p>{booksCount(list.length)}</p></div></div>
      {list.length ? <div className="s-grid">{list.map((b) => <GridCard key={b.id} book={b} />)}</div>
        : <Empty title="لم تحفظ أي كتاب بعد. اضغط على القلب في أي كتاب ليظهر هنا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty>}
    </div>
  )
}

function Footer() {
  return (
    <footer className="s-footer">
      <div className="wrap">
        <div>
          <img src="apple-touch-icon.png" alt="" width="56" height="56" />
          <h3>مكتبة همزات</h3>
          <p>{STORE.address}<br />{STORE.landmark}</p>
        </div>
        <nav aria-label="روابط التذييل">
          <Link to="/shop">كل الكتب</Link><Link to="/shop?sets=1">السلاسل والمجموعات</Link>
          <Link to="/orders">طلباتي</Link><Link to="/about">العنوان والشحن</Link>
        </nav>
        <div className="s-footer-contact">
          <a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a>
          <a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a>
          <div>
            <a href={STORE.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك"><Icon name="facebook" size={20} /></a>
            <a href={STORE.whatsapp} target="_blank" rel="noreferrer" aria-label="واتساب"><Icon name="whatsapp" size={20} /></a>
            <a href={STORE.messenger} target="_blank" rel="noreferrer" aria-label="ماسنجر"><Icon name="messenger" size={20} /></a>
          </div>
        </div>
        <small>© {num(new Date().getFullYear()).replace(/٬/g, '')} مكتبة همزات. موقع تجريبي — الأسعار ووسائل الدفع للعرض فقط.</small>
      </div>
    </footer>
  )
}

export default function Shelf() {
  const [quick, setQuick] = useState(null)
  const { pathname } = useLocation()
  const close = useCallback(() => setQuick(null), [])
  useEffect(close, [pathname, close])
  return (
    <Quick.Provider value={setQuick}>
      <Header />
      <Pages Home={Home} Shop={Shop} Book={Book} Checkout={Checkout} Wishlist={Wishlist} />
      <Footer />
      <TabBar />
      <CartDrawer />
      {quick && <QuickView key={quick} id={quick} onClose={close} />}
    </Quick.Provider>
  )
}
