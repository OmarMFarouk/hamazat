// المكتبة الذهبية — after the Book Haven reference: charcoal header, cream pages, gold actions.
// Only what Hamazat really offers is kept: no e-books, ratings or accounts are invented.
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BOOKS, CATEGORIES, COD_FEE, FREE_SHIPPING_FROM, PAYMENTS, STORE, ZONES, authorTo, bookById, catName, othersBy } from '../data.js'
import { Coupon, DeliveryStep, PaymentStep, PlaceButton, ReviewStep, STEPS, STEP_TITLES, Summary, useCheckout } from '../checkout.jsx'
import { SORTS, countIn, useActive, useBuy, useSearch, useShop } from '../hooks.js'
import { useStore } from '../store.jsx'
import { AuthorHits, AuthorLink, AuthorSelect, Empty, Icon, Price, Qty, WishButton, booksCount, money, num } from '../ui.jsx'
import Pages from '../Pages.jsx'
import { ShippingCalc } from '../pages/Home.jsx'
import { NotFound } from '../pages/Misc.jsx'

const NAV = [['/', 'الرئيسية'], ['/shop', 'الكتب'], ['/shop?sets=1', 'السلاسل'], ['/orders', 'طلباتي'], ['/about', 'عن المكتبة']]
const TABS = [['/', 'home', 'الرئيسية'], ['/shop', 'book', 'الكتب'], ['/cart', 'bag', 'السلة'], ['/orders', 'box', 'طلباتي']]
const two = (n) => num(n).padStart(2, '٠')
const Arrow = () => <span className="h-arrow" aria-hidden="true"><Icon name="back" size={14} /></span>

function SearchBox() {
  const { q, setQ, hits, authors } = useSearch()
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
    <form className="h-search" ref={box} role="search"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`) }}>
      <Icon name="search" size={16} />
      <input type="search" value={q} placeholder="ابحث عن كتاب أو مؤلف" aria-label="بحث"
        onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} />
      {open && q.trim() && (
        <div className="h-search-drop">
          <AuthorHits authors={authors} onPick={go} />
          {hits.map((b) => (
            <button type="button" key={b.id} onClick={() => go(`/book/${b.id}`)}>
              <img src={b.img} alt="" /><span><b>{b.title}</b><small>{b.author}</small></span>
            </button>
          ))}
          {hits.length ? <button type="button" className="h-search-all" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>عرض كل النتائج</button>
            : !authors.length && <p>لا يوجد كتاب بهذا الاسم. جرّب اسم المؤلف.</p>}
        </div>
      )}
    </form>
  )
}

function Header() {
  const { count, wish } = useStore()
  const [menu, setMenu] = useState(false)
  const { pathname, search } = useLocation()
  const active = useActive()
  useEffect(() => { setMenu(false) }, [pathname, search])
  return (
    <header className="h-header">
      <div className="wrap h-bar">
        <Link to="/" className="h-brand" aria-label="مكتبة همزات — الرئيسية">
          <img src="apple-touch-icon.png" alt="" width="44" height="44" />
          <span><b>همزات</b><small>مكتبة وسط البلد</small></span>
        </Link>
        <nav className="h-nav" aria-label="التنقل الرئيسي">
          {NAV.map(([to, label]) => <Link key={to} to={to} className={active(to) || (to === '/' && pathname === '/') ? 'active' : ''}>{label}</Link>)}
        </nav>
        <SearchBox />
        <div className="h-tools">
          <Link to="/wishlist" aria-label={`المفضلة (${wish.length})`}><Icon name="heart" />{wish.length > 0 && <i />}</Link>
          <Link to="/cart" aria-label={`السلة، ${count} كتاب`}><Icon name="bag" />{count > 0 && <b key={count}>{num(count)}</b>}</Link>
          <button type="button" className="h-menu-btn" aria-label="القائمة" aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'} /></button>
        </div>
      </div>
      {menu && (
        <nav className="h-menu" aria-label="القائمة">
          {NAV.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          <Link to="/wishlist">المفضلة</Link>
        </nav>
      )}
    </header>
  )
}

function TabBar() {
  const { count } = useStore()
  const { pathname } = useLocation()
  return (
    <nav className="h-tabs" aria-label="التنقل السفلي">
      {TABS.map(([to, icon, label]) => (
        <Link key={to} to={to} className={(to === '/' ? pathname === '/' : pathname.startsWith(to)) ? 'active' : ''}>
          <Icon name={icon} size={21} />{label}{to === '/cart' && count > 0 && <b key={count}>{num(count)}</b>}
        </Link>
      ))}
    </nav>
  )
}

function HCard({ book, rank }) {
  const { add } = useStore()
  return (
    <article className="h-card">
      <Link to={`/book/${book.id}`} className="h-card-img" aria-label={`${book.title} — ${book.author}`}>
        <img src={book.img} alt="" loading="lazy" />
        {rank ? <span className="h-rank" dir="ltr">#{num(rank)}</span> : book.isNew ? <span className="h-rank h-new">جديد</span> : null}
      </Link>
      <WishButton id={book.id} className="h-card-wish" />
      <Link to={`/book/${book.id}`} className="h-card-title">{book.title}</Link>
      <AuthorLink name={book.author} className="h-card-by" />
      <div>
        <Price book={book} />
        <button type="button" className="h-add" onClick={() => add(book.id)} aria-label={`أضف «${book.title}» للسلة`}><Icon name="bag" size={16} /></button>
      </div>
    </article>
  )
}

function Hero() {
  const fresh = bookById('39')
  const set = bookById('22')
  const slides = [
    { img: 'books/15.jpg', kicker: 'روايات، فلسفة، تاريخ، علم نفس', a: 'من رفوف وسط البلد', b: 'إلى باب بيتك', text: 'نختار كتبنا واحدًا واحدًا، ونوصّلها لكل المحافظات. تدفع عند الاستلام.', to: '/shop', cta: 'تصفّح الكتب', wa: true },
    { img: fresh.img, kicker: 'وصل حديثًا', a: fresh.title, b: fresh.author, text: fresh.desc, to: `/book/${fresh.id}`, cta: 'اعرف أكثر عن الكتاب' },
    { img: set.img, kicker: 'سلاسل ومجموعات كاملة', a: set.title, b: 'في طبعة المجلدات', text: set.desc, to: '/shop?sets=1', cta: 'كل السلاسل' },
  ]
  const [i, setI] = useState(0)
  const s = slides[i]
  const step = (d) => setI((i + d + slides.length) % slides.length)
  return (
    <section className="h-hero" aria-roledescription="carousel" aria-label="مختارات المكتبة">
      {slides.map((x, k) => <img key={x.img} src={x.img} alt="" className={k === i ? 'on' : ''} />)}
      <div className="wrap h-hero-text" key={i}>
        <p className="h-kicker">{s.kicker}</p>
        <h1>{s.a}<em>{s.b}</em></h1>
        <p className="h-hero-p">{s.text}</p>
        <div className="h-cta">
          <Link to={s.to} className="btn btn-leaf">{s.cta} <Arrow /></Link>
          {s.wa && <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="btn h-outline"><Icon name="whatsapp" /> اطلب عبر واتساب</a>}
        </div>
      </div>
      <div className="h-hero-nav">
        <span aria-live="polite">{two(i + 1)} / {two(slides.length)}</span>
        <button type="button" onClick={() => step(-1)} aria-label="الشريحة السابقة"><Icon name="back" size={16} /></button>
        <button type="button" onClick={() => step(1)} aria-label="الشريحة التالية"><Icon name="back" size={16} /></button>
      </div>
    </section>
  )
}

const TRUST = [
  ['truck', 'توصيل لكل المحافظات', 'من يوم إلى سبعة أيام'],
  ['box', 'الدفع عند الاستلام', 'نقدًا للمندوب'],
  ['tag', 'شحن مجاني', `للطلبات من ${num(FREE_SHIPPING_FROM)} ج.م`],
  ['store', 'استلام من المكتبة', 'وسط البلد، بدون رسوم'],
  ['whatsapp', 'اطلب عبر واتساب', 'أرسل لنا العناوين مباشرة'],
]
const Trust = ({ items = TRUST }) => (
  <ul className="h-trust">
    {items.map(([icon, t, d]) => <li key={t}><Icon name={icon} size={26} /><span><b>{t}</b><small>{d}</small></span></li>)}
  </ul>
)

function Home() {
  const best = BOOKS.filter((b) => b.best && !b.set).slice(0, 4)
  const fresh = BOOKS.filter((b) => b.isNew)
  const promo = bookById('21')
  const quoted = bookById('04')
  return (
    <>
      <Hero />
      <div className="h-strip"><div className="wrap"><Trust /></div></div>

      <section className="wrap h-cats">
        <div className="h-intro">
          <p className="h-kicker">تصفّح حسب القسم</p>
          <h2>اعثر على كتابك القادم</h2>
          <Link to="/shop" className="h-more">كل الكتب <Arrow /></Link>
        </div>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link to={`/shop?cat=${c.id}`}>
                <img src={BOOKS.find((b) => b.cat === c.id && !b.set && !b.isNew).img} alt="" loading="lazy" />
                <b>{c.name}</b><Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap h-best">
        <div>
          <div className="h-head">
            <div><p className="h-kicker">الأكثر طلبًا</p><h2>كتب يسأل عنها القرّاء</h2></div>
            <Link to="/shop" className="h-more">عرض الكل <Arrow /></Link>
          </div>
          <div className="h-row">{best.map((b, k) => <HCard key={b.id} book={b} rank={k + 1} />)}</div>
        </div>
        <Link to="/shop?sets=1" className="h-promo">
          <div>
            <h2>سلاسل ومجموعات كاملة</h2>
            <p>أحمد خالد توفيق، نبيل فاروق، هوبزباوم، طاهرة مافي. المجلدات كاملة على رف واحد.</p>
            <span className="btn btn-leaf">كل السلاسل <Arrow /></span>
          </div>
          <img src={promo.img} alt="" loading="lazy" />
        </Link>
      </section>

      <section className="wrap h-block">
        <div className="h-head">
          <div><p className="h-kicker">وصل حديثًا</p><h2>الجديد على رفوف همزات</h2></div>
          <Link to="/shop?sort=new" className="h-more">كل الجديد <Arrow /></Link>
        </div>
        <div className="h-row h-row-5">{fresh.map((b) => <HCard key={b.id} book={b} />)}</div>
      </section>

      <section className="wrap h-block h-how">
        <div>
          <p className="h-kicker">التوصيل</p>
          <h2>كيف يصلك طلبك</h2>
          <ol className="steps">
            <li><b>اختر كتبك</b><span>أضفها إلى السلة من الموقع، أو أرسل لنا العناوين على واتساب.</span></li>
            <li><b>حدّد المحافظة وطريقة الدفع</b><span>كاش عند الاستلام، فودافون كاش، إنستاباي أو بطاقة.</span></li>
            <li><b>استلم من المندوب أو من المكتبة</b><span>الاستلام من الفرع في وسط البلد بدون أي رسوم.</span></li>
          </ol>
        </div>
        <ShippingCalc />
      </section>

      <section className="h-band">
        <div className="h-visit">
          <img src="books/15.jpg" alt="" loading="lazy" />
          <div>
            <h3>زُرنا في وسط البلد</h3>
            <p>{STORE.address}. {STORE.landmark}.</p>
            <a href={STORE.map} target="_blank" rel="noreferrer" className="btn btn-leaf btn-sm">افتح الموقع على الخريطة <Arrow /></a>
          </div>
        </div>
        <div className="h-why">
          <h3>لماذا همزات؟</h3>
          <ul>
            <li><Icon name="book" size={24} /><b>اختيار بعناية</b><small>كتبنا ننتقيها واحدًا واحدًا</small></li>
            <li><Icon name="truck" size={24} /><b>توصيل سريع</b><small>لجميع المحافظات</small></li>
            <li><Icon name="box" size={24} /><b>ادفع عند الاستلام</b><small>أو بالمحفظة والبطاقة</small></li>
            <li><Icon name="store" size={24} /><b>مكتبة حقيقية</b><small>تزورها في وسط البلد</small></li>
          </ul>
        </div>
        <div className="h-quote">
          <blockquote>«شرور النفس أقوى من كل شيء وأصعب من أي سحر.»</blockquote>
          <p>من <Link to={`/book/${quoted.id}`}>{quoted.title}</Link>، {quoted.author}</p>
        </div>
      </section>
    </>
  )
}

function Shop() {
  const { cat, sets, author, sort, set, list, title, clear, key, q } = useShop()
  const name = cat !== 'all' && !q && !author && !sets ? catName(cat) : title
  // filters start open beside the grid on wide screens, folded above it on phones
  const [wide] = useState(() => window.matchMedia('(min-width: 961px)').matches)
  return (
    <>
      <div className="h-banner">
        <img src="books/15.jpg" alt="" />
        <div className="wrap"><h1>{name}</h1><p>{booksCount(list.length)} من اختيار المكتبة</p></div>
      </div>
      <div className="wrap h-listing">
        <nav className="crumbs" aria-label="مسار التنقل">
          <Link to="/">الرئيسية</Link><Icon name="back" size={12} /><Link to="/shop">الكتب</Link>
          {cat !== 'all' && <><Icon name="back" size={12} /><span>{catName(cat)}</span></>}
        </nav>
        <label className="sort h-sort">ترتيب
          <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
            {Object.entries(SORTS).map(([k, [n]]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>

        <details className="h-side" open={wide || undefined}>
          <summary><Icon name="filter" size={16} /> تصفية</summary>
          <h2>الأقسام</h2>
          <ul>
            {[{ id: 'all', name: 'كل الأقسام', n: BOOKS.length }, ...CATEGORIES.map((c) => ({ ...c, n: countIn(c.id) }))].map((c) => (
              <li key={c.id}>
                <label><input type="radio" name="h-cat" checked={cat === c.id} onChange={() => set('cat', c.id === 'all' ? '' : c.id)} />{c.name} <small>({num(c.n)})</small></label>
              </li>
            ))}
          </ul>
          <h2>النوع</h2>
          <label><input type="checkbox" checked={sets} onChange={(e) => set('sets', e.target.checked ? '1' : '')} />سلاسل ومجموعات فقط</label>
          <h2>المؤلف</h2>
          <AuthorSelect value={author} onChange={(v) => set('author', v)} />
          <button type="button" className="h-more" onClick={clear}>امسح التصفية</button>
        </details>

        {list.length ? (
          <div className="h-grid" key={key}>{list.map((b) => <HCard key={b.id} book={b} />)}</div>
        ) : (
          <Empty title="لا توجد كتب بهذه المواصفات."><button type="button" className="btn btn-ghost" onClick={clear}>امسح التصفية</button></Empty>
        )}
      </div>
    </>
  )
}

function Book() {
  const { id } = useParams()
  const book = bookById(id)
  const { buy, added } = useBuy(id)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('desc')
  if (!book) return <NotFound />
  const byAuthor = othersBy(book).slice(0, 5)
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id && !byAuthor.includes(b)).slice(0, 5)
  const ask = `${STORE.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن كتاب «${book.title}» — ${book.author}`)}`
  return (
    <div className="wrap h-page">
      <nav className="crumbs" aria-label="مسار التنقل">
        <Link to="/">الرئيسية</Link><Icon name="back" size={12} />
        <Link to="/shop">الكتب</Link><Icon name="back" size={12} />
        <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link><Icon name="back" size={12} />
        <span>{book.title}</span>
      </nav>
      <div className="h-product">
        <div className="h-product-img"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
        <div className="h-product-info">
          <h1>{book.title}</h1>
          {book.sub && <p className="h-sub">{book.sub}</p>}
          <p className="h-by">تأليف <AuthorLink name={book.author} strong /></p>
          <p className="h-priceline">
            <Price book={book} className="price-lg" />
            <span className="h-chip h-ok">متوفر في المكتبة</span>
            {book.isNew && <span className="h-chip">وصل حديثًا</span>}
            {book.set && <span className="h-chip">مجموعة كاملة</span>}
          </p>
          <p className="h-desc">{book.desc}</p>
          {/* the reference offers editions here; Hamazat sells one edition, so these are the two ways to receive it */}
          <ul className="h-options">
            <li><Icon name="truck" size={22} /><b>توصيل للعنوان</b><span>من {money(ZONES[0].fee)}</span><small>لجميع المحافظات</small></li>
            <li><Icon name="store" size={22} /><b>استلام من المكتبة</b><span>بدون رسوم</span><small>وسط البلد</small></li>
            <li><Icon name="box" size={22} /><b>الدفع عند الاستلام</b><span>رسوم {money(COD_FEE)}</span><small>أو بالمحفظة والبطاقة</small></li>
          </ul>
          <div className="h-buy">
            <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
            <button type="button" className="btn btn-leaf" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف إلى السلة</> : <><Icon name="bag" size={16} /> أضف للسلة</>}</button>
            <WishButton id={book.id} />
          </div>
          {added && <Link to="/cart" className="link">افتح السلة وأكمل الطلب</Link>}
          <a className="h-more" href={ask} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> اسأل المكتبة عن هذا الكتاب</a>
        </div>
      </div>

      <div className="h-tabset">
        <div role="tablist" aria-label="معلومات الكتاب">
          {[['desc', 'الوصف'], ['details', 'التفاصيل'], ['ship', 'التوصيل والدفع']].map(([k, t]) => (
            <button type="button" key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>
          ))}
        </div>
        <div role="tabpanel" key={tab}>
          {tab === 'desc' && <p className="h-desc">{book.desc}</p>}
          {tab === 'details' && (
            <dl className="facts">
              <div><dt>المؤلف</dt><dd><AuthorLink name={book.author} strong /></dd></div>
              <div><dt>القسم</dt><dd><Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link></dd></div>
              <div><dt>النوع</dt><dd>{book.set ? `مجموعة${book.sub ? `، ${book.sub}` : ''}` : 'كتاب مطبوع'}</dd></div>
              <div><dt>التوفر</dt><dd className="ok">متوفر في المكتبة</dd></div>
            </dl>
          )}
          {tab === 'ship' && (
            <>
              <table className="zones"><tbody>{ZONES.map((z) => <tr key={z.id}><td>{z.name}</td><td>{z.govs.join('، ')}</td><td>{z.days}</td><td>{money(z.fee)}</td></tr>)}</tbody></table>
              <p className="fine">الشحن مجاني للطلبات من {money(FREE_SHIPPING_FROM)}. طرق الدفع: {PAYMENTS.map((p) => p.name).join('، ')}.</p>
            </>
          )}
        </div>
      </div>

      {byAuthor.length > 0 && (
        <section className="h-block">
          <div className="h-head"><h2>كتب أخرى لـ{book.author}</h2><Link to={authorTo(book.author)} className="h-more">كل كتب المؤلف <Arrow /></Link></div>
          <div className="h-row h-row-5">{byAuthor.map((b) => <HCard key={b.id} book={b} />)}</div>
        </section>
      )}
      {related.length > 0 && (
        <section className="h-block">
          <div className="h-head"><h2>من نفس القسم</h2><Link to={`/shop?cat=${book.cat}`} className="h-more">كل كتب {catName(book.cat)} <Arrow /></Link></div>
          <div className="h-row h-row-5">{related.map((b) => <HCard key={b.id} book={b} />)}</div>
        </section>
      )}
    </div>
  )
}

function Cart() {
  const { lines, setQty } = useStore()
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const left = FREE_SHIPPING_FROM - subtotal
  const more = BOOKS.filter((b) => b.best && !lines.some((l) => l.id === b.id)).slice(0, 5)
  if (!lines.length) {
    return <div className="wrap h-page"><Empty title="السلة فارغة. ابدأ بكتاب واحد."><Link to="/shop" className="btn btn-leaf">تصفّح الكتب</Link></Empty></div>
  }
  return (
    <div className="wrap h-page">
      <h1 className="h-title">سلة التسوق <small>({num(count)})</small></h1>
      <div className="h-cart">
        <ul className="h-lines">
          {lines.map((l) => (
            <li key={l.id}>
              <img src={l.img} alt="" />
              <div><Link to={`/book/${l.id}`}>{l.title}</Link><AuthorLink name={l.author} className="h-card-by" /><small>{money(l.price)}</small></div>
              <Qty value={l.qty} onChange={(v) => setQty(l.id, v)} />
              <b>{money(l.price * l.qty)}</b>
              <button type="button" onClick={() => setQty(l.id, 0)} aria-label={`حذف ${l.title}`}><Icon name="close" size={14} /></button>
            </li>
          ))}
        </ul>
        <aside className="h-panel">
          <h2>ملخص الطلب</h2>
          <dl>
            <div><dt>المجموع</dt><dd>{money(subtotal)}</dd></div>
            <div><dt>الشحن</dt><dd>{left > 0 ? 'يُحسب حسب المحافظة' : 'مجاني'}</dd></div>
            <div className="h-total"><dt>الإجمالي قبل الشحن</dt><dd>{money(subtotal)}</dd></div>
          </dl>
          {left > 0 && <p className="h-meter-note">أضف كتبًا بـ <b>{money(left)}</b> ليصير الشحن مجانيًا</p>}
          <div className="h-meter"><i style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} /></div>
          <Link to="/checkout" className="btn btn-leaf btn-block"><Icon name="bag" size={16} /> إتمام الطلب</Link>
          <Link to="/shop" className="h-more">أو واصل التسوق</Link>
        </aside>
      </div>
      {more.length > 0 && (
        <section className="h-block">
          <div className="h-head"><h2>قد يعجبك أيضًا</h2></div>
          <div className="h-row h-row-5">{more.map((b) => <HCard key={b.id} book={b} />)}</div>
        </section>
      )}
    </div>
  )
}

function Checkout() {
  const c = useCheckout()
  const { step, setStep, lines, q } = c
  if (!lines.length) {
    return <div className="wrap h-page"><Empty title="لا يوجد ما تدفع ثمنه بعد. أضف كتابًا إلى السلة أولًا."><Link to="/shop" className="btn btn-leaf">تصفّح الكتب</Link></Empty></div>
  }
  return (
    <div className="wrap h-page">
      <ol className="h-stepper" aria-label={`الخطوة ${step} من 3`}>
        {STEPS.map((s, i) => <li key={s} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}><i>{i + 1 < step ? <Icon name="check" size={14} /> : num(i + 1)}</i>{s}</li>)}
      </ol>
      <div className="h-checkout">
        <div className="h-panel">
          {step > 1 && <button type="button" className="link back" onClick={() => setStep(step - 1)}><Icon name="back" size={12} /> رجوع</button>}
          <h1>{STEP_TITLES[step - 1]}</h1>
          <div className="step" key={step}>
            {step === 1 && <DeliveryStep c={c} />}
            {step === 2 && <PaymentStep c={c} />}
            {step === 3 && <ReviewStep c={c} />}
          </div>
          <div className="step-actions">
            {step < 3
              ? <button type="button" className="btn btn-leaf" onClick={c.next}>{step === 1 ? 'متابعة إلى الدفع' : 'متابعة إلى المراجعة'}</button>
              : <PlaceButton c={c} />}
          </div>
        </div>
        <Summary q={q} lines={lines}><Coupon c={c} /></Summary>
      </div>
    </div>
  )
}

function Wishlist() {
  const { wish } = useStore()
  const list = BOOKS.filter((b) => wish.includes(b.id))
  return (
    <div className="wrap h-page">
      <h1 className="h-title">المفضلة <small>({num(list.length)})</small></h1>
      {list.length ? <div className="h-row h-row-5">{list.map((b) => <HCard key={b.id} book={b} />)}</div>
        : <Empty title="لم تحفظ أي كتاب بعد. اضغط على القلب في أي كتاب ليظهر هنا."><Link to="/shop" className="btn btn-leaf">تصفّح الكتب</Link></Empty>}
    </div>
  )
}

function Footer() {
  return (
    <footer className="h-footer">
      <div className="wrap">
        <div>
          <Link to="/" className="h-brand"><img src="apple-touch-icon.png" alt="" width="44" height="44" /><span><b>همزات</b><small>مكتبة وسط البلد</small></span></Link>
          <p>{STORE.address}<br />{STORE.landmark}</p>
        </div>
        <nav aria-label="تسوّق">
          <h4>تسوّق</h4>
          <Link to="/shop">كل الكتب</Link><Link to="/shop?sets=1">السلاسل والمجموعات</Link><Link to="/wishlist">المفضلة</Link><Link to="/orders">طلباتي</Link>
        </nav>
        <nav aria-label="تواصل">
          <h4>تواصل معنا</h4>
          <a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a><a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a>
          <a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a><Link to="/about">العنوان والشحن</Link>
        </nav>
        <div>
          <h4>تابعنا</h4>
          <div className="socials">
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

export default function Haven() {
  return (
    <>
      <Header />
      <Pages Home={Home} Shop={Shop} Book={Book} Checkout={Checkout} Wishlist={Wishlist} Cart={Cart} />
      <Footer />
      <TabBar />
    </>
  )
}
