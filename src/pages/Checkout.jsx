import { Link } from 'react-router-dom'
import { Coupon, DeliveryStep, PaymentStep, PlaceButton, ReviewStep, STEPS, STEP_TITLES, Summary, useCheckout } from '../checkout.jsx'
import { Empty, Icon, Ring } from '../ui.jsx'

export default function Checkout() {
  const c = useCheckout()
  const { step, setStep, lines, q } = c

  if (!lines.length) {
    return <div className="wrap block"><Empty title="لا يوجد ما تدفع ثمنه بعد. أضف كتابًا إلى السلة أولًا."><Link to="/shop" className="btn btn-ghost">تصفّح الكتب</Link></Empty></div>
  }

  return (
    <div className="wrap block checkout">
      <div className="steps-col">
        <div className="checkout-head">
          <div>
            {step > 1 && <button type="button" className="link back" onClick={() => setStep(step - 1)}><Icon name="back" size={12} /> رجوع</button>}
            <h1>{STEP_TITLES[step - 1]}</h1>
            <ol className="crumb-steps">{STEPS.map((s, i) => <li key={s} className={i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}>{s}</li>)}</ol>
          </div>
          <Ring step={step} of={3} />
        </div>

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
