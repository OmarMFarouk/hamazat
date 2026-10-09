// Checkout state and form steps. Every layout composes these; only the page frame differs.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COUPONS, PAYMENTS, STORE, ZONES } from './data.js'
import { quote } from './pricing.js'
import { useStore } from './store.jsx'
import { Icon, money, num } from './ui.jsx'

export const STEPS = ['التوصيل', 'الدفع', 'المراجعة']
export const STEP_TITLES = ['إلى أين نرسل الكتب؟', 'كيف تحب أن تدفع؟', 'راجع طلبك قبل التأكيد']
const PHONE = /^01[0125]\d{8}$/
const DEMO = { name: 'قارئ تجريبي', phone: '01012345678', gov: 'الجيزة', city: 'الدقي', address: '١٢ شارع التحرير، الدور الثالث، شقة ٥' }

function errorsFor(step, f) {
  const e = {}
  if (step === 1) {
    if (f.name.trim().length < 3) e.name = 'اكتب الاسم كاملًا'
    if (!PHONE.test(f.phone)) e.phone = 'رقم موبايل مصري من ١١ رقمًا يبدأ بـ 01'
    if (f.method === 'delivery') {
      if (!f.gov) e.gov = 'اختر المحافظة'
      if (!f.city.trim()) e.city = 'اكتب المدينة أو الحي'
      if (f.address.trim().length < 8) e.address = 'اكتب العنوان بالتفصيل: الشارع ورقم العمارة'
    }
  }
  if (step === 2) {
    if (f.payment === 'vodafone' && !PHONE.test(f.ref)) e.ref = 'اكتب رقم المحفظة التي حوّلت منها'
    if (f.payment === 'instapay' && !/^\d{6,}$/.test(f.ref)) e.ref = 'الرقم المرجعي أرقام فقط، ٦ على الأقل'
    if (f.payment === 'card') {
      if (f.card.replace(/\s/g, '').length !== 16) e.card = 'رقم البطاقة ١٦ رقمًا'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.exp)) e.exp = 'بصيغة MM/YY'
      if (!/^\d{3}$/.test(f.cvv)) e.cvv = '٣ أرقام'
    }
  }
  return e
}

export function useCheckout() {
  const { lines, coupon, setCoupon, addOrder, clearCart } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState({})
  const [code, setCode] = useState(coupon)
  const [f, setF] = useState({ name: '', phone: '', method: 'delivery', gov: '', city: '', address: '', notes: '', payment: 'cod', ref: '', card: '', exp: '', cvv: '' })
  const up = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErr((s) => ({ ...s, [k]: null })) }
  const q = { ...quote({ lines, gov: f.gov, method: f.method, payment: f.payment, coupon }), method: f.method }
  const pay = PAYMENTS.find((p) => p.id === f.payment)

  // check(1) validates one step, check(1, 2) a whole single-page form
  const check = (...steps) => {
    const e = Object.assign({}, ...steps.map((s) => errorsFor(s, f)))
    setErr(e)
    return !Object.keys(e).length
  }
  const next = () => check(step) && setStep(step + 1)

  const place = () => {
    setBusy(true)
    setTimeout(() => {
      const id = 'HZ-' + Date.now().toString(36).toUpperCase().slice(-6)
      addOrder({
        id, date: new Date().toISOString(),
        lines: lines.map(({ id, title, author, img, price, qty }) => ({ id, title, author, img, price, qty })),
        customer: { name: f.name.trim(), phone: f.phone, method: f.method, gov: f.gov, city: f.city, address: f.address, notes: f.notes },
        payment: f.payment, ref: f.ref, last4: f.card.replace(/\s/g, '').slice(-4),
        coupon: q.applied ? coupon.toUpperCase() : '', days: q.zone?.days,
        totals: { subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, freeShipping: q.freeShipping, codFee: q.codFee, total: q.total },
      })
      clearCart(); setCoupon('')
      nav(`/order/${id}`, { replace: true })
    }, 1100)
  }
  return { lines, f, setF, up, err, setErr, step, setStep, busy, q, pay, check, next, place, coupon, setCoupon, code, setCode }
}

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'bad' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  )
}

export function DeliveryStep({ c }) {
  const { f, setF, up, err, setErr, q } = c
  return (
    <>
      <button type="button" className="link demo-fill" onClick={() => { setF((s) => ({ ...s, ...DEMO, method: 'delivery' })); setErr({}) }}>املأ ببيانات تجريبية</button>
      <div className="row2">
        <Field label="الاسم" error={err.name}><input value={f.name} onChange={up('name')} autoComplete="name" /></Field>
        <Field label="رقم الموبايل" error={err.phone}><input value={f.phone} onChange={up('phone')} inputMode="numeric" dir="ltr" placeholder="01XXXXXXXXX" autoComplete="tel" /></Field>
      </div>
      <div className="choice" role="radiogroup" aria-label="طريقة الاستلام">
        {[['delivery', 'truck', 'توصيل للعنوان', 'لجميع المحافظات'], ['pickup', 'store', 'استلام من المكتبة', 'وسط البلد — بدون رسوم']].map(([id, icon, t, d]) => (
          <label key={id} className={f.method === id ? 'on' : ''}>
            <input type="radio" name="method" checked={f.method === id} onChange={() => setF((s) => ({ ...s, method: id }))} />
            <Icon name={icon} size={22} /><b>{t}</b><small>{d}</small>
          </label>
        ))}
      </div>
      {f.method === 'delivery' ? (
        <>
          <div className="row2">
            <Field label="المحافظة" error={err.gov}>
              <select value={f.gov} onChange={up('gov')}>
                <option value="">اختر المحافظة</option>
                {ZONES.map((z) => <optgroup key={z.id} label={`${z.name} — ${money(z.fee)}`}>{z.govs.map((g) => <option key={g}>{g}</option>)}</optgroup>)}
              </select>
            </Field>
            <Field label="المدينة / الحي" error={err.city}><input value={f.city} onChange={up('city')} /></Field>
          </div>
          <Field label="العنوان بالتفصيل" error={err.address}><input value={f.address} onChange={up('address')} autoComplete="street-address" /></Field>
          {q.zone && <p className="note" key={f.gov}><Icon name="truck" /> التوصيل إلى {f.gov}: <b>{q.freeShipping ? 'مجاني' : money(q.shipping)}</b> — خلال {q.zone.days}</p>}
        </>
      ) : (
        <p className="note"><Icon name="pin" /> {STORE.address} — {STORE.landmark}. سنراسلك على واتساب عند تجهيز الطلب.</p>
      )}
      <Field label="ملاحظات للمكتبة (اختياري)"><textarea rows="2" value={f.notes} onChange={up('notes')} /></Field>
    </>
  )
}

export function PaymentStep({ c }) {
  const { f, setF, up, err, setErr, q, pay } = c
  return (
    <>
      <div className="pay-list" role="radiogroup" aria-label="طريقة الدفع">
        {PAYMENTS.map((p) => (
          <label key={p.id} className={f.payment === p.id ? 'on' : ''}>
            <input type="radio" name="payment" checked={f.payment === p.id} onChange={() => { setF((s) => ({ ...s, payment: p.id, ref: '' })); setErr({}) }} />
            <span className={`pay-logo pay-${p.id}`}>{p.id === 'cod' ? 'كاش' : p.id === 'vodafone' ? 'VF' : p.id === 'instapay' ? 'IP' : '••••'}</span>
            <span><b>{p.name}</b><small>{p.id === 'cod' && f.method === 'pickup' ? 'ادفع نقدًا عند الاستلام من المكتبة' : p.hint}</small></span>
          </label>
        ))}
      </div>
      {pay.needsRef && (
        <div className="pay-box">
          <p>حوّل <b>{money(q.total)}</b> إلى:</p>
          <p className="pay-target" dir="ltr">{f.payment === 'vodafone' ? STORE.mobile : 'hamazat@instapay'}</p>
          <small>بيانات تحويل تجريبية للعرض فقط — لا تحوّل أي مبلغ فعلي.</small>
          <Field label={f.payment === 'vodafone' ? 'رقم المحفظة المحوِّلة' : 'الرقم المرجعي للتحويل'} error={err.ref}>
            <input value={f.ref} onChange={up('ref')} inputMode="numeric" dir="ltr" />
          </Field>
        </div>
      )}
      {f.payment === 'card' && (
        <div className="pay-box">
          <small>بوابة دفع تجريبية — لا تُرسل ولا تُحفظ بيانات البطاقة.</small>
          <Field label="رقم البطاقة" error={err.card}>
            <input value={f.card} dir="ltr" inputMode="numeric" placeholder="0000 0000 0000 0000" autoComplete="off"
              onChange={(e) => up('card')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ') } })} />
          </Field>
          <div className="row2">
            <Field label="تاريخ الانتهاء" error={err.exp}><input value={f.exp} onChange={up('exp')} dir="ltr" placeholder="MM/YY" maxLength="5" autoComplete="off" /></Field>
            <Field label="CVV" error={err.cvv}><input value={f.cvv} onChange={up('cvv')} dir="ltr" inputMode="numeric" maxLength="3" autoComplete="off" /></Field>
          </div>
        </div>
      )}
    </>
  )
}

export function ReviewStep({ c }) {
  const { f, q, pay, setStep } = c
  return (
    <dl className="review">
      <div><dt>المستلم</dt><dd>{f.name}<br /><span dir="ltr">{f.phone}</span></dd><button type="button" className="link" onClick={() => setStep(1)}>تعديل</button></div>
      <div><dt>{f.method === 'pickup' ? 'الاستلام' : 'العنوان'}</dt><dd>{f.method === 'pickup' ? `من المكتبة — ${STORE.address}` : <>{f.gov}، {f.city}<br />{f.address}<br /><small>يصل خلال {q.zone?.days}</small></>}</dd><button type="button" className="link" onClick={() => setStep(1)}>تعديل</button></div>
      <div><dt>الدفع</dt><dd>{pay.name}{f.ref && <><br /><span dir="ltr">{f.ref}</span></>}{f.payment === 'card' && <><br /><span dir="ltr">•••• {f.card.slice(-4)}</span></>}</dd><button type="button" className="link" onClick={() => setStep(2)}>تعديل</button></div>
      {f.notes && <div><dt>ملاحظات</dt><dd>{f.notes}</dd></div>}
    </dl>
  )
}

export function Coupon({ c }) {
  const { q, coupon, setCoupon, code, setCode } = c
  return (
    <form className="coupon" onSubmit={(e) => { e.preventDefault(); setCoupon(code.trim()) }}>
      <label htmlFor="coupon"><Icon name="tag" size={15} /> كوبون الخصم</label>
      <div>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" placeholder="HAMAZAT10" />
        <button type="submit" className="btn btn-sm">طبّق</button>
      </div>
      {q.couponError && <small className="bad" role="alert">{q.couponError}</small>}
      {q.applied && <small className="ok"><Icon name="check" size={13} /> {q.applied.label} <button type="button" className="link" onClick={() => { setCoupon(''); setCode('') }}>إزالة</button></small>}
      {!coupon && <small>للتجربة: {Object.keys(COUPONS).map((k) => <button type="button" key={k} className="link" dir="ltr" onClick={() => { setCode(k); setCoupon(k) }}>{k}</button>)}</small>}
    </form>
  )
}

export function Summary({ q, lines, children }) {
  return (
    <aside className="summary">
      <h2>ملخص الطلب</h2>
      <ul>
        {lines.map((l) => (
          <li key={l.id}><img src={l.img} alt="" /><span>{l.title}<small>× {num(l.qty)}</small></span><b>{money(l.price * l.qty)}</b></li>
        ))}
      </ul>
      {children}
      <dl>
        <div><dt>المجموع</dt><dd>{money(q.subtotal)}</dd></div>
        {q.discount > 0 && <div className="minus"><dt>الخصم</dt><dd>− {money(q.discount)}</dd></div>}
        <div><dt>الشحن</dt><dd>{q.method === 'pickup' ? 'استلام من المكتبة' : q.freeShipping ? 'مجاني' : q.zone || q.shipping ? money(q.shipping) : 'اختر المحافظة'}</dd></div>
        {q.codFee > 0 && <div><dt>رسوم التحصيل</dt><dd>{money(q.codFee)}</dd></div>}
        <div className="total"><dt>الإجمالي</dt><dd key={q.total}>{money(q.total)}</dd></div>
      </dl>
    </aside>
  )
}

export function PlaceButton({ c, onClick }) {
  return (
    <button type="button" className="btn btn-leaf" onClick={onClick || c.place} disabled={c.busy}>
      {c.busy ? <><i className="spin" /> جارٍ تأكيد الطلب…</> : `أكّد الطلب — ${money(c.q.total)}`}
    </button>
  )
}
