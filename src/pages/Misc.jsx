import { Link } from 'react-router-dom'
import { BOOKS, COD_FEE, EXTRA_ITEM_FEE, FREE_SHIPPING_FROM, PAYMENTS, STORE, ZONES } from '../data.js'
import { useStore } from '../store.jsx'
import { BookTile, Empty, Icon, money, num } from '../ui.jsx'

export function Wishlist() {
  const { wish } = useStore()
  const list = BOOKS.filter((b) => wish.includes(b.id))
  return (
    <div className="wrap block">
      <h1 className="page-title">المفضلة</h1>
      {list.length ? <div className="grid">{list.map((b) => <BookTile key={b.id} book={b} />)}</div>
        : <Empty title="لم تحفظ أي كتاب بعد. اضغط على القلب في أي كتاب ليظهر هنا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty>}
    </div>
  )
}

export function About() {
  return (
    <div className="wrap block narrow about">
      <img src="logo.png" alt="شعار مكتبة همزات" width="140" height="140" className="about-logo" />
      <h1 className="page-title center">مكتبة همزات</h1>
      <p className="lead center">مكتبة في وسط البلد بالقاهرة. نختار كتبنا واحدًا واحدًا: روايات، فلسفة، تاريخ، علم نفس واجتماع، ونوصّلها لكل المحافظات.</p>

      <section className="panel">
        <h2>العنوان والتواصل</h2>
        <ul className="contact-list">
          <li><Icon name="pin" /><span>{STORE.address}<br />{STORE.landmark}</span></li>
          <li><Icon name="phone" /><a href={`tel:${STORE.mobile}`} dir="ltr">{STORE.mobile}</a><a href={`tel:${STORE.mobile2}`} dir="ltr">{STORE.mobile2}</a><a href={`tel:${STORE.landline}`} dir="ltr">{STORE.landline}</a></li>
          <li><Icon name="mail" /><a href={`mailto:${STORE.email}`} dir="ltr">{STORE.email}</a></li>
        </ul>
        <div className="about-actions">
          <a className="btn btn-leaf" href={STORE.whatsapp} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> واتساب</a>
          <a className="btn btn-ghost" href={STORE.facebook} target="_blank" rel="noreferrer"><Icon name="facebook" /> فيسبوك</a>
          <a className="btn btn-ghost" href={STORE.messenger} target="_blank" rel="noreferrer"><Icon name="messenger" /> ماسنجر</a>
          <a className="btn btn-ghost" href={STORE.map} target="_blank" rel="noreferrer"><Icon name="pin" /> الخريطة</a>
        </div>
      </section>

      <section>
        <h2>أسعار التوصيل</h2>
        <table className="zones">
          <thead><tr><th>المنطقة</th><th>المحافظات</th><th>المدة</th><th>السعر</th></tr></thead>
          <tbody>
            {ZONES.map((z) => <tr key={z.id}><td>{z.name}</td><td>{z.govs.join('، ')}</td><td>{z.days}</td><td>{money(z.fee)}</td></tr>)}
          </tbody>
        </table>
        <p className="fine">السعر حتى ٣ كتب، وكل كتاب إضافي {money(EXTRA_ITEM_FEE)}. الشحن مجاني للطلبات من {money(FREE_SHIPPING_FROM)}. الاستلام من المكتبة بدون رسوم. رسوم الدفع عند الاستلام {money(COD_FEE)}.</p>
      </section>

      <section>
        <h2>طرق الدفع</h2>
        <ul className="pay-plain">{PAYMENTS.map((p) => <li key={p.id}><b>{p.name}</b><span>{p.hint}</span></li>)}</ul>
      </section>
      <p className="fine">هذا موقع تجريبي: الأسعار ورسوم الشحن والكوبونات وبيانات التحويل أمثلة للعرض، وليست أسعار المكتبة الفعلية. {num(BOOKS.length)} كتابًا من صور صفحة المكتبة على فيسبوك.</p>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="wrap block">
      <Empty title="هذه الصفحة ليست على رفوفنا."><Link to="/" className="btn btn-ghost">عُد إلى الرئيسية</Link></Empty>
    </div>
  )
}
