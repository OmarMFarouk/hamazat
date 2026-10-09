import { Link, useParams } from 'react-router-dom'
import { PAYMENTS, STORE } from '../data.js'
import { useStore } from '../store.jsx'
import { Empty, Icon, money, num } from '../ui.jsx'
import { Summary } from '../checkout.jsx'
import { NotFound } from './Misc.jsx'

const payName = (id) => PAYMENTS.find((p) => p.id === id)?.name
const day = (iso) => new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export function Orders() {
  const { orders } = useStore()
  return (
    <div className="wrap block narrow">
      <h1 className="page-title">طلباتي</h1>
      {orders.length === 0 ? (
        <Empty title="لم تطلب شيئًا بعد."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty>
      ) : (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/order/${o.id}`}>
                <div className="thumbs">{o.lines.slice(0, 3).map((l) => <img key={l.id} src={l.img} alt="" />)}</div>
                <span><b dir="ltr">{o.id}</b><small>{day(o.date)} — {num(o.lines.reduce((s, l) => s + l.qty, 0))} كتاب</small></span>
                <span className="chip">قيد التجهيز</span>
                <b>{money(o.totals.total)}</b>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Order() {
  const { id } = useParams()
  const { orders } = useStore()
  const o = orders.find((x) => x.id === id)
  if (!o) return <NotFound />
  const c = o.customer
  const pickup = c.method === 'pickup'
  const track = ['استلمنا طلبك', 'نجهّز الكتب', pickup ? 'جاهز للاستلام من المكتبة' : 'مع المندوب', pickup ? 'تم الاستلام' : 'تم التسليم']
  const msg = [
    `طلب جديد من الموقع ${o.id}`,
    ...o.lines.map((l) => `• ${l.title} × ${l.qty}`),
    `الإجمالي: ${o.totals.total} ج.م — ${payName(o.payment)}`,
    pickup ? 'استلام من المكتبة' : `${c.gov}، ${c.city}، ${c.address}`,
    `${c.name} — ${c.phone}`,
  ].join('\n')

  return (
    <div className="wrap block checkout">
      <div className="steps-col">
        <div className="done-head">
          <span className="done-mark"><Icon name="check" size={30} /></span>
          <h1>تم تأكيد طلبك، {c.name.split(' ')[0]}</h1>
          <p>رقم الطلب <b dir="ltr">{o.id}</b> — {day(o.date)}</p>
        </div>

        <ol className="track">
          {track.map((t, i) => <li key={t} className={i === 0 ? 'done' : i === 1 ? 'on' : ''}><i />{t}</li>)}
        </ol>

        {o.payment !== 'cod' && (
          <p className="note"><Icon name="check" /> {o.payment === 'card' ? `دُفع ببطاقة تنتهي بـ ${o.last4} (تجريبي).` : `سنراجع تحويل ${payName(o.payment)} (${o.ref}) ونؤكد لك على واتساب.`}</p>
        )}

        <dl className="review">
          <div><dt>المستلم</dt><dd>{c.name}<br /><span dir="ltr">{c.phone}</span></dd></div>
          <div><dt>{pickup ? 'الاستلام' : 'العنوان'}</dt><dd>{pickup ? `من المكتبة — ${STORE.address}` : <>{c.gov}، {c.city}<br />{c.address}{o.days && <><br /><small>يصل خلال {o.days}</small></>}</>}</dd></div>
          <div><dt>الدفع</dt><dd>{payName(o.payment)}{o.coupon && <><br /><small>كوبون <span dir="ltr">{o.coupon}</span></small></>}</dd></div>
          {c.notes && <div><dt>ملاحظات</dt><dd>{c.notes}</dd></div>}
        </dl>

        <div className="step-actions">
          <a className="btn btn-leaf" href={`${STORE.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> أرسل الطلب للمكتبة على واتساب</a>
          <Link to="/shop" className="btn btn-ghost">واصل التسوق</Link>
        </div>
      </div>
      <Summary q={{ ...o.totals, method: c.method, zone: true }} lines={o.lines} />
    </div>
  )
}
