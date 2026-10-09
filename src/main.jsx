import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { LayoutProvider } from './layout.jsx'
import { StoreProvider } from './store.jsx'
import './styles.css'
import './layout.css'
import './layouts/reading.css'
import './layouts/shelf.css'
import './layouts/night.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <LayoutProvider>
          <App />
        </LayoutProvider>
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
)
