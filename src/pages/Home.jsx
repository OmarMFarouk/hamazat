import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, CATEGORIES, EXTRA_ITEM_FEE, STORE, ZONES, zoneOf } from '../data.js'
import { BookTile, Icon, Price, Reveal, money, num } from '../ui.jsx'

// x in % of the row, y in px, rotation in deg, width in px
const SCATTER = [
  ['39', 1, 34, -7, 128], ['33', 9, 96, 5, 150], ['36', 19, 6, 3, 136], ['27', 28, 104, -5, 124],
  ['20', 37, 22, 6, 142], ['35', 47, 88, -3, 156], ['09', 57, 0, 4, 130], ['12', 65, 100, -6, 138],
  ['37', 74, 26, 7, 126], ['16', 82, 92, -4, 148], ['10', 90, 10, 5, 122],
]

function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-text">
        <h1>من رفوف وسط البلد إلى باب بيتك</h1>
        <p>مكتبة همزات في ١٠٥ شارع محمد فريد. روايات وفلسفة وتاريخ وعلم نفس، نوصّلها لكل المحافظات وتدفع عند الاستلام.</p>
        <div className="hero-cta">
          <Link to="/shop" className="btn btn-leaf">تصفّح الكتب</Link>
          <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="btn btn-ghost"><Icon name="whatsapp" /> اطلب عبر واتساب</a>
        </div>
      </div>
      <div className="scatter" aria-label="كتب من رفوف المكتبة">
        {SCATTER.map(([id, x, y, r, w], i) => {
          const b = BOOKS.find((k) => k.id === id)
          return (
            <Link key={id} to={`/book/${id}`} className={i % 2 ? 'hide-sm' : ''} title={b.title}
              style={{ '--x': `${x}%`, '--y': `${y}px`, '--r': `${r}deg`, '--w': `${w}px`, '--i': i }}>
              <img src={b.img} alt={b.title} />
            </Link>
          )
        })}
      </div>
      <p className="hero-hint">اضغط على أي كتاب لتتعرّف عليه</p>
    </section>
  )
}

function Feature({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="feature">
      <img src={book.img} alt="" loading="lazy" />
      <div>
        <h3>{book.title}</h3>
        {book.sub && <em>{book.sub}</em>}
        <small>{book.author}</small>
        <Price book={book} />
      </div>
    </Link>
  )
}

export function ShippingCalc() {
  const [gov, setGov] = useState('القاهرة')
  const z = zoneOf(gov)
  return (
    <div className="calc">
      <label htmlFor="calc-gov">احسب تكلفة التوصيل إلى</label>
      <select id="calc-gov" value={gov} onChange={(e) => setGov(e.target.value)}>
        {ZONES.map((zn) => (
          <optgroup key={zn.id} label={zn.name}>{zn.govs.map((g) => <option key={g}>{g}</option>)}</optgroup>
        ))}
      </select>
      <div className="calc-out" key={gov}>
        <b>{money(z.fee)}</b>
        <span>يصلك خلال {z.days}</span>
      </div>
      <small>حتى ٣ كتب. كل كتاب إضافي {money(EXTRA_ITEM_FEE)}.</small>
    </div>
  )
}

export default function Home() {
  const [cat, setCat] = useState('all')
  const fresh = BOOKS.filter((b) => b.isNew).slice(0, 4)
  const best = BOOKS.filter((b) => (cat === 'all' ? b.best : b.cat === cat && !b.set)).slice(0, 8)
  const sets = BOOKS.filter((b) => b.set)
  return (
    <>
      <Hero />

      <Reveal className="wrap block">
        <div className="block-head">
          <h2>وصل حديثًا</h2>
          <Link to="/shop?sort=new">كل الجديد</Link>
        </div>
        <div className="features">{fresh.map((b) => <Feature key={b.id} book={b} />)}</div>
      </Reveal>

      <Reveal className="wrap block">
        <div className="block-head">
          <h2>{cat === 'all' ? 'الأكثر طلبًا' : CATEGORIES.find((c) => c.id === cat).name}</h2>
          <div className="tabs" role="tablist">
            {[{ id: 'all', name: 'الأكثر طلبًا' }, ...CATEGORIES].map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'active' : ''} onClick={() => setCat(c.id)}>{c.name}</button>
            ))}
          </div>
        </div>
        <div className="grid" key={cat}>{best.map((b) => <BookTile key={b.id} book={b} />)}</div>
      </Reveal>

      <Reveal className="shelf">
        <h2>سلاسل ومجموعات كاملة على <i>رف واحد</i></h2>
        <p>أحمد خالد توفيق، نبيل فاروق، هوبزباوم، طاهرة مافي</p>
        <div className="shelf-track">
          <div>
            {[...sets, ...sets].map((b, i) => (
              <Link key={i} to={`/book/${b.id}`} aria-hidden={i >= sets.length} tabIndex={i >= sets.length ? -1 : 0}>
                <img src={b.img} alt={b.title} loading="lazy" />
                <span>{b.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <Link to="/shop?sets=1" className="btn">كل السلاسل</Link>
      </Reveal>

      <Reveal className="wrap block how">
        <div>
          <h2>كيف يصلك طلبك</h2>
          <ol className="steps">
            <li><b>اختر كتبك</b><span>أضفها إلى السلة من الموقع، أو أرسل لنا العناوين على واتساب.</span></li>
            <li><b>حدّد المحافظة وطريقة الدفع</b><span>كاش عند الاستلام، فودافون كاش، إنستاباي أو بطاقة.</span></li>
            <li><b>استلم من المندوب أو من المكتبة</b><span>الاستلام من الفرع في وسط البلد بدون أي رسوم.</span></li>
          </ol>
        </div>
        <ShippingCalc />
      </Reveal>

      <Reveal className="wrap block visit">
        <img src="books/15.jpg" alt="رفوف مكتبة همزات من الداخل" loading="lazy" />
        <div>
          <h2>زُرنا في وسط البلد</h2>
          <p className="lead">{STORE.address}</p>
          <p>{STORE.landmark}</p>
          <ul className="contact-list">
            <li><Icon name="phone" /><a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a><a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a></li>
            <li><Icon name="mail" /><a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a></li>
            <li><Icon name="facebook" /><a href={STORE.facebook} target="_blank" rel="noreferrer">صفحتنا على فيسبوك — {num(29)} ألف متابع</a></li>
          </ul>
          <p className="rating"><b>١٠٠٪</b> من {num(28)} تقييمًا على فيسبوك يرشّحون المكتبة</p>
          <a href={STORE.map} target="_blank" rel="noreferrer" className="btn btn-ghost"><Icon name="pin" /> افتح الموقع على الخريطة</a>
        </div>
      </Reveal>
    </>
  )
}
