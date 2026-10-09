import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Order, Orders } from './pages/Orders.jsx'
import { About, NotFound } from './pages/Misc.jsx'

// One route table for every layout. A layout passes its own pages; orders and
// about are shared and restyled through CSS. Only the reading room has a cart page.
export default function Pages({ Home, Shop, Book, Checkout, Wishlist, Cart }) {
  const { pathname } = useLocation()
  return (
    <main id="main" key={pathname} className="page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/book/:id" element={<Book />} />
        <Route path="/cart" element={Cart ? <Cart /> : <Navigate to="/checkout" replace />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<Order />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}
