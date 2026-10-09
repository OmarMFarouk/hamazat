// ليل وسط البلد — the shop after dark: walnut, lamplight, and the photos doing the talking.
import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BOOKS, CATEGORIES, STORE, bookById, catName } from '../data.js'
import { Coupon, DeliveryStep, PaymentStep, PlaceButton, ReviewStep, STEPS, STEP_TITLES, Summary, useCheckout } from '../checkout.jsx'
import { SORTS, useActive, useBuy, useSearch, useShop } from '../hooks.js'
import { useStore } from '../store.jsx'
import { Empty, Icon, Price, Qty, WishButton, booksCount, num } from '../ui.jsx'
import Pages from '../Pages.jsx'
import { ShippingCalc } from '../pages/Home.jsx'
import { NotFound } from '../pages/Misc.jsx'
import { CartDrawer } from './Classic.jsx'

const NAV = [['/shop', 'الكتب'], ['/shop?sets=1', 'السلاسل'], ['/orders', 'طلباتي'], ['/about', 'عن المكتبة']]
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent('مكتبة همزات 105 شارع محمد فريد وسط البلد القاهرة')}&output=embed`

function Header() {
  const { count, wish, setDrawer } = useStore()
  const { pathname, search } = useLocation()
  const nav = useNavigate()
  const active = useActive()
  const { q, setQ, hits } = useSearch()
  const [scrolled, setScrolled] = useState(false)
  const [panel, setPanel] = useState(null) // 'menu' | 'search'
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { setPanel(null); setQ('') }, [pathname, search, setQ])
  const go = (to) => { setPanel(null); nav(to) }
  // clear over the home photo, solid everywhere else
  const over = pathname === '/' && !scrolled && !panel
  return (
    <header className={`n-header ${over ? 'over' : ''}`}>
      <div className="n-bar">
        <Link to="/" className="n-brand" aria-label="مكتبة همزات — الرئيسية">
          <img src="apple-touch-icon.png" alt="" width="46" height="46" /><span>همزات</span>
        </Link>
        <nav className="n-nav" aria-label="التنقل الرئيسي">
          {NAV.map(([to, label]) => <Link key={to} to={to} className={active(to) ? 'active' : ''}>{label}</Link>)}
        </nav>
        <div className="n-tools">
          <button type="button" aria-label="بحث" aria-expanded={panel === 'search'} onClick={() => setPanel(panel === 'search' ? null : 'search')}><Icon name="search" /></button>
          <Link to="/wishlist" aria-label={`المفضلة (${wish.length})`}><Icon name="heart" />{wish.length > 0 && <i />}</Link>
          <button type="button" className="n-cart" onClick={() => setDrawer(true)} aria-label={`السلة، ${count} كتاب`}><Icon name="bag" />{count > 0 && <b key={count}>{num(count)}</b>}</button>
          <button type="button" className="n-menu-btn" aria-label="القائمة" aria-expanded={panel === 'menu'} onClick={() => setPanel(panel === 'menu' ? null : 'menu')}><Icon name={panel === 'menu' ? 'close' : 'menu'} /></button>
        </div>
      </div>
      {panel === 'search' && (
        <form className="n-search" role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`) }}>
          <input type="search" autoFocus value={q} placeholder="ابحث عن كتاب أو مؤلف" aria-label="بحث" onChange={(e) => setQ(e.target.value)} />
          {q.trim() && (
            <div>
              {hits.map((b) => (
                <button type="button" key={b.id} onClick={() => go(`/book/${b.id}`)}>
                  <img src={b.img} alt="" /><span><b>{b.title}</b><small>{b.author}</small></span>
                </button>
              ))}
              {!hits.length && <p>لا يوجد كتاب بهذا الاسم. جرّب اسم المؤلف.</p>}
            </div>
          )}
        </form>
      )}
      {panel === 'menu' && (
        <nav className="n-menu" aria-label="القائمة">
          <Link to="/">الرئيسية</Link>
          {NAV.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
        </nav>
      )}
    </header>
  )
}

function NCard({ book }) {
  const { add } = useStore()
  return (
    <article className="n-card">
      <Link to={`/book/${book.id}`} className="n-card-img" aria-label={`${book.title} — ${book.author}`}><img src={book.img} alt="" loading="lazy" /></Link>
      {(book.isNew || book.set) && <span className="n-tag">{book.isNew ? 'وصل حديثًا' : 'مجموعة'}</span>}
      <WishButton id={book.id} className="n-card-wish" />
      <div className="n-card-cap">
        <Link to={`/book/${book.id}`}>{book.title}</Link>
        <small>{book.set && book.sub ? book.sub : book.author}</small>
        <span><Price book={book} /><button type="button" className="n-add" onClick={() => add(book.id)}>أضف للسلة</button></span>
      </div>
    </article>
  )
}

// New arrivals fanned out like a hand of cards; the caption follows the one you pick.
function Fan() {
  const fresh = BOOKS.filter((b) => b.isNew)
  const [i, setI] = useState(Math.floor(fresh.length / 2))
  const b = fresh[i]
  const { buy, added } = useBuy(b.id)
  const mid = (fresh.length - 1) / 2
  return (
    <section className="wrap n-fan">
      <div className="n-fan-photos" role="tablist" aria-label="وصل حديثًا">
        {fresh.map((x, k) => (
          <button type="button" key={x.id} role="tab" aria-selected={k === i} aria-label={x.title} className={k === i ? 'on' : ''}
            style={{ '--k': k - mid, '--a': Math.abs(k - mid) }} onMouseEnter={() => setI(k)} onFocus={() => setI(k)} onClick={() => setI(k)}>
            <img src={x.img} alt="" />
          </button>
        ))}
      </div>
      <div className="n-fan-text">
        <h2>وصل حديثًا</h2>
        <div key={b.id}>
          <h3><Link to={`/book/${b.id}`}>{b.title}</Link></h3>
          <p className="n-by">{b.author}، {catName(b.cat)}</p>
          <p className="n-desc">{b.desc}</p>
          <div className="n-cta">
            <button type="button" className="btn btn-leaf" onClick={() => buy()}>{added ? <><Icon name="check" /> أُضيف</> : <>أضف للسلة بـ <Price book={b} /></>}</button>
            <Link to="/shop?sort=new" className="btn btn-ghost">كل الجديد</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// Best-sellers under a single lamp: whichever book is centred is lit.
function Spotlight() {
  const best = BOOKS.filter((b) => b.best)
  const [i, setI] = useState(0)
  const track = useRef(null)
  const { add } = useStore()
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setI(+e.target.dataset.i)),
      { root: track.current, rootMargin: '0px -49% 0px -49%' },
    )
    for (const el of track.current.children) io.observe(el)
    return () => io.disconnect()
  }, [])
  const go = (k) => {
    const el = track.current.children[Math.max(0, Math.min(best.length - 1, k))]
    // scroll the strip only; scrollIntoView would also drag the page
    track.current.scrollTo({ left: el.offsetLeft - (track.current.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
  }
  const b = best[i]
  return (
    <section className="n-spot">
      <div className="wrap n-spot-head">
        <h2>الأكثر طلبًا</h2>
        <div className="n-arrows">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label="الكتاب السابق"><Icon name="back" /></button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === best.length - 1} aria-label="الكتاب التالي"><Icon name="back" /></button>
        </div>
      </div>
      <div className="n-spot-track" ref={track}>
        {best.map((x, k) => (
          <button type="button" key={x.id} data-i={k} className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={x.title} aria-current={k === i}>
            <img src={x.img} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="wrap n-spot-cap" key={b.id} aria-live="polite">
        <h3><Link to={`/book/${b.id}`}>{b.title}</Link></h3>
        <p className="n-by">{b.author}</p>
        <div className="n-cta">
          <button type="button" className="btn btn-leaf" onClick={() => add(b.id)}>أضف للسلة بـ <Price book={b} /></button>
          <Link to={`/book/${b.id}`} className="btn btn-ghost">عن الكتاب</Link>
        </div>
      </div>
    </section>
  )
}

function Home() {
  const sets = BOOKS.filter((b) => b.set)
  return (
    <>
      <section className="n-hero">
        <div className="n-hero-photo"><img src="books/15.jpg" alt="رفوف مكتبة همزات وشعارها الخشبي" /></div>
        <div className="n-hero-text">
          <h1>من رفوف وسط البلد إلى باب بيتك</h1>
          <p>روايات وفلسفة وتاريخ وعلم نفس، نختارها كتابًا كتابًا ونوصّلها لكل المحافظات. تدفع عند الاستلام.</p>
          <div className="n-cta">
            <Link to="/shop" className="btn btn-leaf">تصفّح الكتب</Link>
            <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost"><Icon name="whatsapp" /> اطلب عبر واتساب</a>
          </div>
          <p className="n-where"><Icon name="pin" size={16} /> {STORE.address}</p>
        </div>
      </section>

      <Fan />
      <Spotlight />

      <section className="wrap n-cats">
        <h2>ادخل من أي باب</h2>
        <p>
          {CATEGORIES.map((c, k) => (
            <Fragment key={c.id}>{k > 0 && <i aria-hidden="true">ء</i>}<Link to={`/shop?cat=${c.id}`}>{c.name}</Link></Fragment>
          ))}
        </p>
      </section>

      <section className="wrap n-block">
        <div className="n-head"><h2>سلاسل ومجموعات كاملة</h2><Link to="/shop?sets=1">كل السلاسل</Link></div>
        <div className="n-grid">{sets.slice(0, 6).map((b) => <NCard key={b.id} book={b} />)}</div>
      </section>

      <section className="wrap n-block">
        <div className="n-cream n-how">
          <div>
            <h2>كيف يصلك طلبك</h2>
            <ol className="steps">
              <li><b>اختر كتبك</b><span>أضفها إلى السلة من الموقع، أو أرسل لنا العناوين على واتساب.</span></li>
              <li><b>حدّد المحافظة وطريقة الدفع</b><span>كاش عند الاستلام، فودافون كاش، إنستاباي أو بطاقة.</span></li>
              <li><b>استلم من المندوب أو من المكتبة</b><span>الاستلام من الفرع في وسط البلد بدون أي رسوم.</span></li>
            </ol>
          </div>
          <ShippingCalc />
        </div>
      </section>

      <section className="n-visit">
        <iframe title="موقع مكتبة همزات على الخريطة" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div>
          <h2>زُرنا في وسط البلد</h2>
          <p className="n-desc">{STORE.address}<br />{STORE.landmark}</p>
          <ul className="contact-list">
            <li><Icon name="phone" /><a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a><a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a></li>
            <li><Icon name="mail" /><a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a></li>
            <li><Icon name="facebook" /><a href={STORE.facebook} target="_blank" rel="noreferrer">صفحتنا على فيسبوك، {num(29)} ألف متابع</a></li>
          </ul>
          <a href={STORE.map} target="_blank" rel="noreferrer" className="btn btn-leaf"><Icon name="pin" /> افتح الاتجاهات في الخرائط</a>
        </div>
      </section>
    </>
  )
}

function Shop() {
  const { cat, sets, sort, set, list, title, clear, key } = useShop()
  return (
    <div className="wrap n-page">
      <header className="n-page-head"><h1>{title}</h1><p>{booksCount(list.length)}</p></header>
      <div className="n-filters">
        <div className="n-tabs" role="group" aria-label="الأقسام">
          {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map((c) => (
            <button type="button" key={c.id} aria-pressed={cat === c.id} onClick={() => set('cat', c.id === 'all' ? '' : c.id)}>{c.name}</button>
          ))}
        </div>
        <div>
          <label className="check"><input type="checkbox" checked={sets} onChange={(e) => set('sets', e.target.checked ? '1' : '')} /> مجموعات فقط</label>
          <label className="sort">ترتيب
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
            </select>
          </label>
        </div>
      </div>
      {list.length ? (
        <div className="n-grid" key={key}>{list.map((b) => <NCard key={b.id} book={b} />)}</div>
      ) : (
        <Empty title="لا توجد كتب بهذه المواصفات."><button type="button" className="btn btn-ghost" onClick={clear}>امسح التصفية</button></Empty>
      )}
    </div>
  )
}

function Book() {
  const { id } = useParams()
  const book = bookById(id)
  const { buy, added } = useBuy(id)
  const { setDrawer } = useStore()
  const [qty, setQty] = useState(1)
  if (!book) return <NotFound />
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id).slice(0, 3)
  const ask = `${STORE.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن كتاب «${book.title}» — ${book.author}`)}`
  return (
    <>
      <div className="n-book">
        <div className="n-book-photo"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
        <article>
          <nav className="crumbs" aria-label="مسار التنقل">
            <Link to="/shop">الكتب</Link><Icon name="back" size={12} />
            <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link>
          </nav>
          <h1>{book.title}</h1>
          {book.sub && <p className="n-sub">{book.sub}</p>}
          <p className="n-by">{book.author}</p>
          <div className="chips">
            {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
            {book.set && <span className="chip">مجموعة كاملة</span>}
            {book.best && <span className="chip">الأكثر طلبًا</span>}
          </div>
          <p className="n-desc">{book.desc}</p>
          <Price book={book} className="price-lg" />
          <div className="n-buy">
            <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
            <button type="button" className="btn btn-leaf" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}</button>
            <WishButton id={book.id} />
          </div>
          {added && <button type="button" className="link" onClick={() => setDrawer(true)}>افتح السلة وأكمل الطلب</button>}
          <dl className="facts">
            <div><dt>القسم</dt><dd>{catName(book.cat)}</dd></div>
            <div><dt>التوفر</dt><dd className="ok">متوفر في المكتبة</dd></div>
            <div><dt>التوصيل</dt><dd>لجميع المحافظات، والدفع عند الاستلام</dd></div>
          </dl>
          <a className="btn btn-ghost" href={ask} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> اسأل عن الكتاب على واتساب</a>
        </article>
      </div>
      {related.length > 0 && (
        <section className="wrap n-block">
          <div className="n-head"><h2>من نفس القسم</h2><Link to={`/shop?cat=${book.cat}`}>كل كتب {catName(book.cat)}</Link></div>
          <div className="n-grid">{related.map((b) => <NCard key={b.id} book={b} />)}</div>
        </section>
      )}
    </>
  )
}

// Forms sit on a cream card: long dark forms are tiring, and mistakes cost the shop a delivery.
function Checkout() {
  const c = useCheckout()
  const { step, setStep, lines, q } = c
  if (!lines.length) {
    return <div className="wrap n-page"><Empty title="لا يوجد ما تدفع ثمنه بعد. أضف كتابًا إلى السلة أولًا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty></div>
  }
  return (
    <div className="wrap n-page n-checkout">
      <div className="n-cream">
        <ol className="n-steps">{STEPS.map((s, i) => <li key={s} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}><i>{num(i + 1)}</i>{s}</li>)}</ol>
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
  )
}

function Wishlist() {
  const { wish } = useStore()
  const list = BOOKS.filter((b) => wish.includes(b.id))
  return (
    <div className="wrap n-page">
      <header className="n-page-head"><h1>المفضلة</h1><p>{booksCount(list.length)}</p></header>
      {list.length ? <div className="n-grid">{list.map((b) => <NCard key={b.id} book={b} />)}</div>
        : <Empty title="لم تحفظ أي كتاب بعد. اضغط على القلب في أي كتاب ليظهر هنا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty>}
    </div>
  )
}

function Footer() {
  return (
    <footer className="n-footer">
      <div className="wrap">
        <p className="n-wordmark" aria-hidden="true">همزات</p>
        <div className="n-footer-grid">
          <div>
            <h3>مكتبة همزات</h3>
            <p>{STORE.address}<br />{STORE.landmark}</p>
          </div>
          <nav aria-label="روابط التذييل">
            <Link to="/shop">كل الكتب</Link><Link to="/shop?sets=1">السلاسل والمجموعات</Link>
            <Link to="/wishlist">المفضلة</Link><Link to="/orders">طلباتي</Link><Link to="/about">العنوان والشحن</Link>
          </nav>
          <div>
            <a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a>
            <a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a>
            <a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a>
            <div className="socials">
              <a href={STORE.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك"><Icon name="facebook" size={20} /></a>
              <a href={STORE.whatsapp} target="_blank" rel="noreferrer" aria-label="واتساب"><Icon name="whatsapp" size={20} /></a>
              <a href={STORE.messenger} target="_blank" rel="noreferrer" aria-label="ماسنجر"><Icon name="messenger" size={20} /></a>
            </div>
          </div>
        </div>
        <small>© {num(new Date().getFullYear()).replace(/٬/g, '')} مكتبة همزات. موقع تجريبي — الأسعار ووسائل الدفع للعرض فقط.</small>
      </div>
    </footer>
  )
}

export default function Night() {
  return (
    <>
      <Header />
      <Pages Home={Home} Shop={Shop} Book={Book} Checkout={Checkout} Wishlist={Wishlist} />
      <Footer />
      <CartDrawer />
    </>
  )
}
