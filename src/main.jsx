import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const setDarkMode = (enabled) => document.documentElement.classList.toggle('dark', enabled)

setDarkMode(prefersDark.matches)
if (prefersDark.addEventListener) {
  prefersDark.addEventListener('change', (event) => setDarkMode(event.matches))
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
