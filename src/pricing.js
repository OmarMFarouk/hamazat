import { COUPONS, COD_FEE, EXTRA_ITEM_FEE, FREE_SHIPPING_FROM, zoneOf } from './data.js'

// lines: [{ price, qty }]. Returns every number the checkout shows.
export function quote({ lines, gov, method = 'delivery', payment, coupon }) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const c = COUPONS[coupon?.trim().toUpperCase()]
  let couponError = null
  let discount = 0
  if (coupon && !c) couponError = 'الكوبون غير صحيح'
  else if (c?.min && subtotal < c.min) couponError = `هذا الكوبون للطلبات من ${c.min} ج.م`
  else if (c?.type === 'percent') discount = Math.round((subtotal * c.value) / 100)
  else if (c?.type === 'fixed') discount = Math.min(c.value, subtotal)
  const applied = c && !couponError ? c : null

  const zone = zoneOf(gov)
  let shipping = 0
  let freeShipping = false
  if (method === 'delivery' && zone && count) {
    shipping = zone.fee + Math.max(0, count - 3) * EXTRA_ITEM_FEE
    if (applied?.type === 'shipping' || subtotal - discount >= FREE_SHIPPING_FROM) {
      shipping = 0
      freeShipping = true
    }
  }
  const codFee = payment === 'cod' && method === 'delivery' && count ? COD_FEE : 0
  return { subtotal, count, discount, shipping, freeShipping, codFee, zone, applied, couponError, total: subtotal - discount + shipping + codFee }
}
