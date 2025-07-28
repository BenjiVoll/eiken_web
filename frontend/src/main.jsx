import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/globals.css'
import './styles/animations.css'
import './styles/navbar.css'
import './styles/form.css'
import './styles/auth.css'
import './styles/services.css'
import './styles/quotes.css'
import './styles/popup.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
