import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { bookById } from './data.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}
function usePersisted(key, initial) {
  const [v, set] = useState(() => load(key, initial))
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }, [key, v])
  return [v, set]
}

export function StoreProvider({ children }) {
  const [cart, setCart] = usePersisted('hz.cart', {}) // { [bookId]: qty }
  const [wish, setWish] = usePersisted('hz.wish', [])
  const [orders, setOrders] = usePersisted('hz.orders', [])
  const [coupon, setCoupon] = usePersisted('hz.coupon', '')
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const value = useMemo(() => {
    const lines = Object.entries(cart).map(([id, qty]) => ({ ...bookById(id), qty })).filter((l) => l.title)
    const setQty = (id, qty) => setCart((c) => {
      const n = { ...c }
      if (qty <= 0) delete n[id]; else n[id] = Math.min(qty, 20)
      return n
    })
    return {
      lines, count: lines.reduce((s, l) => s + l.qty, 0),
      add: (id, qty = 1) => { setQty(id, (cart[id] || 0) + qty); setToast('أُضيف إلى السلة'); },
      setQty, clearCart: () => setCart({}),
      wish, toggleWish: (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      orders, addOrder: (o) => setOrders((os) => [o, ...os]),
      coupon, setCoupon,
      drawer, setDrawer, toast, setToast,
    }
  }, [cart, wish, orders, coupon, drawer, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
