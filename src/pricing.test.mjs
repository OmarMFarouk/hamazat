import assert from 'node:assert/strict'
import { quote } from './pricing.js'

const one = [{ price: 300, qty: 1 }]
let q = quote({ lines: one, gov: 'القاهرة', payment: 'cod' })
assert.deepEqual([q.subtotal, q.shipping, q.codFee, q.total], [300, 50, 15, 365])

q = quote({ lines: one, gov: 'أسوان', payment: 'instapay', coupon: 'hamazat10' })
assert.deepEqual([q.discount, q.shipping, q.total], [30, 85, 355])

// fixed coupon below its minimum is rejected and discounts nothing
q = quote({ lines: one, gov: 'القاهرة', coupon: 'WELCOME50' })
assert.ok(q.couponError); assert.equal(q.discount, 0)
assert.ok(quote({ lines: one, coupon: 'NOPE' }).couponError)

// extra-item surcharge: 5 items in Delta = 65 + 2*10
q = quote({ lines: [{ price: 100, qty: 5 }], gov: 'الغربية', coupon: 'WELCOME50' })
assert.deepEqual([q.discount, q.shipping, q.total], [50, 85, 535])

// free shipping: by coupon, and by threshold measured after discount
assert.equal(quote({ lines: one, gov: 'مطروح', coupon: 'FREESHIP' }).shipping, 0)
assert.equal(quote({ lines: [{ price: 1500, qty: 1 }], gov: 'القاهرة' }).shipping, 0)
assert.equal(quote({ lines: [{ price: 1500, qty: 1 }], gov: 'القاهرة', coupon: 'HAMAZAT10' }).shipping, 50)

// pickup: no shipping, no COD fee
q = quote({ lines: one, method: 'pickup', payment: 'cod' })
assert.equal(q.total, 300)
assert.equal(quote({ lines: [] , gov: 'القاهرة', payment: 'cod' }).total, 0)
console.log('pricing ok')
