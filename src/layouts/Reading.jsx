// غرفة القراءة — a quiet, magazine-like layout: one book at a time, set like a page.
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { BOOKS, CATEGORIES, FREE_SHIPPING_FROM, STORE, bookById, catName } from '../data.js'
import { Coupon, DeliveryStep, PaymentStep, PlaceButton, ReviewStep, STEPS, STEP_TITLES, Summary, useCheckout } from '../checkout.jsx'
import { SORTS, bookOfWeek, countIn, useActive, useBuy, useSearch, useShop } from '../hooks.js'
import { useLayout } from '../layout.jsx'
import { useStore } from '../store.jsx'
import { Empty, Icon, Price, Qty, WishButton, booksCount, money, num } from '../ui.jsx'
import Pages from '../Pages.jsx'
import { ShippingCalc } from '../pages/Home.jsx'
import { NotFound } from '../pages/Misc.jsx'

const NAV = [['/shop', 'الكتب'], ['/shop?sets=1', 'السلاسل'], ['/orders', 'طلباتي'], ['/about', 'عن المكتبة']]
const SIZES = [0.9, 1, 1.15]

// The hamza from the shop's name and logo, used as the section break.
const Ornament = () => <div className="r-orn" aria-hidden="true">ء</div>

function SearchOverlay({ onClose }) {
  const { q, setQ, hits } = useSearch(8)
  const nav = useNavigate()
  const go = (to) => { onClose(); nav(to) }
  return (
    <div className="r-search" role="dialog" aria-label="بحث">
      <form className="wrap narrow" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`) }}>
        <input type="search" autoFocus value={q} placeholder="اكتب عنوان كتاب أو اسم مؤلف" aria-label="بحث" onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="r-tool" onClick={onClose} aria-label="إغلاق البحث"><Icon name="close" /></button>
      </form>
      <div className="wrap narrow r-hits">
        {hits.map((b) => (
          <button type="button" key={b.id} onClick={() => go(`/book/${b.id}`)}>
            <img src={b.img} alt="" /><span><b>{b.title}</b><small>{b.author}</small></span><i>{money(b.price)}</i>
          </button>
        ))}
        {q.trim() && !hits.length && <p>لا يوجد كتاب بهذا الاسم على رفوفنا. جرّب اسم المؤلف.</p>}
        {!q.trim() && (
          <p className="r-hits-cats">أو ابدأ من قسم: {CATEGORIES.map((c) => <button type="button" key={c.id} onClick={() => go(`/shop?cat=${c.id}`)}>{c.name}</button>)}</p>
        )}
      </div>
    </div>
  )
}

function Header() {
  const { count, wish } = useStore()
  const { reader, setReader } = useLayout()
  const [panel, setPanel] = useState(null) // 'search' | 'menu' | 'reader'
  const { pathname, search } = useLocation()
  const active = useActive()
  const toggle = (p) => setPanel(panel === p ? null : p)
  useEffect(() => { setPanel(null) }, [pathname, search])
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && setPanel(null)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])
  return (
    <header className="r-header">
      <p className="r-announce">التوصيل لكل المحافظات والدفع عند الاستلام، والشحن مجاني للطلبات من {num(FREE_SHIPPING_FROM)} ج.م</p>
      <div className="wrap r-mast">
        <nav className="r-nav" aria-label="التنقل الرئيسي">
          {NAV.map(([to, label]) => <Link key={to} to={to} className={active(to) ? 'active' : ''}>{label}</Link>)}
        </nav>
        <button type="button" className="r-tool r-menu-btn" aria-label="القائمة" aria-expanded={panel === 'menu'} onClick={() => toggle('menu')}>
          <Icon name={panel === 'menu' ? 'close' : 'menu'} />
        </button>
        <Link to="/" className="r-brand" aria-label="مكتبة همزات — الرئيسية">
          <img src="apple-touch-icon.png" alt="" width="46" height="46" /><span>همزات</span>
        </Link>
        <div className="r-tools">
          <button type="button" className="r-tool" aria-label="بحث" aria-expanded={panel === 'search'} onClick={() => toggle('search')}><Icon name="search" /></button>
          <button type="button" className="r-tool r-aa" aria-label="إعدادات القراءة" aria-expanded={panel === 'reader'} onClick={() => toggle('reader')}>أ</button>
          <Link to="/wishlist" className="r-tool" aria-label={`المفضلة (${wish.length})`}><Icon name="heart" />{wish.length > 0 && <i />}</Link>
          <Link to="/cart" className="r-tool r-cart" aria-label={`السلة، ${count} كتاب`}><Icon name="bag" />{count > 0 && <b key={count}>{num(count)}</b>}</Link>
        </div>
      </div>
      {panel === 'reader' && (
        <div className="wrap r-pop-wrap">
          <div className="r-pop" role="group" aria-label="إعدادات القراءة">
            <label className="r-switch">
              <input type="checkbox" checked={reader.dark} onChange={(e) => setReader({ ...reader, dark: e.target.checked })} />
              <Icon name="moon" size={16} /> القراءة الليلية
            </label>
            <div className="r-sizes" role="group" aria-label="حجم الخط">
              <span>حجم الخط</span>
              {SIZES.map((s, i) => (
                <button type="button" key={s} aria-pressed={reader.size === s} aria-label={['صغير', 'متوسط', 'كبير'][i]}
                  style={{ fontSize: 15 + i * 5 }} onClick={() => setReader({ ...reader, size: s })}>أ</button>
              ))}
            </div>
          </div>
        </div>
      )}
      {panel === 'menu' && (
        <nav className="r-menu" aria-label="القائمة">
          <Link to="/">الرئيسية</Link>
          {NAV.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          <Link to="/wishlist">المفضلة</Link>
        </nav>
      )}
      {panel === 'search' && <SearchOverlay onClose={() => setPanel(null)} />}
    </header>
  )
}

// A book as a catalogue entry: the blurb gets as much room as the photo.
function Entry({ book, n }) {
  const { add } = useStore()
  return (
    <article className="r-entry">
      {n && <span className="r-n" aria-hidden="true">{num(n)}</span>}
      <Link to={`/book/${book.id}`} className="r-entry-img" tabIndex={-1} aria-hidden="true"><img src={book.img} alt="" loading="lazy" /></Link>
      <div>
        <h3><Link to={`/book/${book.id}`}>{book.title}</Link></h3>
        {book.sub && <em>{book.sub}</em>}
        <p className="r-by">{book.author}، <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link></p>
        <p className="r-blurb">{book.desc}</p>
        <div className="r-entry-foot">
          <Price book={book} />
          <button type="button" className="r-add" onClick={() => add(book.id)}>أضف للسلة</button>
          <WishButton id={book.id} />
        </div>
      </div>
    </article>
  )
}

function Card({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="r-card">
      <img src={book.img} alt="" loading="lazy" />
      <b>{book.title}</b>
      <small>{book.sub && book.set ? book.sub : book.author}</small>
      <Price book={book} />
    </Link>
  )
}

function Home() {
  const week = bookOfWeek()
  const { buy, added } = useBuy(week.id)
  const fresh = BOOKS.filter((b) => b.isNew && b.id !== week.id).slice(0, 4)
  const best = BOOKS.filter((b) => b.best && !b.set)
  const sets = BOOKS.filter((b) => b.set)
  const quoted = bookById('04')
  return (
    <>
      <section className="wrap r-hero">
        <Link to={`/book/${week.id}`} className="r-arch"><img src={week.img} alt={`${week.title} — ${week.author}`} /></Link>
        <div>
          <p className="r-kicker">كتاب هذا الأسبوع</p>
          <h1>{week.title}</h1>
          {week.sub && <p className="r-sub">{week.sub}</p>}
          <p className="r-by">{week.author}، {catName(week.cat)}</p>
          <p className="r-text">{week.desc}</p>
          <div className="r-actions">
            <button type="button" className="btn" onClick={() => buy()}>{added ? <><Icon name="check" /> أُضيف إلى السلة</> : `أضف للسلة بـ ${money(week.price)}`}</button>
            <Link to={`/book/${week.id}`} className="r-more">اقرأ عن الكتاب</Link>
          </div>
        </div>
      </section>

      <Ornament />

      <section className="wrap narrow">
        <div className="r-head"><h2>وصل حديثًا إلى الرفوف</h2><Link to="/shop?sort=new">كل الجديد</Link></div>
        <div className="r-list">{fresh.map((b, i) => <Entry key={b.id} book={b} n={i + 1} />)}</div>
      </section>

      <Ornament />

      <section className="wrap r-cats">
        <h2>من أي رف تحب أن تبدأ؟</h2>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.id}><Link to={`/shop?cat=${c.id}`}><b>{c.name}</b><span>{booksCount(countIn(c.id))}</span></Link></li>
          ))}
        </ul>
      </section>

      <section className="r-band">
        <div className="wrap">
          <div className="r-head"><h2>الأكثر طلبًا</h2><Link to="/shop">كل الكتب</Link></div>
          <div className="r-strip">{best.map((b) => <Card key={b.id} book={b} />)}</div>
        </div>
      </section>

      <section className="wrap narrow r-quote">
        <blockquote>شرور النفس أقوى من كل شيء وأصعب من أي سحر.</blockquote>
        <p>من <Link to={`/book/${quoted.id}`}>«{quoted.title}»</Link> لـ{quoted.author}</p>
      </section>

      <section className="r-band">
        <div className="wrap">
          <div className="r-head"><h2>سلاسل ومجموعات كاملة</h2><Link to="/shop?sets=1">كل السلاسل</Link></div>
          <div className="r-strip r-strip-lg">{sets.map((b) => <Card key={b.id} book={b} />)}</div>
        </div>
      </section>

      <section className="wrap r-how">
        <div>
          <h2>كيف يصلك طلبك</h2>
          <ol className="steps">
            <li><b>اختر كتبك</b><span>أضفها إلى السلة من الموقع، أو أرسل لنا العناوين على واتساب.</span></li>
            <li><b>حدّد المحافظة وطريقة الدفع</b><span>كاش عند الاستلام، فودافون كاش، إنستاباي أو بطاقة.</span></li>
            <li><b>استلم من المندوب أو من المكتبة</b><span>الاستلام من الفرع في وسط البلد بدون أي رسوم.</span></li>
          </ol>
        </div>
        <ShippingCalc />
      </section>

      <Ornament />

      <section className="wrap r-visit">
        <div className="r-arch"><img src="books/15.jpg" alt="رفوف مكتبة همزات من الداخل" loading="lazy" /></div>
        <div>
          <h2>زُرنا في وسط البلد</h2>
          <p className="r-text">{STORE.address}. {STORE.landmark}.</p>
          <ul className="contact-list">
            <li><Icon name="phone" /><a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a><a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a></li>
            <li><Icon name="mail" /><a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a></li>
            <li><Icon name="facebook" /><a href={STORE.facebook} target="_blank" rel="noreferrer">صفحتنا على فيسبوك، {num(29)} ألف متابع</a></li>
          </ul>
          <a href={STORE.map} target="_blank" rel="noreferrer" className="btn btn-ghost"><Icon name="pin" /> افتح الموقع على الخريطة</a>
        </div>
      </section>
    </>
  )
}

function Shop() {
  const { cat, sets, sort, set, list, title, clear, key } = useShop()
  return (
    <div className="wrap r-page">
      <header className="r-page-head">
        <h1>{title}</h1>
        <p>{booksCount(list.length)}</p>
      </header>
      <div className="r-filters">
        <div className="r-chips" role="group" aria-label="الأقسام">
          {[{ id: 'all', name: 'الكل' }, ...CATEGORIES].map((c) => (
            <button type="button" key={c.id} aria-pressed={cat === c.id} onClick={() => set('cat', c.id === 'all' ? '' : c.id)}>{c.name}</button>
          ))}
          <button type="button" aria-pressed={sets} onClick={() => set('sets', sets ? '' : '1')}>مجموعات فقط</button>
        </div>
        <label className="sort">ترتيب
          <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
            {Object.entries(SORTS).map(([k, [name]]) => <option key={k} value={k}>{name}</option>)}
          </select>
        </label>
      </div>
      {list.length ? (
        <div className="r-list r-list-2" key={key}>{list.map((b) => <Entry key={b.id} book={b} />)}</div>
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
  const [qty, setQty] = useState(1)
  if (!book) return <NotFound />
  const related = BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id).slice(0, 6)
  const ask = `${STORE.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن كتاب «${book.title}» — ${book.author}`)}`
  return (
    <>
      <div className="wrap r-book">
        <div className="r-book-img"><img src={book.img} alt={`${book.title} — ${book.author}`} /></div>
        <article>
          <nav className="crumbs" aria-label="مسار التنقل">
            <Link to="/shop">الكتب</Link><Icon name="back" size={12} />
            <Link to={`/shop?cat=${book.cat}`}>{catName(book.cat)}</Link>
          </nav>
          <h1>{book.title}</h1>
          {book.sub && <p className="r-sub">{book.sub}</p>}
          <p className="r-by">{book.author}</p>
          <div className="chips">
            {book.isNew && <span className="chip chip-new">وصل حديثًا</span>}
            {book.set && <span className="chip">مجموعة كاملة</span>}
            {book.best && <span className="chip">الأكثر طلبًا</span>}
          </div>
          <p className="r-text">{book.desc}</p>

          <div className="r-buy">
            <Price book={book} className="price-lg" />
            <div>
              <Qty value={qty} onChange={(v) => setQty(Math.max(1, Math.min(20, v)))} />
              <button type="button" className="btn" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}</button>
              <WishButton id={book.id} />
            </div>
            {added && <Link to="/cart" className="link">افتح السلة وأكمل الطلب</Link>}
          </div>

          <dl className="facts">
            <div><dt>المؤلف</dt><dd>{book.author}</dd></div>
            <div><dt>القسم</dt><dd>{catName(book.cat)}</dd></div>
            <div><dt>التوفر</dt><dd className="ok">متوفر في المكتبة</dd></div>
            <div><dt>التوصيل</dt><dd>لجميع المحافظات، والدفع عند الاستلام</dd></div>
          </dl>
          <a className="r-more" href={ask} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> اسأل المكتبة عن هذا الكتاب</a>
        </article>
      </div>

      {related.length > 0 && (
        <section className="r-band">
          <div className="wrap">
            <div className="r-head"><h2>من رف {catName(book.cat)}</h2><Link to={`/shop?cat=${book.cat}`}>كل الرف</Link></div>
            <div className="r-strip">{related.map((b) => <Card key={b.id} book={b} />)}</div>
          </div>
        </section>
      )}

      <div className="r-buybar">
        <span><b>{book.title}</b><Price book={book} /></span>
        <button type="button" className="btn" onClick={() => buy(qty)}>{added ? <><Icon name="check" /> أُضيف</> : 'أضف للسلة'}</button>
      </div>
    </>
  )
}

// The cart is a page here, printed like the shop's paper receipt.
function Cart() {
  const { lines, setQty } = useStore()
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const left = FREE_SHIPPING_FROM - subtotal
  const today = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  if (!lines.length) {
    return <div className="wrap narrow r-page"><Empty title="السلة فارغة. ابدأ بكتاب واحد."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty></div>
  }
  return (
    <div className="wrap r-page">
      <div className="r-receipt">
        <header>
          <img src="apple-touch-icon.png" alt="" width="54" height="54" />
          <h1>سلة القراءة</h1>
          <p>{STORE.name}، وسط البلد<br />{today}</p>
        </header>
        <ul>
          {lines.map((l) => (
            <li key={l.id}>
              <img src={l.img} alt="" />
              <div>
                <Link to={`/book/${l.id}`}>{l.title}</Link>
                <small>{l.author}</small>
                <Qty value={l.qty} onChange={(q) => setQty(l.id, q)} />
              </div>
              <span>
                <b>{money(l.price * l.qty)}</b>
                <button type="button" className="link" onClick={() => setQty(l.id, 0)} aria-label={`حذف ${l.title}`}>حذف</button>
              </span>
            </li>
          ))}
        </ul>
        <dl>
          <div><dt>المجموع قبل الشحن</dt><dd>{money(subtotal)}</dd></div>
          <div className="r-ship"><dt>{left > 0 ? <>أضف كتبًا بـ {money(left)} ليصير الشحن مجانيًا</> : 'طلبك مؤهل للشحن المجاني'}</dt></div>
        </dl>
        <div className="r-meter"><i style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} /></div>
        <Link to="/checkout" className="btn btn-block">إتمام الطلب</Link>
        <Link to="/shop" className="r-more">أضف كتبًا أخرى</Link>
      </div>
    </div>
  )
}

function Checkout() {
  const c = useCheckout()
  const { step, setStep, lines, q } = c
  if (!lines.length) {
    return <div className="wrap narrow r-page"><Empty title="لا يوجد ما تدفع ثمنه بعد. أضف كتابًا إلى السلة أولًا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty></div>
  }
  return (
    <div className="wrap r-page r-checkout">
      <div>
        <ol className="r-progress" aria-label={`الخطوة ${step} من 3`}>
          {STEPS.map((s, i) => <li key={s} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>{s}</li>)}
        </ol>
        {step > 1
          ? <button type="button" className="link back" onClick={() => setStep(step - 1)}><Icon name="back" size={12} /> رجوع</button>
          : <Link to="/cart" className="link back"><Icon name="back" size={12} /> رجوع إلى السلة</Link>}
        <h1>{STEP_TITLES[step - 1]}</h1>
        <div className="step" key={step}>
          {step === 1 && <DeliveryStep c={c} />}
          {step === 2 && <PaymentStep c={c} />}
          {step === 3 && <ReviewStep c={c} />}
        </div>
        <div className="step-actions">
          {step < 3
            ? <button type="button" className="btn" onClick={c.next}>{step === 1 ? 'متابعة إلى الدفع' : 'متابعة إلى المراجعة'}</button>
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
    <div className="wrap r-page">
      <header className="r-page-head"><h1>المفضلة</h1><p>{booksCount(list.length)}</p></header>
      {list.length ? <div className="r-list r-list-2">{list.map((b) => <Entry key={b.id} book={b} />)}</div>
        : <Empty title="لم تحفظ أي كتاب بعد. اضغط على القلب في أي كتاب ليظهر هنا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty>}
    </div>
  )
}

function Footer() {
  return (
    <footer className="r-footer">
      <div className="wrap">
        <Ornament />
        <img src="apple-touch-icon.png" alt="" width="64" height="64" />
        <h2>مكتبة همزات</h2>
        <p>{STORE.address}<br />{STORE.landmark}</p>
        <nav aria-label="روابط التذييل">
          <Link to="/shop">كل الكتب</Link><Link to="/shop?sets=1">السلاسل</Link><Link to="/wishlist">المفضلة</Link>
          <Link to="/orders">طلباتي</Link><Link to="/about">العنوان والشحن</Link>
        </nav>
        <div className="r-social">
          <a href={STORE.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك"><Icon name="facebook" size={20} /></a>
          <a href={STORE.whatsapp} target="_blank" rel="noreferrer" aria-label="واتساب"><Icon name="whatsapp" size={20} /></a>
          <a href={STORE.messenger} target="_blank" rel="noreferrer" aria-label="ماسنجر"><Icon name="messenger" size={20} /></a>
          <a href={`tel:${STORE.mobile}`} aria-label="اتصل بنا"><Icon name="phone" size={20} /></a>
        </div>
        <small>© {num(new Date().getFullYear()).replace(/٬/g, '')} مكتبة همزات. موقع تجريبي — الأسعار ووسائل الدفع للعرض فقط.</small>
      </div>
    </footer>
  )
}

export default function Reading() {
  return (
    <>
      <Header />
      <Pages Home={Home} Shop={Shop} Book={Book} Checkout={Checkout} Wishlist={Wishlist} Cart={Cart} />
      <Footer />
    </>
  )
}
