import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FREE_SHIPPING_FROM, STORE } from '../data.js'
import { useSearch } from '../hooks.js'
import { useStore } from '../store.jsx'
import { AuthorHits, Empty, Icon, Qty, money, num } from '../ui.jsx'
import Pages from '../Pages.jsx'
import Home from '../pages/Home.jsx'
import Shop from '../pages/Shop.jsx'
import Product from '../pages/Product.jsx'
import Checkout from '../pages/Checkout.jsx'
import { Wishlist } from '../pages/Misc.jsx'

const NAV = [
  ['/', 'الرئيسية'],
  ['/shop', 'الكتب'],
  ['/shop?sets=1', 'السلاسل'],
  ['/orders', 'طلباتي'],
  ['/about', 'عن المكتبة'],
]

function Search() {
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
    <form className="search" ref={box} role="search"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`) }}>
      <Icon name="search" />
      <input type="search" value={q} placeholder="ابحث عن كتاب أو مؤلف…" aria-label="بحث"
        onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} />
      {open && q.trim() && (
        <div className="search-drop">
          <AuthorHits authors={authors} onPick={go} />
          {hits.map((b) => (
            <button type="button" key={b.id} onClick={() => go(`/book/${b.id}`)}>
              <img src={b.img} alt="" />
              <span><b>{b.title}</b><small>{b.author}</small></span>
            </button>
          ))}
          {hits.length ? <button type="submit" className="search-all">عرض كل النتائج</button>
            : !authors.length && <p>لا توجد نتائج لـ «{q.trim()}». جرّب اسم المؤلف.</p>}
        </div>
      )}
    </form>
  )
}

function Header() {
  const { count, setDrawer, wish } = useStore()
  const [menu, setMenu] = useState(false)
  const { pathname, search } = useLocation()
  useEffect(() => { setMenu(false) }, [pathname, search])
  return (
    <header className="header">
      <p className="announce">
        <Icon name="truck" size={15} /> التوصيل متاح لجميع المحافظات والدفع عند الاستلام
        <span> — شحن مجاني للطلبات من {num(FREE_SHIPPING_FROM)} ج.م</span>
      </p>
      <div className="bar">
        <Link to="/" className="brand" aria-label="مكتبة همزات — الرئيسية">
          <img src="apple-touch-icon.png" alt="" width="44" height="44" />
          <span>همزات</span>
        </Link>
        <Search />
        <nav className={`nav ${menu ? 'open' : ''}`} aria-label="التنقل الرئيسي">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end
              className={() => (pathname + search === to || (to === '/shop' && pathname === '/shop' && !search) ? 'active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <Link to="/wishlist" className="bar-icon" aria-label={`المفضلة (${wish.length})`}>
          <Icon name="heart" />{wish.length > 0 && <i />}
        </Link>
        <button type="button" className="bar-icon menu-btn" aria-label="القائمة" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <Icon name={menu ? 'close' : 'menu'} />
        </button>
        <button type="button" className="cart-btn" onClick={() => setDrawer(true)} aria-label={`السلة، ${count} كتاب`}>
          <Icon name="bag" /> <span>السلة</span> <b key={count}>{num(count)}</b>
        </button>
      </div>
    </header>
  )
}

export function CartDrawer() {
  const { drawer, setDrawer, lines, setQty } = useStore()
  const nav = useNavigate()
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const left = FREE_SHIPPING_FROM - subtotal
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    const esc = (e) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [drawer, setDrawer])
  return (
    <div className={`drawer-wrap ${drawer ? 'open' : ''}`} aria-hidden={!drawer}>
      <div className="overlay" onClick={() => setDrawer(false)} />
      <aside className="drawer" role="dialog" aria-label="سلة التسوق" inert={!drawer}>
        <div className="drawer-head">
          <h2>سلة التسوق</h2>
          <button type="button" className="bar-icon" onClick={() => setDrawer(false)} aria-label="إغلاق"><Icon name="close" /></button>
        </div>
        {lines.length === 0 ? (
          <Empty title="السلة فارغة. ابدأ بكتاب واحد.">
            <button type="button" className="btn btn-ghost" onClick={() => { setDrawer(false); nav('/shop') }}>تصفّح الكتب</button>
          </Empty>
        ) : (
          <>
            <div className="ship-meter">
              <p>{left > 0 ? <>أضف كتبًا بـ <b>{money(left)}</b> لتحصل على شحن مجاني</> : <>طلبك مؤهل للشحن المجاني</>}</p>
              <div><i style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} /></div>
            </div>
            <ul className="lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <img src={l.img} alt="" />
                  <div>
                    <Link to={`/book/${l.id}`} onClick={() => setDrawer(false)}>{l.title}</Link>
                    <small>{l.author}</small>
                    <div className="line-foot">
                      <Qty value={l.qty} onChange={(q) => setQty(l.id, q)} />
                      <b>{money(l.price * l.qty)}</b>
                    </div>
                  </div>
                  <button type="button" className="line-x" onClick={() => setQty(l.id, 0)} aria-label={`حذف ${l.title}`}><Icon name="close" size={14} /></button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <p><span>المجموع قبل الشحن</span><b>{money(subtotal)}</b></p>
              <small>يُحسب الشحن حسب المحافظة في الخطوة التالية.</small>
              <button type="button" className="btn btn-leaf btn-block" onClick={() => { setDrawer(false); nav('/checkout') }}>إتمام الطلب</button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <img src="apple-touch-icon.png" alt="" width="72" height="72" />
          <h3>مكتبة همزات</h3>
          <p>{STORE.address}<br />{STORE.landmark}</p>
        </div>
        <div>
          <h4>تسوّق</h4>
          <Link to="/shop">كل الكتب</Link>
          <Link to="/shop?sets=1">السلاسل والمجموعات</Link>
          <Link to="/wishlist">المفضلة</Link>
          <Link to="/orders">طلباتي</Link>
        </div>
        <div>
          <h4>تواصل معنا</h4>
          <a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a>
          <a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a>
          <a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a>
          <Link to="/about">العنوان والشحن</Link>
        </div>
        <div>
          <h4>تابعنا</h4>
          <div className="socials">
            <a href={STORE.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك"><Icon name="facebook" size={20} /></a>
            <a href={STORE.whatsapp} target="_blank" rel="noreferrer" aria-label="واتساب"><Icon name="whatsapp" size={20} /></a>
            <a href={STORE.messenger} target="_blank" rel="noreferrer" aria-label="ماسنجر"><Icon name="messenger" size={20} /></a>
            <a href={`mailto:${STORE.email}`} aria-label="البريد الإلكتروني"><Icon name="mail" size={20} /></a>
          </div>
          <div className="pay-badges">
            <span>كاش عند الاستلام</span><span>فودافون كاش</span><span>إنستاباي</span><span>بطاقة</span>
          </div>
        </div>
      </div>
      <p className="wrap footer-note">© {num(new Date().getFullYear()).replace(/٬/g, '')} مكتبة همزات. موقع تجريبي — الأسعار ووسائل الدفع للعرض فقط.</p>
    </footer>
  )
}

export default function Classic() {
  return (
    <>
      <Header />
      <Pages Home={Home} Shop={Shop} Book={Product} Checkout={Checkout} Wishlist={Wishlist} />
      <Footer />
      <CartDrawer />
    </>
  )
}
